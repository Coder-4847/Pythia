import { snippetCompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'

/** Tab-through templates for the constructs beginners type most. */
const SNIPPETS = [
  snippetCompletion('for ${item} in ${items}:\n\t${}', { label: 'for', detail: 'loop over items', type: 'keyword', boost: 2 }),
  snippetCompletion('for ${i} in range(${n}):\n\t${}', { label: 'forr', detail: 'loop with range()', type: 'keyword', boost: 2 }),
  snippetCompletion('while ${condition}:\n\t${}', { label: 'while', detail: 'while loop', type: 'keyword', boost: 2 }),
  snippetCompletion('if ${condition}:\n\t${}', { label: 'if', detail: 'if statement', type: 'keyword', boost: 2 }),
  snippetCompletion('if ${condition}:\n\t${}\nelse:\n\t${}', { label: 'ifelse', detail: 'if / else', type: 'keyword', boost: 2 }),
  snippetCompletion('def ${name}(${args}):\n\t${}', { label: 'def', detail: 'function', type: 'keyword', boost: 2 }),
  snippetCompletion('class ${Name}:\n\tdef __init__(self${}):\n\t\t${}', { label: 'class', detail: 'class', type: 'keyword', boost: 2 }),
  snippetCompletion('try:\n\t${}\nexcept ${Exception} as ${e}:\n\t${}', { label: 'try', detail: 'try / except', type: 'keyword', boost: 2 }),
  snippetCompletion('with open(${"file.txt"}) as ${f}:\n\t${}', { label: 'with', detail: 'open a file', type: 'keyword', boost: 2 }),
  snippetCompletion('[${x} for ${x} in ${items}]', { label: 'listcomp', detail: 'list comprehension', type: 'keyword', boost: 2 }),
]

/** Completion source offering snippets only at the start of a word. */
export function pythonSnippets(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/\w+/)
  if (!word || (word.from === word.to && !context.explicit)) return null
  return { from: word.from, options: SNIPPETS, validFor: /^\w*$/ }
}
