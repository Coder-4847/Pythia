import { m, useMotionValue, useSpring } from 'framer-motion'
import { useReducedMotion } from '@/lib/useReducedMotion'
import { useRef, type ReactNode } from 'react'

/** Wraps a control so it leans toward the cursor, like it wants to be clicked. */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16, mass: 0.4 })

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType === 'touch' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.div ref={ref} style={{ x, y, display: 'inline-block' }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </m.div>
  )
}
