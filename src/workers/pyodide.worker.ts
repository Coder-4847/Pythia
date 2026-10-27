/// <reference lib="webworker" />
import type { PyodideInterface } from 'pyodide'
import { createEngine, type Engine } from '@/workers/engine'
import {
  INPUT_CANCELLED,
  INPUT_WAITING,
  type FromWorker,
  type SharedBuffers,
  type ToWorker,
} from '@/workers/protocol'

declare const self: DedicatedWorkerGlobalScope

const send = (msg: FromWorker) => self.postMessage(msg)

let engine: Engine | null = null
let shared: SharedBuffers | null = null
let currentId = 0
let cancelled = false
/** Without SharedArrayBuffer, input() is served from lines the learner typed before running. */
let stdinQueue: string[] = []

/** Block this worker until the main thread answers an input() request. */
function readLine(prompt: string): string | null {
  cancelled = false
  if (!shared) return stdinQueue.shift() ?? null

  const state = new Int32Array(shared.input)
  Atomics.store(state, 0, INPUT_WAITING)
  send({ type: 'input-request', id: currentId, prompt })
  while (Atomics.load(state, 0) === INPUT_WAITING) Atomics.wait(state, 0, INPUT_WAITING)

  const result = Atomics.load(state, 0)
  Atomics.store(state, 0, INPUT_WAITING)
  if (result === INPUT_CANCELLED) {
    cancelled = true
    return null
  }
  // TextDecoder can't read shared memory directly, so copy first.
  const bytes = new Uint8Array(shared.input, 8, Atomics.load(state, 1)).slice()
  return new TextDecoder().decode(bytes)
}

async function init(baseUrl: string, buffers: SharedBuffers | null) {
  shared = buffers
  try {
    const { loadPyodide } = (await import(/* @vite-ignore */ `${baseUrl}pyodide.mjs`)) as {
      loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInterface>
    }
    const py = await loadPyodide({ indexURL: baseUrl })
    if (shared) py.setInterruptBuffer(new Uint8Array(shared.interrupt))
    const wheel = await fetch(`${import.meta.env.BASE_URL}vendor/pyflakes-4.0.3-py2.py3-none-any.whl`)
      .then((r) => (r.ok ? r.arrayBuffer() : undefined))
      .catch(() => undefined) // offline or blocked: analysis falls back to Pythia's own rules
    engine = await createEngine(py, {
      stdout: (text) => send({ type: 'stdout', id: currentId, text }),
      stderr: (text) => send({ type: 'stderr', id: currentId, text }),
      image: (png) => send({ type: 'image', id: currentId, png }),
      status: (text) => send({ type: 'status', id: currentId, text }),
      readLine,
      wasCancelled: () => cancelled,
    }, wheel)
    send({ type: 'ready', python: py.runPython('import sys; sys.version.split()[0]') as string })
  } catch (e) {
    send({ type: 'init-error', message: e instanceof Error ? e.message : String(e) })
  }
}

self.onmessage = async (event: MessageEvent<ToWorker>) => {
  const msg = event.data
  if (msg.type === 'init') return init(msg.baseUrl, msg.shared)
  if (!engine) return

  currentId = msg.id
  if (msg.type === 'run') {
    if (shared) new Uint8Array(shared.interrupt)[0] = 0 // clear any stale Stop
    stdinQueue = [...msg.stdinLines]
    const result = await engine.run(msg.files, msg.main)
    send({ type: 'done', id: msg.id, result })
  } else if (msg.type === 'analyze') {
    send({ type: 'analysis', id: msg.id, diagnostics: engine.analyze(msg.code) })
  } else if (msg.type === 'test') {
    if (shared) new Uint8Array(shared.interrupt)[0] = 0
    const report = await engine.runTests(msg.files, msg.main, msg.tests)
    send({ type: 'tests-done', id: msg.id, report })
  } else {
    const { ok, message } = await engine.install(msg.packages)
    send({ type: 'install-done', id: msg.id, ok, message })
  }
}
