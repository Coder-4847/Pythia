/** Curriculum overview shown on the landing page, the track map and the dashboard. */
export type TrackStatus = 'full' | 'preview'

export interface TrackMeta {
  id: string
  title: string
  blurb: string
  topics: string[]
  /** Lessons planned but not written yet; shown on the curriculum as "Coming next". */
  roadmap: string[]
  /** `full`: complete track. `preview`: a handful of finished lessons; the rest is on the roadmap. */
  status: TrackStatus
}

export const TRACKS: TrackMeta[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    blurb: 'From your first print() to writing functions you trust.',
    topics: ['Variables', 'Types', 'Strings', 'Input & output', 'Conditionals', 'Loops', 'Functions'],
    roadmap: [],
    status: 'full',
  },
  {
    id: 'data-structures',
    title: 'Data structures',
    blurb: 'Choose the right container, and read data like a native.',
    topics: ['Lists', 'Tuples', 'Dicts', 'Sets', 'Comprehensions'],
    roadmap: [],
    status: 'full',
  },
  {
    id: 'intermediate',
    title: 'Intermediate Python',
    blurb: 'Write code that fails gracefully and scales gracefully.',
    topics: ['Exceptions', 'Files', 'Modules', 'OOP', 'Decorators', 'Generators', 'Typing'],
    roadmap: ['Modules and imports', 'Reading and writing files', 'Inheritance', 'Decorators', 'Type hints', 'Testing your code'],
    status: 'preview',
  },
  {
    id: 'algorithms',
    title: 'Algorithms & problem solving',
    blurb: 'Think in recursion, sorting, searching and complexity.',
    topics: ['Recursion', 'Sorting', 'Searching', 'Big-O', 'Interview challenges'],
    roadmap: ['Breadth- and depth-first search', 'Dynamic programming', 'Hash tables from scratch', 'Interview challenges'],
    status: 'preview',
  },
  {
    id: 'data-science',
    title: 'Data science',
    blurb: 'Wrangle and plot real data with the scientific stack.',
    topics: ['NumPy', 'Pandas', 'Matplotlib'],
    roadmap: ['Cleaning messy data', 'Joining tables', 'Time series', 'Statistics essentials'],
    status: 'preview',
  },
  {
    id: 'machine-learning',
    title: 'Machine learning',
    blurb: 'Fit, evaluate, and build a neural net from scratch.',
    topics: ['Regression', 'Classification', 'Trees', 'Clustering', 'Overfitting', 'Neural nets', 'Capstone'],
    roadmap: ['Logistic regression', 'Feature scaling', 'Clustering', 'A neural network from scratch', 'Capstone: your own classifier'],
    status: 'preview',
  },
  {
    id: 'projects',
    title: 'Projects',
    blurb: 'Guided builds that tie everything together.',
    topics: ['Text adventure', 'Expense tracker', 'Data dashboard', 'ML classifier'],
    roadmap: ['A command-line to-do app', 'A web scraper', 'An ML classifier, end to end'],
    status: 'preview',
  },
]
