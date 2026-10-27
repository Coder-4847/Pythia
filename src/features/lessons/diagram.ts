import { z } from 'zod'

/** Data-driven diagrams authors can embed with a ```diagram fence containing JSON. */
export const diagramSchema = z.discriminatedUnion('type', [
  /** Names pointing at values, like variables in memory. */
  z.object({
    type: z.literal('boxes'),
    caption: z.string().optional(),
    items: z.array(z.object({ name: z.string(), value: z.string(), note: z.string().optional() })).min(1).max(8),
  }),
  /** An indexed row of cells (list, string, tuple), with optional highlighted cells. */
  z.object({
    type: z.literal('strip'),
    caption: z.string().optional(),
    cells: z.array(z.string()).min(1).max(16),
    highlight: z.array(z.number().int()).optional(),
    /** Show negative indexes under the positive ones. */
    negative: z.boolean().optional(),
  }),
  /** A sequence of steps, revealed one after another (a loop's iterations, a call's journey). */
  z.object({
    type: z.literal('flow'),
    caption: z.string().optional(),
    steps: z.array(z.object({ label: z.string(), detail: z.string().optional() })).min(2).max(8),
  }),
])

export type DiagramSpec = z.infer<typeof diagramSchema>

/** Parse a diagram fence body; returns null (never throws) for invalid JSON or shapes. */
export function parseDiagram(json: string): DiagramSpec | null {
  try {
    const parsed = diagramSchema.safeParse(JSON.parse(json))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
