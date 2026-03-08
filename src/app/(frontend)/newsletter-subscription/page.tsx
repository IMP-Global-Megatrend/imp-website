import type { Metadata } from 'next'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { PageHero } from '../_components/PageHero'
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('newsletter-subscription')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/newsletter-subscription', fallbacks.metadata.newsletterSubscription)
}

export default async function NewsletterSubscriptionPage() {
  const cmsPage = await getCMSPageBySlug('newsletter-subscription')
  const pageData = (cmsPage ?? {}) as {
    title?: string
    hero?: { richText?: unknown }
    newsletterIntroTitle?: string
    newsletterIntroBody?: string
    newsletterConsentText?: string
    newsletterSubmitLabel?: string
  }

  const heroTitle = pageData.title || fallbacks.ui.blankHeroTitle
  const introTitle = pageData.newsletterIntroTitle || fallbacks.ui.emptyText
  const introBody = pageData.newsletterIntroBody || fallbacks.ui.emptyText
  const consentText = pageData.newsletterConsentText || fallbacks.ui.emptyText
  const submitLabel = pageData.newsletterSubmitLabel || fallbacks.ui.newsletterSubmitLabel

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title={heroTitle}
          subtitle={introBody || undefined}
          palette={{
            color1: '#2b3dea',
            color2: 'oklch(0.46 0.13 18)',
            color3: 'oklch(0.46 0.11 322)',
          }}
          subtitleClassName="text-white/85 text-[16px] md:text-[18px] leading-relaxed max-w-2xl"
        />

        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            {introTitle ? <h2 className="text-[24px] leading-[1.25] text-[#0b1035]">{introTitle}</h2> : null}
            {introBody ? <p className="mt-3 text-[15px] leading-relaxed text-[#4f566f]">{introBody}</p> : null}

            <NewsletterSubscriptionForm consentText={consentText} submitLabel={submitLabel} />
          </div>
        </section>
    </main>
  )
}
