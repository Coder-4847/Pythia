/** Messages exchanged between the main thread and the Pyodide worker. */

export interface SourceFile {
  name: string
  code: string
}

export interface PyError {
  type: string
  message: string
  traceback: string
  line: number | null
  file: string | null
}

export interface RunResult {
  ok: boolean
  error?: PyError
  durationMs: number
}

/** One thing Pythia noticed in the learner's code. Never contains the fix, only questions and graded help. */
export interface Diagnostic {
  /** Stable for the same rule on the same line, so UI state (revealed hints) survives re-analysis. */
  id: string
  rule: string
  /** 1-based line. */
  line: number
  col: number
  /** 1 essential (a certain crash) · 2 helpful (a likely bug) · 3 chatty (tidiness). */
  level: 1 | 2 | 3
  category: 'syntax' | 'name' | 'type' | 'logic' | 'style'
  /** The guiding question: what Pythia shows first. */
  question: string
  /** A concrete pointer, revealed on request. */
  hint: string
  /** The full explanation, revealed only on "I'm stuck". */
  explanation: string
  source: 'local' | 'ai'
}

/** One lesson test, as plain JSON the Python test runner interprets. */
export type TestSpec = {
  name: string
  /** Hidden tests report pass/fail only, never their inputs or expected values. */
  hidden?: boolean
  /** Shown when the test fails (for hidden tests, instead of the details). */
  hint?: string
  /** Lines fed to input() while this test runs. */
  stdin?: string[]
} & (
  | { kind: 'call'; fn: string; args?: unknown[]; kwargs?: Record<string, unknown>; expected: unknown }
  | { kind: 'output'; expected: string }
  | { kind: 'var'; variable: string; expected: unknown }
  | { kind: 'check'; code: string }
)

export interface TestResult {
  name: string
  hidden: boolean
  passed: boolean
  message: string | null
  expected: string | null
  got: string | null
}

export interface TestReport {
  /** Set when the code could not run at all (e.g. a syntax error), so no test was attempted. */
  error: PyError | null
  results: TestResult[]
  durationMs: number
  stopped?: boolean
}

/** SharedArrayBuffers that make Stop and input() work; absent without cross-origin isolation. */
export interface SharedBuffers {
  /** 1 byte: Pyodide's interrupt flag (main writes 2 = SIGINT). */
  interrupt: SharedArrayBuffer
  /** Int32 [state, byteLength] followed by UTF-8 bytes of the learner's answer. */
  input: SharedArrayBuffer
}

export type ToWorker =
  | { type: 'init'; baseUrl: string; shared: SharedBuffers | null }
  | { type: 'run'; id: number; files: SourceFile[]; main: string; stdinLines: string[] }
  | { type: 'test'; id: number; files: SourceFile[]; main: string; tests: TestSpec[] }
  | { type: 'analyze'; id: number; code: string }
  | { type: 'install'; id: number; packages: string[] }

export type FromWorker =
  | { type: 'ready'; python: string }
  | { type: 'init-error'; message: string }
  | { type: 'status'; id: number; text: string }
  | { type: 'stdout' | 'stderr'; id: number; text: string }
  | { type: 'image'; id: number; png: string }
  | { type: 'input-request'; id: number; prompt: string }
  | { type: 'done'; id: number; result: RunResult }
  | { type: 'tests-done'; id: number; report: TestReport }
  | { type: 'analysis'; id: number; diagnostics: Diagnostic[] }
  | { type: 'install-done'; id: number; ok: boolean; message: string }

/** Input handshake states in `SharedBuffers.input[0]`. */
export const INPUT_WAITING = 0
export const INPUT_READY = 1
export const INPUT_CANCELLED = 2
/** Largest single input() answer, in bytes. */
export const INPUT_MAX_BYTES = 64 * 1024
