import type { Metadata } from 'next'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { PageHero } from '../_components/PageHero'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import fallbacks from '@/constants/fallbacks.json'
import newsletterContent from '@/constants/newsletter-subscription-content.json'
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

            <form className="mt-7 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="newsletter-first-name"
                    className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
                  >
                    {newsletterContent.form.fields.firstName.label}
                  </label>
                  <input
                    id="newsletter-first-name"
                    name="firstName"
                    type="text"
                    required
                    className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newsletter-last-name"
                    className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
                  >
                    {newsletterContent.form.fields.lastName.label}
                  </label>
                  <input
                    id="newsletter-last-name"
                    name="lastName"
                    type="text"
                    required
                    className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="newsletter-email"
                  className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
                >
                  {newsletterContent.form.fields.email.label}{' '}
                  <span className="text-[#7f879b]">{newsletterContent.form.fields.email.requiredSuffix}</span>
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none"
                />
              </div>

              <div>
                <h3 className="text-[16px] font-medium text-[#0b1035]">{newsletterContent.form.consent.heading}</h3>
                {consentText ? <p className="mt-2 text-[14px] leading-relaxed text-[#4f566f]">{consentText}</p> : null}

                <label htmlFor="newsletter-consent" className="mt-3 flex items-start gap-2 text-[14px] text-[#2b3045]">
                  <Checkbox
                    id="newsletter-consent"
                    name="consent"
                    required
                    className="mt-0.5 size-5 cursor-pointer rounded-none border-[#d9def0] data-[state=checked]:border-[#0040ff] data-[state=checked]:bg-[#0040ff]"
                  />
                  {newsletterContent.form.consent.checkboxLabel}
                </label>
              </div>

              <Button
                type="submit"
                variant="default"
                size="clear"
                className="cursor-pointer px-5 py-2.5 rounded-none font-display bg-[#0040ff] text-white hover:bg-[#0035d9]"
              >
                {submitLabel}
              </Button>
            </form>
          </div>
        </section>
    </main>
  )
}
