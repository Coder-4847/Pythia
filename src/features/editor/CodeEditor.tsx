import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { python, pythonLanguage } from '@codemirror/lang-python'
import { bracketMatching, indentOnInput, indentUnit } from '@codemirror/language'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { Compartment, EditorState, Prec, type Extension } from '@codemirror/state'
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { pythiaHighlight, pythiaTheme } from '@/features/editor/theme'
import { pythonSnippets } from '@/features/editor/pythonSnippets'
import { cn } from '@/lib/cn'
import type { Keybindings } from '@/stores/settings'

interface CodeEditorProps {
  /** Identifies the document. Changing it swaps documents, keeping each one's undo history. */
  docKey: string
  /** Initial text for a docKey the editor has not seen yet. */
  initialValue: string
  onChange: (value: string) => void
  onRun?: () => void
  fontSize: number
  keybindings: Keybindings
  readOnly?: boolean
  ariaLabel: string
  className?: string
}

const fontTheme = (px: number) => EditorView.theme({ '&': { fontSize: `${px}px` } })

/** Vim bindings are ~100 kB, so they load only for learners who pick them. */
async function loadKeymap(kind: Keybindings): Promise<Extension> {
  if (kind !== 'vim') return []
  const { vim } = await import('@replit/codemirror-vim')
  return Prec.high(vim())
}

/**
 * CodeMirror 6 wrapped for React. The component is uncontrolled after mount:
 * the editor owns the text and reports edits through `onChange`.
 */
export function CodeEditor({
  docKey,
  initialValue,
  onChange,
  onRun,
  fontSize,
  keybindings,
  readOnly = false,
  ariaLabel,
  className,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const states = useRef(new Map<string, EditorState>())
  const currentKey = useRef(docKey)
  const compartments = useRef({ font: new Compartment(), keys: new Compartment(), readOnly: new Compartment() })
  // Latest callbacks/settings without rebuilding the editor on every render.
  const latest = useRef({ onChange, onRun, fontSize, keybindings, readOnly, ariaLabel })
  useLayoutEffect(() => {
    latest.current = { onChange, onRun, fontSize, keybindings, readOnly, ariaLabel }
  })
  const keysLoaded = useRef<{ kind: Keybindings; ext: Extension }>({ kind: 'default', ext: [] })

  const makeState = (doc: string) => {
    const c = compartments.current
    return EditorState.create({
      doc,
      extensions: [
        c.keys.of(keysLoaded.current.kind === latest.current.keybindings ? keysLoaded.current.ext : []),
        // Run shortcut beats the default "insert blank line" binding.
        Prec.highest(
          keymap.of([
            {
              key: 'Mod-Enter',
              run: () => {
                latest.current.onRun?.()
                return true
              },
            },
          ]),
        ),
        lineNumbers(),
        highlightActiveLineGutter(),
        history(),
        drawSelection(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        indentUnit.of('    '),
        EditorState.tabSize.of(4),
        python(),
        pythonLanguage.data.of({ autocomplete: pythonSnippets }),
        autocompletion({ icons: false }),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
        pythiaTheme,
        pythiaHighlight,
        c.font.of(fontTheme(latest.current.fontSize)),
        c.readOnly.of(EditorState.readOnly.of(latest.current.readOnly)),
        EditorView.contentAttributes.of({ 'aria-label': latest.current.ariaLabel, spellcheck: 'false', autocapitalize: 'off' }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) latest.current.onChange(u.state.doc.toString())
        }),
      ],
    })
  }

  // Create the view once.
  useEffect(() => {
    const v = new EditorView({ state: makeState(initialValue), parent: host.current! })
    view.current = v
    return () => {
      v.destroy()
      view.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by design
  }, [])

  // Swap documents when docKey changes, preserving the previous one's state.
  useEffect(() => {
    const v = view.current
    if (!v || currentKey.current === docKey) return
    states.current.set(currentKey.current, v.state)
    currentKey.current = docKey
    const next = states.current.get(docKey) ?? makeState(initialValue)
    v.setState(next)
    const c = compartments.current
    v.dispatch({
      effects: [
        c.font.reconfigure(fontTheme(fontSize)),
        c.readOnly.reconfigure(EditorState.readOnly.of(readOnly)),
        c.keys.reconfigure(keysLoaded.current.kind === keybindings ? keysLoaded.current.ext : []),
      ],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a docKey change should swap documents
  }, [docKey])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.current.font.reconfigure(fontTheme(fontSize)) })
  }, [fontSize])

  useEffect(() => {
    view.current?.dispatch({ effects: compartments.current.readOnly.reconfigure(EditorState.readOnly.of(readOnly)) })
  }, [readOnly])

  useEffect(() => {
    let cancelled = false
    void loadKeymap(keybindings).then((ext) => {
      if (cancelled) return
      keysLoaded.current = { kind: keybindings, ext }
      view.current?.dispatch({ effects: compartments.current.keys.reconfigure(ext) })
    })
    return () => {
      cancelled = true
    }
  }, [keybindings])

  return <div ref={host} className={cn('min-h-0 overflow-hidden', className)} />
}
