import { MODULES } from '@/content/modules'
import { parseLesson } from '@/content/parseLesson'
import { TRACKS, type TrackMeta } from '@/content/tracks'
import type { Lesson, ModuleMeta } from '@/content/types'
import type { TestSpec } from '@/workers/protocol'

/**
 * Loads every lesson under ./tracks. A lesson is `NN-slug.md` plus `NN-slug.tests.ts`
 * (default export: exercise id → tests). Files are ordered by path, so numeric prefixes
 * set the order within a track.
 */
const markdown = import.meta.glob('./tracks/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const testFiles = import.meta.glob('./tracks/**/*.tests.ts', { eager: true, import: 'default' }) as Record<string, Record<string, TestSpec[]>>

export interface CatalogLesson extends Lesson {
  track: string
  /** Position within its track, 0-based. */
  index: number
}

function load(): CatalogLesson[] {
  const byTrack = new Map<string, Lesson[]>()
  for (const path of Object.keys(markdown).sort()) {
    const lesson = parseLesson(markdown[path]!, testFiles[path.replace(/\.md$/, '.tests.ts')] ?? {}, path)
    const module = MODULES.find((m) => m.id === lesson.module)
    if (!module) throw new Error(`${path}: unknown module "${lesson.module}"`)
    byTrack.set(module.track, [...(byTrack.get(module.track) ?? []), lesson])
  }
  // Group by track in curriculum order; within a track, keep file order but cluster by module order.
  return TRACKS.flatMap((track) => {
    const moduleOrder = MODULES.filter((m) => m.track === track.id).map((m) => m.id)
    const lessons = [...(byTrack.get(track.id) ?? [])].sort((a, b) => moduleOrder.indexOf(a.module) - moduleOrder.indexOf(b.module))
    return lessons.map((l, index) => ({ ...l, track: track.id, index }))
  })
}

export const LESSONS: CatalogLesson[] = load()

const byId = new Map(LESSONS.map((l) => [l.id, l]))

export const getLesson = (id: string) => byId.get(id)

export const lessonsInTrack = (trackId: string) => LESSONS.filter((l) => l.track === trackId)

export const lessonsInModule = (moduleId: string) => LESSONS.filter((l) => l.module === moduleId)

/** Modules of a track that have at least one lesson. */
export const modulesInTrack = (trackId: string): ModuleMeta[] => MODULES.filter((m) => m.track === trackId && lessonsInModule(m.id).length > 0)

export const trackById = (id: string): TrackMeta | undefined => TRACKS.find((t) => t.id === id)

/** Previous/next lesson in curriculum order, crossing track boundaries. */
export function neighbours(id: string): { prev: CatalogLesson | null; next: CatalogLesson | null } {
  const at = LESSONS.findIndex((l) => l.id === id)
  return { prev: LESSONS[at - 1] ?? null, next: LESSONS[at + 1] ?? null }
}

/** The lesson immediately before `id` within the same track (used for the soft "locked" hint). */
export function previousInTrack(id: string): CatalogLesson | null {
  const lesson = byId.get(id)
  return lesson && lesson.index > 0 ? (lessonsInTrack(lesson.track)[lesson.index - 1] ?? null) : null
}
