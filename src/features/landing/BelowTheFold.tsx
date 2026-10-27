import { CurriculumMap } from '@/features/landing/CurriculumMap'
import { Faq } from '@/features/landing/Faq'
import { FinalCta, Footer } from '@/features/landing/Footer'
import { HowItWorks } from '@/features/landing/HowItWorks'
import { PlaygroundSection } from '@/features/landing/PlaygroundSection'
import { ProgressPreview } from '@/features/landing/ProgressPreview'

/** The scroll-driven sections, split into their own chunk so the hero paints first. */
export default function BelowTheFold() {
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
