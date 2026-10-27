import { create } from 'zustand'
import {
  INPUT_CANCELLED,
  INPUT_MAX_BYTES,
  INPUT_READY,
  type FromWorker,
  type RunResult,
  type SharedBuffers,
  type SourceFile,
  type TestReport,
  type TestSpec,
  type ToWorker,
} from '@/workers/protocol'

declare const __PYODIDE_VERSION__: string

/** Self-hosted Pyodide can be selected at build time; the default is the official CDN. */
const PYODIDE_BASE: string =
  import.meta.env.VITE_PYODIDE_BASE || `https://cdn.jsdelivr.net/pyodide/v${__PYODIDE_VERSION__}/full/`

/** How long Stop waits for a polite KeyboardInterrupt before killing the worker. */
const STOP_GRACE_MS = 1500

export type RuntimeStatus = 'idle' | 'loading' | 'ready' | 'error'

interface RuntimeState {
  status: RuntimeStatus
  python: string | null
  error: string | null
  /** True when SharedArrayBuffer is available: real input() and interruptible Stop. */
  isolated: boolean
}

export const useRuntimeState = create<RuntimeState>(() => ({
  status: 'idle',
  python: null,
  error: null,
  isolated: typeof SharedArrayBuffer !== 'undefined' && globalThis.crossOriginIsolated === true,
}))

/** Callbacks for one run. The runtime only ever has one run in flight. */
export interface RunHandlers {
  onStdout: (text: string) => void
  onStderr: (text: string) => void
  onImage: (png: string) => void
  onStatus: (text: string) => void
  onInputRequest: (prompt: string) => void
}

interface InFlight {
  id: number
  handlers: RunHandlers
  /** Called with the program's result, or with a "stopped" result if the worker was killed. */
  resolve: (r: RunResult) => void
  resolveTests?: (r: TestReport) => void
}

const STOPPED: RunResult = {
  ok: false,
  durationMs: 0,
  error: { type: 'KeyboardInterrupt', message: 'Stopped', traceback: '', line: null, file: null },
}

class PythonRuntime {
  private worker: Worker | null = null
  private ready: Promise<void> | null = null
  private shared: SharedBuffers | null = null
  private nextId = 1
  private run: InFlight | null = null
  private installs = new Map<number, (r: { ok: boolean; message: string }) => void>()
  private stopTimer: ReturnType<typeof setTimeout> | null = null

  /** Start loading Python (idempotent). Resolves when `run` can be called. */
  ensureReady(): Promise<void> {
    if (!this.ready) this.ready = this.boot()
    return this.ready
  }

  private boot(): Promise<void> {
    useRuntimeState.setState({ status: 'loading', error: null })
    const isolated = useRuntimeState.getState().isolated
    this.shared = isolated
      ? { interrupt: new SharedArrayBuffer(1), input: new SharedArrayBuffer(8 + INPUT_MAX_BYTES) }
      : null

    const worker = new Worker(new URL('../../workers/pyodide.worker.ts', import.meta.url), { type: 'module' })
    this.worker = worker
    return new Promise<void>((resolve, reject) => {
      worker.onmessage = (event: MessageEvent<FromWorker>) => {
        const msg = event.data
        if (msg.type === 'ready') {
          useRuntimeState.setState({ status: 'ready', python: msg.python })
          resolve()
        } else if (msg.type === 'init-error') {
          useRuntimeState.setState({ status: 'error', error: msg.message })
          this.ready = null
          reject(new Error(msg.message))
        } else {
          this.dispatch(msg)
        }
      }
      worker.onerror = (e) => {
        useRuntimeState.setState({ status: 'error', error: e.message })
        this.ready = null
        reject(new Error(e.message))
      }
      this.post({ type: 'init', baseUrl: PYODIDE_BASE, shared: this.shared })
    })
  }

  private post(msg: ToWorker) {
    this.worker?.postMessage(msg)
  }

