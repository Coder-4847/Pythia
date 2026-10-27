import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
import { refreshScroller } from '@/lib/scrollTo'
import { CurriculumMap } from '@/features/landing/CurriculumMap'
import { Faq } from '@/features/landing/Faq'
import { FinalCta, Footer } from '@/features/landing/Footer'
import { HowItWorks } from '@/features/landing/HowItWorks'
import { PlaygroundSection } from '@/features/landing/PlaygroundSection'
import { ProgressPreview } from '@/features/landing/ProgressPreview'

/** The scroll-driven sections, split into their own chunk so the hero paints first. */
export default function BelowTheFold() {
  // The page just got much taller: Lenis and ScrollTrigger measured it before these sections existed.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      refreshScroller()
    })
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <>
      <HowItWorks />
      <CurriculumMap />
      <PlaygroundSection />
      <ProgressPreview />
      <Faq />
      <FinalCta />
      <Footer />
    </>
  )
}
