import type { Metadata } from 'next'
import { getCMSAboutUsVideoUrl, getCMSPageBySlug } from '@/app/(frontend)/_components/getCMSPageBySlug'
import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import { RelatedLinksStrip } from '@/app/(frontend)/_components/RelatedLinksStrip'
import { Button } from '@/components/ui/button'
import aboutUsContent from '@/constants/about-us-content.json'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('about-us')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/about-us', fallbacks.metadata.aboutUs)
}

function renderHighlight(item: { id: string; text: string }) {
  if (item.id === 'location') {
    const location = item as { line1?: string; line2?: string }
    return (
      <>
        <span className="inline-flex items-center gap-2">
          <span>{location.line1 ?? 'Based in Zurich'}</span>
          <img src="/images/flags/ch.svg" alt="Swiss flag" className="h-4 w-auto shrink-0" loading="lazy" />
        </span>
        <br />
        <span className="inline-flex items-center gap-2">
          <span>{location.line2 ?? '& Vaduz'}</span>
          <img src="/images/flags/li.svg" alt="Liechtenstein flag" className="h-4 w-auto shrink-0" loading="lazy" />
        </span>
      </>
    )
  }

  return item.text
}

export default async function AboutUsPage() {
  const [cmsPage, cmsVideoUrl] = await Promise.all([getCMSPageBySlug('about-us'), getCMSAboutUsVideoUrl()])
  const page = (cmsPage && typeof cmsPage === 'object' ? cmsPage : {}) as Record<string, unknown>
  const videoUrl = cmsVideoUrl ?? fallbacks.ui.emptyText

  const heroTitle =
    (typeof page.aboutUsHeroTitle === 'string' && page.aboutUsHeroTitle.trim()) || aboutUsContent.hero.title
  const quoteText =
    (typeof page.aboutUsQuoteText === 'string' && page.aboutUsQuoteText.trim()) || aboutUsContent.quote.text
  const quoteAttributionPrimary =
    (typeof page.aboutUsQuoteAttributionPrimary === 'string' && page.aboutUsQuoteAttributionPrimary.trim()) ||
    (aboutUsContent.quote.attributionLines[0] ?? '')
  const quoteAttributionSecondary =
    (typeof page.aboutUsQuoteAttributionSecondary === 'string' && page.aboutUsQuoteAttributionSecondary.trim()) ||
    (aboutUsContent.quote.attributionLines[1] ?? '')
  const videoAriaLabel =
    (typeof page.aboutUsVideoAriaLabel === 'string' && page.aboutUsVideoAriaLabel.trim()) ||
    aboutUsContent.media.videoAriaLabel

  const profiles = Array.isArray(page.aboutUsProfiles)
    ? (page.aboutUsProfiles as Array<Record<string, unknown>>)
        .map((profile) => {
          const name = typeof profile.name === 'string' ? profile.name.trim() : ''
          const paragraphs = Array.isArray(profile.paragraphs)
            ? (profile.paragraphs as Array<Record<string, unknown>>)
                .map((entry) => (typeof entry.text === 'string' ? entry.text.trim() : ''))
                .filter((value) => value.length > 0)
            : []
          const certifications = Array.isArray(profile.certifications)
            ? (profile.certifications as Array<Record<string, unknown>>)
                .map((certification) => {
                  const title = typeof certification.title === 'string' ? certification.title.trim() : ''
                  const institution =
                    typeof certification.institution === 'string' ? certification.institution.trim() : ''
                  if (!title || !institution) return null
                  return { title, institution }
                })
                .filter(
                  (certification): certification is { title: string; institution: string } =>
                    certification !== null,
                )
            : []

          if (!name || paragraphs.length === 0) return null
          return { name, paragraphs, certifications }
        })
        .filter(
          (profile): profile is { name: string; paragraphs: string[]; certifications: Array<{ title: string; institution: string }> } =>
            profile !== null,
        )
    : []

  const aboutProfiles = profiles.length > 0 ? profiles : aboutUsContent.profiles

  const highlights: Array<{ id: string; text: string; line1?: string; line2?: string }> = []
  if (Array.isArray(page.aboutUsHighlights)) {
    for (const entry of page.aboutUsHighlights as Array<Record<string, unknown>>) {
      const id = typeof entry.id === 'string' ? entry.id.trim() : ''
      const text = typeof entry.text === 'string' ? entry.text.trim() : ''
      if (!id || !text) continue
      highlights.push({
        id,
        text,
        line1: typeof entry.line1 === 'string' ? entry.line1.trim() : undefined,
        line2: typeof entry.line2 === 'string' ? entry.line2.trim() : undefined,
      })
    }
  }
  const aboutHighlights = highlights.length > 0 ? highlights : aboutUsContent.highlights

  const requestCallLabel =
    (typeof page.aboutUsRequestCallLabel === 'string' && page.aboutUsRequestCallLabel.trim()) ||
    aboutUsContent.ctas.requestCall.label
  const requestCallHref =
    (typeof page.aboutUsRequestCallHref === 'string' && page.aboutUsRequestCallHref.trim()) ||
    aboutUsContent.ctas.requestCall.href
  const linkedinLabel =
    (typeof page.aboutUsLinkedinLabel === 'string' && page.aboutUsLinkedinLabel.trim()) ||
    aboutUsContent.ctas.linkedin.label
  const linkedinHref =
    (typeof page.aboutUsLinkedinHref === 'string' && page.aboutUsLinkedinHref.trim()) ||
    aboutUsContent.ctas.linkedin.href
  const linkedinAriaLabel =
    (typeof page.aboutUsLinkedinAriaLabel === 'string' && page.aboutUsLinkedinAriaLabel.trim()) ||
    aboutUsContent.social.linkedinAriaLabel

  return (
    <main className="bg-white text-[#0b1035]">
      <PageHero
        title={heroTitle}
        palette={{
          color1: '#2b3dea',
          color2: 'oklch(0.47 0.11 128)',
          color3: 'oklch(0.47 0.10 176)',
        }}
      />

      <section className="container py-16 md:py-20">
        <blockquote className="mx-auto max-w-4xl text-center">
          <p className="text-[20px] md:text-[24px] leading-[1.5] text-[#2b3045] italic">
            &ldquo;{quoteText}&rdquo;
          </p>
          <p className="mt-4 font-display text-[22px] leading-[1.3] text-[#5f6477]">
            &mdash; {quoteAttributionPrimary}
            {quoteAttributionSecondary ? (
              <>
                <br />
                &amp; {quoteAttributionSecondary}
              </>
            ) : null}
          </p>
        </blockquote>
      </section>

      {videoUrl ? (
        <section className="w-full pb-12 md:pb-16">
          <div className="overflow-hidden">
            <video
              className="w-full h-auto"
              autoPlay
              muted
              playsInline
              preload="metadata"
              aria-label={videoAriaLabel}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          </div>
        </section>
      ) : null}

      <div className="container pb-16 md:pb-20 space-y-14">
        <h2 className="hidden text-[28px] leading-[1.2] text-[#0b1035] md:block">
          {aboutProfiles[0]?.name}
          <br />
          &amp; {aboutProfiles[1]?.name}
        </h2>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {aboutProfiles.map((profile) => (
            <section key={profile.name} className="space-y-6">
              <h2 className="text-[28px] leading-[1.2] text-[#0b1035] md:hidden">{profile.name}</h2>
              <div className="space-y-3 text-[#2b3045] text-[17px] leading-relaxed">
                {profile.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="divide-y divide-[#d9def0]">
                {profile.certifications.map((certification) => {
                  return (
                    <li key={`${certification.title}-${certification.institution}`} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-2">
                        <AnimatedIcon name="graduationCap" size={12} className="mt-1 shrink-0 text-[#2b3dea]" />
                        <div className="text-[14px] leading-relaxed text-[#2b3045]">
                          <span className="block font-medium text-[#0b1035]">{certification.title}</span>
                          <span className="block text-[#5f6477]">{certification.institution}</span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <RelatedLinksStrip
        className="py-16 md:py-20"
        borderTop
        items={[
          {
            href: requestCallHref,
            label: requestCallLabel,
            icon: 'users',
            iconBefore: true,
          },
        ]}
        extraActions={
          <Button
            asChild
            variant="outlineMuted"
            size="clear"
            className="px-5 py-2.5 rounded-none font-display hover:bg-transparent"
          >
            <a
              href={linkedinHref}
              rel="noreferrer"
              target="_blank"
              aria-label={linkedinAriaLabel}
              className="group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              {linkedinLabel}
            </a>
          </Button>
        }
      />

      <section className="bg-secondary py-20 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-4">
            {aboutHighlights.map((item) => (
              <p
                key={item.id}
                className="border-l border-primary-light pl-4 md:pl-5 [font-family:var(--font-display-regular)] font-light text-[18px] md:text-[19px] leading-relaxed text-white"
              >
                {renderHighlight(item)}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
