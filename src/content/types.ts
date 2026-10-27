import type { TestSpec } from '@/workers/protocol'

/** A multiple-choice checkpoint question. */
export interface QuizQuestion {
  id: string
  /** Markdown (inline code etc.). */
  question: string
  options: string[]
  /** Index into `options`. */
  answer: number
  /** Shown after answering; explains why, whether the learner was right or wrong. */
  explanation: string
}

export interface Exercise {
  /** Unique within its lesson, e.g. "e1". Stored with attempts, so never rename once published. */
  id: string
  title: string
  /** Markdown task description. */
  prompt: string
  starter: string
  /** Reference solution. A unit test runs it against `tests`, so it always passes. */
  solution: string
  /** Visible tests, plus hidden ones (`hidden: true`) that guard against hard-coding. */
  tests: TestSpec[]
  /**
   * The hint ladder, gentlest first: a nudge, a pointed question, then a concrete hint.
   * None of them may contain the full answer; that lives in `explanation`.
   */
  hints: [nudge: string, question: string, concrete: string]
  /** The full explanation, only shown when the learner clicks "I'm stuck". Markdown. */
  explanation: string
}

export interface Lesson {
  /** Globally unique and permanent: progress is keyed by it. */
  id: string
  /** Id of a `ModuleMeta`. */
  module: string
  title: string
  /** Estimated minutes to complete. */
  minutes: number
  /** One sentence on what the learner should be able to do afterwards; Pythia uses it as context. */
  goal: string
  /** Short summary for lists and cards. */
  summary: string
  /** Markdown: the concept. Supports ```python run snippets and ```diagram blocks. */
  concept: string
  example: {
    title: string
    /** Markdown walkthrough shown beside the code. */
    explanation: string
    code: string
  }
  /** 2 to 5 exercises. */
  exercises: Exercise[]
  /** A short checkpoint, 2 to 4 questions. */
  quiz: QuizQuestion[]
}

export interface ModuleMeta {
  id: string
  track: string
  title: string
  blurb: string
}
