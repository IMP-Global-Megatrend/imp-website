import Image from 'next/image'
import Link from 'next/link'
import { getHomeCMSContent } from './getHomeCMSContent'

export async function HeroSection() {
  const cms = await getHomeCMSContent()
  const heading = cms.hero.heading
  const subtitle = cms.hero.subtitle

  return (
    <section className="relative bg-[#2b3dea] overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero_bg.png"
          alt=""
          fill
          className="object-cover opacity-50 mix-blend-overlay"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#2b3dea]/60 via-[#2b3dea]/30 to-[#2b3dea]/80" />
      </div>

      {/* top image strip */}
      <div className="relative">
        <Image
          src="/images/hero_strip.png"
          alt=""
          width={1200}
          height={660}
          className="w-full h-auto opacity-60"
          priority
        />
      </div>

      <div className="relative container pb-20 md:pb-28 -mt-16 md:-mt-24">
        <h1 className="text-white text-[38px] md:text-[52px] leading-[1.12] tracking-tight max-w-3xl">
          {heading}
        </h1>
        <p className="mt-5 text-white/80 text-[17px] md:text-[19px] max-w-md leading-[1.6]">
          {subtitle}
        </p>
        <div className="mt-7">
          <Link
            href={cms.hero.ctaHref}
            className="inline-flex items-center gap-2.5 border border-white/50 text-white px-6 py-3 rounded text-[13px] uppercase tracking-[0.15em] hover:bg-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {cms.hero.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
