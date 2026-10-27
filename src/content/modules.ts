import type { ModuleMeta } from '@/content/types'

/**
 * Modules ("lesson sets") group lessons inside a track. A lesson joins a module through its
 * `module:` front-matter field. Modules with no lessons yet are hidden from the learner.
 */
export const MODULES: ModuleMeta[] = [
  { id: 'fnd-start', track: 'foundations', title: 'Getting started', blurb: 'Run your first programs and meet values, names and text.' },
  { id: 'fnd-input', track: 'foundations', title: 'Talking to your program', blurb: 'Ask questions, do some maths, and format what you print.' },
  { id: 'fnd-decisions', track: 'foundations', title: 'Making decisions', blurb: 'Let your program choose what to do.' },
  { id: 'fnd-loops', track: 'foundations', title: 'Repeating things', blurb: 'Loops: say it once, run it many times.' },
  { id: 'fnd-functions', track: 'foundations', title: 'Functions', blurb: 'Name a piece of logic and reuse it.' },
  { id: 'ds-lists', track: 'data-structures', title: 'Lists', blurb: 'Ordered collections you can change.' },
  { id: 'ds-tuples', track: 'data-structures', title: 'Tuples', blurb: 'Ordered collections that stay put.' },
  { id: 'ds-dicts', track: 'data-structures', title: 'Dictionaries', blurb: 'Look things up by name.' },
  { id: 'ds-sets', track: 'data-structures', title: 'Sets', blurb: 'Unique items and fast membership tests.' },
  { id: 'ds-comprehensions', track: 'data-structures', title: 'Comprehensions', blurb: 'Build collections in a single, readable line.' },
]
