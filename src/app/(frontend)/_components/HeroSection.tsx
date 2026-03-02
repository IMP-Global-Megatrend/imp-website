import { AnimatedHeroHeading } from './AnimatedHeroHeading'
import { GradientMotionBackground } from './GradientMotionBackground'
import { getHomeCMSContent } from './getHomeCMSContent'
import { HeroCtaButton } from './HeroCtaButton'

export async function HeroSection() {
  const cms = await getHomeCMSContent()
  const heading = cms.hero.heading
  const subtitle = cms.hero.subtitle

  return (
    <section className="relative grid bg-primary overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Interactive background */}
      <GradientMotionBackground seed={2026} className="row-start-1 col-start-1" />

      <div className="relative z-10 row-start-1 col-start-1 w-full container pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-[240px]">
        <AnimatedHeroHeading
          heading={heading}
          className="text-white text-[38px] md:text-[52px] font-semibold leading-[1.12] tracking-tight max-w-3xl"
        />
        <p className="mt-5 text-white font-light text-[19px] md:text-[22px] max-w-md leading-[1.6] whitespace-pre-line">
          {subtitle.replace('megatrends ', 'megatrends\n')}
        </p>
        <div className="mt-7">
          <HeroCtaButton href={cms.hero.ctaHref} label={cms.hero.ctaLabel} />
        </div>
      </div>
    </section>
  )
}
