import { useEffect, useMemo, useRef, useState } from 'react'
import { aiConfigured, askPythia, createGate, hashText, LruCache, type AiFinding } from '@/features/pythia/aiClient'
import { runtime, useRuntimeState } from '@/features/runtime/runtime'
import { useSettings } from '@/stores/settings'
import type { Diagnostic } from '@/workers/protocol'

/** How long the learner must pause before local analysis runs, and before the AI is consulted. */
const LOCAL_IDLE_MS = 500
const AI_IDLE_MS = 1500
/** Don't bother the AI with fragments. */
const AI_MIN_CHARS = 20

/** Shared by every editor on the page, so total AI traffic is bounded no matter how many are open. */
const gate = createGate({ minIntervalMs: 8_000, maxPerWindow: 20, windowMs: 10 * 60_000 })
const cache = new LruCache<Diagnostic[]>(60)

const LEVEL_FOR = { quiet: 1, balanced: 2, chatty: 3 } as const

export type AiStatus = 'not-configured' | 'off' | 'idle' | 'thinking' | 'unavailable'

/** An AI finding in the same shape as a local diagnostic. Only questions get through. */
export function toDiagnostic(f: AiFinding): Diagnostic | null {
  if (!f.question.includes('?') || f.question.includes('```')) return null // Pythia asks; it never hands out code
  return {
    id: `ai:${f.line}`,
    rule: `ai-${f.category}`,
    line: f.line,
    col: 0,
    level: f.confidence >= 0.8 ? 2 : 3,
    category: f.category === 'runtime' ? 'type' : f.category === 'style' ? 'style' : 'logic',
    question: f.question,
    hint: 'Run the program and compare what you expected on this line with what you actually get.',
    explanation:
      'Pythia’s AI noticed something here but can’t say more without running your code. Run it, then compare what each variable holds on this line with what you expected.',
    source: 'ai',
  }
}

interface Options {
  code: string
  /** Lesson goal or exercise prompt; context for the AI. */
  goal?: string
  /** The error from the most recent run, if any. */
  lastError?: { type: string; message: string } | null
}

/**
 * Pythia's brain for one editor. Layer 1 (local rules in the worker) runs ~0.5 s after the last
 * keystroke. Layer 2 (AI) runs only if layer 1 found nothing, after ~1.5 s idle, and is cached,
 * throttled and silent on failure.
 */
export function usePythia({ code, goal, lastError }: Options) {
  const intensity = useSettings((s) => s.pythiaIntensity)
  const aiEnabled = useSettings((s) => s.aiEnabled)
  const ready = useRuntimeState((s) => s.status === 'ready')
  const level = LEVEL_FOR[intensity]
  const aiActive = aiConfigured && aiEnabled && intensity !== 'quiet'

  const [local, setLocal] = useState<{ code: string; diagnostics: Diagnostic[] } | null>(null)
  const [ai, setAi] = useState<{ code: string; diagnostics: Diagnostic[] } | null>(null)
  const [thinking, setThinking] = useState(false)
  const [unavailable, setUnavailable] = useState(false)
  const lastEdit = useRef(0)

  useEffect(() => {
    lastEdit.current = Date.now()
  }, [code])

  // Layer 1: local analysis.
  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => {
      void runtime.analyzeCode(code).then((diagnostics) => {
        if (diagnostics) setLocal({ code, diagnostics })
      })
    }, LOCAL_IDLE_MS)
    return () => clearTimeout(timer)
  }, [code, ready])

  const localHere = local && local.code === code ? local.diagnostics : null
  const localQuiet = localHere !== null && localHere.filter((d) => d.level <= level).length === 0
  const key = useMemo(() => hashText(`${goal ?? ''}\n${code}`), [goal, code])
  // An answer we already paid for is shown straight from the cache, with no request.
  const cached = aiActive && localQuiet ? cache.get(key) : undefined

  // Layer 2: AI, only when layer 1 has nothing to say about *this* code.
  useEffect(() => {
    if (!aiActive || !localQuiet || code.trim().length < AI_MIN_CHARS || code.split('\n').length < 2) return
    if (cached) return
    const controller = new AbortController()
    const delay = Math.max(200, AI_IDLE_MS - (Date.now() - lastEdit.current), gate.wait())
    const timer = setTimeout(async () => {
      if (!gate.allow()) return
      gate.record()
      setThinking(true)
      try {
        const findings = await askPythia({ code, goal, recentError: lastError ?? undefined }, controller.signal)
        const lines = code.split('\n').length
        const diagnostics = findings
          .filter((f) => f.confidence >= 0.6 && f.line <= lines)
          .map(toDiagnostic)
          .filter((d): d is Diagnostic => d !== null)
        cache.set(key, diagnostics)
        setAi({ code, diagnostics })
        setUnavailable(false)
      } catch {
        if (!controller.signal.aborted) {
          gate.backoff(60_000) // degrade silently to local-only for a minute
          setUnavailable(true)
        }
      } finally {
        setThinking(false)
      }
    }, delay)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // lastError and goal are context, not triggers: a new error alone shouldn't cost a request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, aiActive, localQuiet, cached, key])

  const diagnostics = useMemo(() => {
    const aiHere = cached ?? (ai && ai.code === code ? ai.diagnostics : [])
    const all = [...(local?.diagnostics ?? []), ...aiHere].filter((d) => d.level <= level)
    const seenLines = new Set<number>()
    return all
      .sort((a, b) => a.line - b.line || a.level - b.level)
      .filter((d) => (seenLines.has(d.line) ? false : (seenLines.add(d.line), true)))
  }, [local, ai, code, level, cached])

  const aiStatus: AiStatus = !aiConfigured ? 'not-configured' : !aiEnabled || intensity === 'quiet' ? 'off' : unavailable ? 'unavailable' : thinking ? 'thinking' : 'idle'
  return { diagnostics, aiStatus }
}
