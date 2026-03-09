import { AnimatedHeroHeading } from './AnimatedHeroHeading'
import { HeroGrainientBackground } from './HeroGrainientBackground'
import { getHomeCMSContent } from './getHomeCMSContent'
import { HeroCtaButton } from './HeroCtaButton'

export async function HeroSection() {
  const cms = await getHomeCMSContent()
  const heading = cms.hero.heading
  const subtitle = cms.hero.subtitle
  const hasCta = Boolean(cms.hero.ctaHref && cms.hero.ctaLabel)

  return (
    <section
      className="relative min-h-screen bg-primary overflow-hidden"
      data-transition-skip="true"
    >
      {/* Interactive background */}
      <HeroGrainientBackground
        variant="home"
        palette={{ color1: 'oklch(0.46 0.18 258)', color2: 'oklch(0.46 0.14 242)', color3: 'oklch(0.46 0.12 274)' }}
        className="absolute inset-0 z-0 pointer-events-none"
      />

      <div
        className="relative z-10 flex min-h-screen items-center pt-20 pb-28 md:pt-28 md:pb-36 lg:pt-[256px] lg:pb-44"
        data-transition-hero-content="true"
      >
        <div className="container w-full">
          <AnimatedHeroHeading
            heading={heading || ' '}
            className="text-white text-[38px] md:text-[52px] font-semibold leading-[1.12] tracking-tight max-w-3xl"
          />
          {subtitle ? (
            <p className="mt-5 text-white font-light text-[19px] md:text-[22px] max-w-md leading-[1.6] whitespace-pre-line">
              {subtitle.replace('megatrends ', 'megatrends\n')}
            </p>
          ) : null}
          {hasCta ? (
            <div className="mt-7">
              <HeroCtaButton href={cms.hero.ctaHref} label={cms.hero.ctaLabel} />
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/75 animate-bounce"
        data-transition-force="true"
        aria-hidden="true"
      >
        <svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8L11 15L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16L11 23L18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  )
}
