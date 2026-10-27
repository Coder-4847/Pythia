/** Curriculum overview shown on the landing page, the track map and the dashboard. */
export type TrackStatus = 'full' | 'preview'

export interface TrackMeta {
  id: string
  title: string
  blurb: string
  topics: string[]
  /** `full`: complete track. `preview`: a handful of finished lessons; the rest is on the roadmap. */
  status: TrackStatus
}

export const TRACKS: TrackMeta[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'From your first print() to writing functions you trust.',
    topics: ['Variables', 'Types', 'Strings', 'Input & output', 'Conditionals', 'Loops', 'Functions'],
    status: 'full',
  },
  {
    id: 'data-structures',
    title: 'Data structures',
    blurb: 'Choose the right container, and read data like a native.',
    topics: ['Lists', 'Tuples', 'Dicts', 'Sets', 'Comprehensions'],
    status: 'full',
  },
  {
    id: 'intermediate',
    title: 'Intermediate Python',
    blurb: 'Write code that fails gracefully and scales gracefully.',
    topics: ['Exceptions', 'Files', 'Modules', 'OOP', 'Decorators', 'Generators', 'Typing'],
    status: 'preview',
  },
  {
    id: 'algorithms',
    title: 'Algorithms & problem solving',
    blurb: 'Think in recursion, sorting, searching and complexity.',
    topics: ['Recursion', 'Sorting', 'Searching', 'Big-O', 'Interview challenges'],
    status: 'preview',
  },
  {
    id: 'data-science',
    title: 'Data science',
    blurb: 'Wrangle and plot real data with the scientific stack.',
    topics: ['NumPy', 'Pandas', 'Matplotlib'],
    status: 'preview',
  },
  {
    id: 'machine-learning',
    title: 'Machine learning',
    blurb: 'Fit, evaluate, and build a neural net from scratch.',
    topics: ['Regression', 'Classification', 'Trees', 'Clustering', 'Overfitting', 'Neural nets', 'Capstone'],
    status: 'preview',
  },
  {
    id: 'projects',
    title: 'Projects',
    blurb: 'Guided builds that tie everything together.',
    topics: ['Text adventure', 'Expense tracker', 'Data dashboard', 'ML classifier'],
    status: 'preview',
  },
]
