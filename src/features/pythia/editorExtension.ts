import { RangeSet, StateEffect, StateField, type Extension } from '@codemirror/state'
import { Decoration, EditorView, GutterMarker, gutter, keymap, type DecorationSet } from '@codemirror/view'
import type { Diagnostic } from '@/workers/protocol'

/** Replace the diagnostics shown in the editor. */
export const setDiagnostics = StateEffect.define<Diagnostic[]>()

class PythiaMarker extends GutterMarker {
  constructor(readonly ids: string[]) {
    super()
  }
  eq(other: GutterMarker) {
    return other instanceof PythiaMarker && other.ids.join() === this.ids.join()
  }
  toDOM() {
    const dot = document.createElement('span')
    dot.className = 'cm-pythia-dot'
    return dot
  }
}

/** Reserves the gutter's width on every line, so text doesn't shift when the first dot appears. */
class Spacer extends GutterMarker {
  toDOM() {
    const el = document.createElement('span')
    el.className = 'cm-pythia-spacer'
    return el
  }
}

interface FieldValue {
  markers: RangeSet<GutterMarker>
  lines: DecorationSet
}

const lineDecoration = Decoration.line({ class: 'cm-pythia-line' })

/** Markers and line tints, kept in sync with edits (they move with their line as the text changes). */
const field = StateField.define<FieldValue>({
  create: () => ({ markers: RangeSet.empty, lines: Decoration.none }),
  update(value, tr) {
    let next = tr.docChanged ? { markers: value.markers.map(tr.changes), lines: value.lines.map(tr.changes) } : value
    for (const effect of tr.effects) {
      if (!effect.is(setDiagnostics)) continue
      const doc = tr.state.doc
      const byLine = new Map<number, string[]>()
      for (const d of effect.value) {
        const line = Math.min(Math.max(d.line, 1), doc.lines)
        byLine.set(line, [...(byLine.get(line) ?? []), d.id])
      }
      const lines = [...byLine.keys()].sort((a, b) => a - b)
      next = {
        markers: RangeSet.of(lines.map((n) => new PythiaMarker(byLine.get(n)!).range(doc.line(n).from))),
        lines: Decoration.set(lines.map((n) => lineDecoration.range(doc.line(n).from))),
      }
    }
    return next
  },
  provide: (f) => EditorView.decorations.from(f, (v) => v.lines),
})

export interface PythiaHandlers {
  /** Pointer entered/left a marker. `line` is null on leave. `rect` is the marker's viewport rectangle. */
  onHover: (line: number | null, rect: DOMRect | null) => void
  /** Marker clicked. */
  onSelect: (line: number, rect: DOMRect) => void
  /** Keyboard: Ctrl/⌘ + . on the cursor's line. */
  onKeyboard: (line: number, rect: DOMRect | null) => void
}

/** The extension: gutter dot, line tint, hover/click/keyboard hooks. Handlers are read at event time. */
export function pythiaExtension(getHandlers: () => PythiaHandlers | undefined): Extension {
  return [
    field,
    gutter({
      class: 'cm-pythia-gutter',
      markers: (view) => view.state.field(field).markers,
      initialSpacer: () => new Spacer(),
      domEventHandlers: {
        mouseover(view, block, event) {
          const dot = (event.target as HTMLElement).closest('.cm-pythia-dot')
          if (dot) getHandlers()?.onHover(view.state.doc.lineAt(block.from).number, dot.getBoundingClientRect())
          return false
        },
        mouseout() {
          getHandlers()?.onHover(null, null)
          return false
        },
        click(view, block, event) {
          getHandlers()?.onSelect(view.state.doc.lineAt(block.from).number, (event.target as HTMLElement).getBoundingClientRect())
          return true
        },
      },
    }),
    keymap.of([
      {
        key: 'Mod-.',
        run: (view) => {
          const line = view.state.doc.lineAt(view.state.selection.main.head)
          const at = view.coordsAtPos(line.from)
          getHandlers()?.onKeyboard(line.number, at ? new DOMRect(at.left, at.top, 0, at.bottom - at.top) : null)
          return true
        },
      },
    ]),
  ]
}