  private dispatch(msg: FromWorker) {
    const run = this.run
    switch (msg.type) {
      case 'stdout':
        if (run?.id === msg.id) run.handlers.onStdout(msg.text)
        break
      case 'stderr':
        if (run?.id === msg.id) run.handlers.onStderr(msg.text)
        break
      case 'image':
        if (run?.id === msg.id) run.handlers.onImage(msg.png)
        break
      case 'status':
        if (run?.id === msg.id) run.handlers.onStatus(msg.text)
        break
      case 'input-request':
        if (run?.id === msg.id) run.handlers.onInputRequest(msg.prompt)
        break
      case 'done':
        if (run?.id === msg.id) {
          this.clearStopTimer()
          this.run = null
          run.resolve(msg.result)
        }
        break
      case 'tests-done':
        if (run?.id === msg.id && run.resolveTests) {
          this.clearStopTimer()
          this.run = null
          run.resolveTests(msg.report)
        }
        break
      case 'install-done':
        this.installs.get(msg.id)?.({ ok: msg.ok, message: msg.message })
        this.installs.delete(msg.id)
        break
    }
  }

  /** Run `main` from `files`. `stdinLines` only matters when input() can't block (no isolation). */
  async runFiles(files: SourceFile[], main: string, handlers: RunHandlers, stdinLines: string[] = []): Promise<RunResult> {
    await this.ensureReady()
    if (this.run) throw new Error('A program is already running')
    const id = this.nextId++
    return new Promise<RunResult>((resolve) => {
      this.run = { id, handlers, resolve }
      this.post({ type: 'run', id, files, main, stdinLines })
    })
  }

  /** Run lesson tests against `main`. Output is captured, not streamed; `handlers` still gets status lines. */
  async runTests(files: SourceFile[], main: string, tests: TestSpec[], handlers: Pick<RunHandlers, 'onStatus'>): Promise<TestReport> {
    await this.ensureReady()
    if (this.run) throw new Error('A program is already running')
    const id = this.nextId++
    return new Promise<TestReport>((resolve) => {
      this.run = {
        id,
        handlers: { onStdout: () => {}, onStderr: () => {}, onImage: () => {}, onInputRequest: () => {}, ...handlers },
        resolve: () => resolve({ error: null, results: [], durationMs: 0, stopped: true }),
        resolveTests: resolve,
      }
      this.post({ type: 'test', id, files, main, tests })
    })
  }

  /** Answer the pending input() call. */
  provideInput(text: string) {
    if (!this.shared) return
    const state = new Int32Array(this.shared.input)
    const bytes = new TextEncoder().encode(text).slice(0, INPUT_MAX_BYTES)
    new Uint8Array(this.shared.input, 8, bytes.length).set(bytes)
    Atomics.store(state, 1, bytes.length)
    Atomics.store(state, 0, INPUT_READY)
    Atomics.notify(state, 0)
  }

  /** Interrupt the running program; if Python doesn't yield in time, restart the worker. */
  stop() {
    if (!this.run) return
    if (!this.shared) return this.restart()
    new Uint8Array(this.shared.interrupt)[0] = 2 // SIGINT, polled by the interpreter
    const state = new Int32Array(this.shared.input)
    Atomics.store(state, 0, INPUT_CANCELLED) // also wakes a pending input()
    Atomics.notify(state, 0)
    this.clearStopTimer()
    this.stopTimer = setTimeout(() => this.restart(), STOP_GRACE_MS)
  }

  private clearStopTimer() {
    if (this.stopTimer) clearTimeout(this.stopTimer)
    this.stopTimer = null
  }

  /** Kill the worker (e.g. a long NumPy call that never checks for Ctrl-C) and boot a fresh one. */
  private restart() {
    this.clearStopTimer()
    this.worker?.terminate()
    this.worker = null
    this.ready = null
    const run = this.run
    this.run = null
    for (const resolve of this.installs.values()) resolve({ ok: false, message: 'Python was restarted' })
    this.installs.clear()
    run?.resolve(STOPPED)
    void this.ensureReady().catch(() => {})
  }

  /** Install pure-Python packages from PyPI via micropip. */
  async install(packages: string[]): Promise<{ ok: boolean; message: string }> {
    await this.ensureReady()
    const id = this.nextId++
    return new Promise((resolve) => {
      this.installs.set(id, resolve)
      this.post({ type: 'install', id, packages })
    })
  }
}

export const runtime = new PythonRuntime()
