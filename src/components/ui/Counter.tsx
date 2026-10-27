import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface CounterProps {
  value: number
  /** Format the in-flight number (default: rounded, thousands separators). */
  format?: (n: number) => string
  className?: string
}

/** Counts up from 0 once scrolled into view. Renders the final value immediately under reduced motion. */
export function Counter({ value, format = (n) => Math.round(n).toLocaleString('en-US'), className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)

  useEffect(() => {
    if (reduce || !inView) return
    const controls = animate(0, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1], onUpdate: setShown })
    return () => controls.stop()
  }, [inView, value, reduce])

  return (
    <span ref={ref} className={className}>
      {format(reduce ? value : shown)}
    </span>
  )
}
