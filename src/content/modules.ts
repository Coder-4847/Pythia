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
  { id: 'int-errors', track: 'intermediate', title: 'Handling errors', blurb: 'Catch what you expect, raise what you must.' },
  { id: 'int-objects', track: 'intermediate', title: 'Objects', blurb: 'Bundle data and behaviour together.' },
  { id: 'int-iteration', track: 'intermediate', title: 'Lazy sequences', blurb: 'Produce values on demand.' },
  { id: 'alg-recursion', track: 'algorithms', title: 'Recursion', blurb: 'Solve a problem by solving a smaller copy of it.' },
  { id: 'alg-search', track: 'algorithms', title: 'Searching', blurb: 'Finding things fast by not looking everywhere.' },
  { id: 'alg-sorting', track: 'algorithms', title: 'Sorting', blurb: 'Put things in order, by hand.' },
  { id: 'alg-complexity', track: 'algorithms', title: 'Complexity', blurb: 'How the work grows with the size of the input.' },
  { id: 'sci-numpy', track: 'data-science', title: 'NumPy', blurb: 'Fast arrays and whole-array maths.' },
  { id: 'sci-pandas', track: 'data-science', title: 'Pandas', blurb: 'Tables of data you can filter, group and sort.' },
  { id: 'sci-plots', track: 'data-science', title: 'Matplotlib', blurb: 'Turn numbers into pictures.' },
  { id: 'ml-first-models', track: 'machine-learning', title: 'Your first models', blurb: 'Fit a model, measure it honestly, and watch it overfit.' },
  { id: 'prj-builds', track: 'projects', title: 'Guided builds', blurb: 'Small programs that tie everything together.' },
]
