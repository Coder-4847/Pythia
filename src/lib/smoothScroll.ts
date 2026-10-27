import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { registerScroller } from '@/lib/scrollTo'

gsap.registerPlugin(ScrollTrigger)

/**
 * Start inertial scrolling and keep ScrollTrigger in sync with it.
 * Returns a teardown function. Does nothing under reduced motion.
 */
export function startSmoothScroll(reduceMotion: boolean): () => void {
  if (reduceMotion) return () => {}
  const instance = new Lenis({ duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 3) })
  registerScroller(instance)
  instance.on('scroll', ScrollTrigger.update)
  const tick = (time: number) => instance.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    instance.destroy()
    registerScroller(null)
  }
}
