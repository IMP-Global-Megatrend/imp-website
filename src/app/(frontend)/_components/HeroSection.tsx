import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedHeroHeading } from './AnimatedHeroHeading'
import { GradientMotionBackground } from './GradientMotionBackground'
import { getHomeCMSContent } from './getHomeCMSContent'

const desktopHeroNav = [
  { href: '/fund', label: 'The Fund' },
  { href: '/megatrends', label: 'Our Megatrends' },
  { href: '/portfolio-strategy', label: 'Portfolio Strategy' },
  { href: '/performance-analysis', label: 'Performance Analysis' },
  { href: '/about-us', label: 'About Us' },
]

export async function HeroSection() {
  const cms = await getHomeCMSContent()
  const heading = cms.hero.heading
  const subtitle = cms.hero.subtitle

  return (
    <section className="relative grid bg-primary overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Interactive background */}
      <GradientMotionBackground seed={2026} className="row-start-1 col-start-1">
        <div className="hidden lg:block relative z-20 w-full pt-[94px]">
          <div className="container">
            <nav className="w-full rounded-none bg-transparent text-white pt-9 pb-9 flex items-center justify-between">
              {desktopHeroNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="[font-family:var(--font-display)] relative pl-3 text-[16px] font-normal leading-tight text-white hover:text-white transition-colors text-left before:content-[''] before:absolute before:left-0 before:bottom-[0.1em] before:top-[-1rem] before:w-px before:bg-white/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </GradientMotionBackground>

      <div className="relative z-10 row-start-1 col-start-1 w-full container pt-12 pb-20 md:pt-20 md:pb-28 lg:pt-[240px]">
        <AnimatedHeroHeading
          heading={heading}
          className="text-white text-[38px] md:text-[52px] leading-[1.12] tracking-tight max-w-3xl"
        />
        <p className="mt-5 text-white font-light text-[19px] md:text-[22px] max-w-md leading-[1.6] whitespace-pre-line">
          {subtitle.replace('megatrends ', 'megatrends\n')}
        </p>
        <div className="mt-7">
          <Button asChild variant="heroCta" size="clear">
            <Link href={cms.hero.ctaHref}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 16.5L9 11.5L13 14.5L20 7.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 7.5H20V12.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="4" cy="16.5" r="1.5" fill="currentColor" />
                <circle cx="9" cy="11.5" r="1.5" fill="currentColor" />
                <circle cx="13" cy="14.5" r="1.5" fill="currentColor" />
              </svg>
              {cms.hero.ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
