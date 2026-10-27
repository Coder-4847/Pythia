import { useCallback, useEffect, useRef, useState } from 'react'
import { translateError } from '@/features/pythia/translateError'
import { runtime, useRuntimeState } from '@/features/runtime/runtime'
import type { RunResult, SourceFile, TestReport, TestSpec } from '@/workers/protocol'

export type ConsoleEntry =
  | { id: number; kind: 'stdout' | 'stderr' | 'stdin' | 'status' | 'info' | 'error'; text: string }
  | { id: number; kind: 'image'; png: string }
  /** Pythia's plain-English reading of an error, shown under the raw traceback. */
  | { id: number; kind: 'pythia'; headline: string; question: string }

/** Past this many characters, further program output is dropped (a runaway print loop must not freeze the tab). */
const MAX_OUTPUT_CHARS = 200_000

type TextKind = Exclude<ConsoleEntry['kind'], 'image' | 'pythia'>
type Pending = { kind: TextKind; text: string } | { kind: 'image'; png: string } | { kind: 'pythia'; headline: string; question: string }

/**
 * Drives one console: runs programs on the shared Python runtime, streams output
 * into `entries` (batched per animation frame), and tracks input() prompts.
 */
export function useRunner() {
  const [entries, setEntries] = useState<ConsoleEntry[]>([])
  const [running, setRunning] = useState(false)
  const [prompt, setPrompt] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [lastResult, setLastResult] = useState<RunResult | null>(null)

  const nextId = useRef(0)
  const queue = useRef<Pending[]>([])
  const frame = useRef(0)
  const chars = useRef(0)
  const truncated = useRef(false)
  const active = useRef(false)

  const flush = useCallback(() => {
    frame.current = 0
    const batch = queue.current
    queue.current = []
    if (!batch.length) return
    setEntries((prev) => {
      const next = [...prev]
      for (const item of batch) {
        const last = next[next.length - 1]
        if (item.kind === 'image') {
          next.push({ id: nextId.current++, kind: 'image', png: item.png })
        } else if (item.kind === 'pythia') {
          next.push({ id: nextId.current++, kind: 'pythia', headline: item.headline, question: item.question })
        } else if (last && last.kind === item.kind && (item.kind === 'stdout' || item.kind === 'stderr')) {
          next[next.length - 1] = { ...last, text: last.text + item.text }
        } else {
          next.push({ id: nextId.current++, kind: item.kind, text: item.text })
        }
      }
      return next
    })
  }, [])

  const push = useCallback(
    (item: Pending) => {
      if (item.kind === 'stdout' || item.kind === 'stderr') {
        chars.current += item.text.length
        if (chars.current > MAX_OUTPUT_CHARS) {
          if (!truncated.current) {
            truncated.current = true
            queue.current.push({ kind: 'info', text: 'Output truncated: your program printed a lot. Is a loop running forever?' })
          }
          return
        }
      }
      queue.current.push(item)
      if (!frame.current) frame.current = requestAnimationFrame(flush)
    },
    [flush],
  )

  const run = useCallback(
    async (files: SourceFile[], main: string, stdin = ''): Promise<RunResult> => {
      if (active.current) throw new Error('already running')
      active.current = true
      queue.current = []
      chars.current = 0
      truncated.current = false
      setEntries([])
      setLastResult(null)
      setRunning(true)
      if (useRuntimeState.getState().status !== 'ready') push({ kind: 'status', text: 'Starting Python…' })
      try {
        const result = await runtime.runFiles(
          files,
          main,
          {
            onStdout: (text) => push({ kind: 'stdout', text }),
            onStderr: (text) => push({ kind: 'stderr', text }),
            onImage: (png) => push({ kind: 'image', png }),
            onStatus: (text) => push({ kind: 'status', text }),
            onInputRequest: (p) => setPrompt(p),
          },
          stdin ? stdin.split('\n') : [],
        )
        if (!result.ok && result.error) {
          const stopped = result.error.type === 'KeyboardInterrupt'
          push(
            stopped
              ? { kind: 'info', text: 'Stopped.' }
              : { kind: 'error', text: result.error.traceback || `${result.error.type}: ${result.error.message}` },
          )
          const reading = translateError(result.error)
          if (reading) push({ kind: 'pythia', ...reading })
        }
        setLastResult(result)
        return result
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        push({ kind: 'error', text: `Python could not start: ${message}` })
        const failed: RunResult = {
          ok: false,
          durationMs: 0,
          error: { type: 'RuntimeUnavailable', message, traceback: '', line: null, file: null },
        }
        setLastResult(failed)
        return failed
      } finally {
        active.current = false
        setPrompt(null)
        setRunning(false)
        if (frame.current) cancelAnimationFrame(frame.current)
        flush()
      }
    },
    [push, flush],
  )

  /** Run lesson tests against `main`. Shares the "one program at a time" rule with `run`. */
  const check = useCallback(async (files: SourceFile[], main: string, tests: TestSpec[]): Promise<TestReport> => {
    if (active.current) throw new Error('already running')
    active.current = true
    setRunning(true)
    setChecking(true)
    try {
      return await runtime.runTests(files, main, tests, { onStatus: () => {} })
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return {
        error: { type: 'RuntimeUnavailable', message, traceback: `Python could not start: ${message}`, line: null, file: null },
        results: [],
        durationMs: 0,
      }
    } finally {
      active.current = false
      setChecking(false)
      setRunning(false)
    }
  }, [])

  const stop = useCallback(() => runtime.stop(), [])

  const submitInput = useCallback(
    (text: string) => {
      push({ kind: 'stdin', text: `${text}\n` })
      setPrompt(null)
      runtime.provideInput(text)
    },
    [push],
  )

  const clear = useCallback(() => {
    queue.current = []
    setEntries([])
  }, [])

  // Leaving the page must not leave a program running in the background.
  useEffect(
    () => () => {
      if (active.current) runtime.stop()
    },
    [],
  )

  return { entries, running, checking, prompt, lastResult, run, check, stop, submitInput, clear }
}
