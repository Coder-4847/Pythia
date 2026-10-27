import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView } from '@codemirror/view'
import { tags as t } from '@lezer/highlight'

/**
 * The editor is styled entirely with the design tokens (CSS variables), so the
 * dark/light theme switch needs no editor reconfiguration.
 */
export const pythiaTheme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'transparent', color: 'var(--c-fg)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.7', overflow: 'auto' },
  '.cm-content': { caretColor: 'var(--c-gold)', padding: '12px 0' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--c-gold)', borderLeftWidth: '2px' },
  '.cm-gutters': { backgroundColor: 'transparent', color: 'var(--c-dim)', border: 'none' },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 10px 0 6px', minWidth: '2.2em' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--c-fg) 4%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--c-muted)' },
  '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--c-gold) 28%, transparent)',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--c-gold) 22%, transparent)',
    outline: '1px solid color-mix(in srgb, var(--c-gold) 45%, transparent)',
  },
  '.cm-selectionMatch': { backgroundColor: 'color-mix(in srgb, var(--c-gold) 14%, transparent)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--c-raised)',
    border: '1px solid var(--c-line-strong)',
    borderRadius: '10px',
    boxShadow: 'var(--shadow-pop)',
    overflow: 'hidden',
  },
  '.cm-tooltip-autocomplete > ul': { fontFamily: 'var(--font-mono)', fontSize: '12.5px' },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'color-mix(in srgb, var(--c-gold) 20%, transparent)',
    color: 'var(--c-fg)',
  },
  '.cm-completionIcon': { opacity: '0.5' },
  '.cm-panels': { backgroundColor: 'var(--c-raised)', color: 'var(--c-fg)', borderColor: 'var(--c-line)' },
  '.cm-textfield': { backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-line-strong)', color: 'var(--c-fg)' },
  '.cm-button': { backgroundImage: 'none', backgroundColor: 'var(--c-surface)', border: '1px solid var(--c-line-strong)', color: 'var(--c-fg)' },
})

/** One accent: keywords are gold, strings the muted success green, everything else is ink. */
export const pythiaHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: [t.keyword, t.controlKeyword, t.definitionKeyword, t.moduleKeyword, t.operatorKeyword], color: 'var(--c-gold)' },
    { tag: [t.bool, t.null, t.self], color: 'var(--c-gold)', fontStyle: 'italic' },
    { tag: [t.string, t.special(t.string)], color: 'var(--c-ok)' },
    { tag: [t.number, t.integer, t.float], color: 'var(--c-fg)' },
    { tag: [t.comment, t.lineComment], color: 'var(--c-dim)', fontStyle: 'italic' },
    { tag: [t.definition(t.variableName), t.function(t.variableName), t.className], color: 'var(--c-fg)', fontWeight: '600' },
    { tag: [t.operator, t.punctuation, t.bracket], color: 'var(--c-muted)' },
    { tag: t.meta, color: 'var(--c-muted)' },
    { tag: t.invalid, color: 'var(--c-bad)' },
  ]),
)
