import { Link } from 'react-router-dom'
import { Celebration } from '@/components/ui/Celebration'
import { buttonClass } from '@/components/ui/Button'
import { Counter } from '@/components/ui/Counter'
import { LogoMark } from '@/components/brand/Logo'
import type { CatalogLesson } from '@/content'

interface Props {
  lesson: CatalogLesson
  xp: number
  next: CatalogLesson | null
  onReview: () => void
}

export function LessonComplete({ lesson, xp, next, onReview }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="relative">
        <LogoMark size={88} animate />
        <Celebration size="large" />
      </div>
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-gold">Lesson complete</p>
      <h2 className="mt-3 font-serif text-5xl tracking-tight">{lesson.title}</h2>
      <p className="mt-4 text-lg text-muted">
        You earned <Counter value={xp} className="font-semibold text-gold" /> XP on this lesson.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {next ? (
          <Link to={`/lesson/${next.id}`} className={buttonClass('primary', 'lg')}>
            Next: {next.title} →
          </Link>
        ) : (
          <Link to="/learn" className={buttonClass('primary', 'lg')}>
            Back to the curriculum
          </Link>
        )}
        <button type="button" onClick={onReview} className={buttonClass('secondary', 'lg')}>
          Review this lesson
        </button>
      </div>
      <Link to="/learn" className="mt-6 text-sm text-muted hover:text-fg">
        All lessons
      </Link>
    </div>
  )
}
