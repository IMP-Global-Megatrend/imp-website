import type { Metadata } from 'next'
import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'
import { getCMSPageBySlug } from '@/app/(frontend)/_components/getCMSPageBySlug'
import { ContactLocationMap } from '@/app/(frontend)/_components/ContactLocationMap'
import { FormLandingLayout } from '@/app/(frontend)/_components/FormLandingLayout'
import { ContactForm } from '@/app/(frontend)/contact-us/ContactForm'
import fallbacks from '@/constants/fallbacks.json'
import { generateMeta, generateStaticFallbackMeta } from '@/utilities/generateMeta'

export async function generateMetadata(): Promise<Metadata> {
  const cmsPage = await getCMSPageBySlug('contact-us')
  if (cmsPage) return generateMeta({ doc: cmsPage })

  return generateStaticFallbackMeta('/contact-us', fallbacks.metadata.contactUs)
}

export default async function ContactPage() {
  const cmsPage = await getCMSPageBySlug('contact-us')
  const pageData = (cmsPage ?? {}) as {
    title?: string
    contactCompanyName?: string
    contactAddress?: string
    contactPhone?: string
    contactEmail?: string
    contactWebsite?: string
    contactConsentText?: string
  }
  const heroTitle = pageData.title || fallbacks.ui.blankHeroTitle
  const companyName = pageData.contactCompanyName || fallbacks.ui.emptyText
  const address = pageData.contactAddress || fallbacks.ui.emptyText
  const phone = pageData.contactPhone || fallbacks.ui.emptyText
  const email = pageData.contactEmail || fallbacks.ui.emptyText
  const website = pageData.contactWebsite || fallbacks.ui.emptyText
  const consentText = pageData.contactConsentText || fallbacks.ui.emptyText
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const websiteLabel = website
    ? website.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : ''

  return (
    <FormLandingLayout
      heroTitle={heroTitle}
      heroTitleClassName="max-w-none"
      palette={{ color1: '#2b3dea', color2: 'oklch(0.47 0.11 128)', color3: 'oklch(0.47 0.10 176)' }}
      afterContent={
        <section className="w-full">
          <ContactLocationMap />
        </section>
      }
    >
        <div className="container py-16 md:py-20 grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Form */}
          <section>
            <ContactForm consentText={consentText} />
          </section>

          {/* Contact Info */}
          <aside className="lg:mt-0">
            <div className="border-l border-[#0040ff] pl-8">
              {companyName ? (
                <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-5">{companyName}</h2>
              ) : null}
              <address className="not-italic text-[15px] text-[#2b3045] leading-relaxed space-y-4">
                {address ? <p className="whitespace-pre-line">{address}</p> : null}
                <div className="space-y-1">
                  {phone ? (
                    <a href={telHref} className="flex items-center gap-2 hover:text-[#0040ff] transition-colors">
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-[14px] w-[14px] shrink-0 text-current"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.35 1.77.68 2.6a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.47-1.24a2 2 0 0 1 2.11-.45c.83.33 1.7.56 2.6.68A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {phone}
                    </a>
                  ) : null}
                  {email ? (
                    <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#0040ff] transition-colors">
                    <AnimatedIcon name="mailCheck" size={14} className="shrink-0 text-current" />
                    {email}
                    </a>
                  ) : null}
                  {website ? (
                    <a
                      href={website}
                      rel="noreferrer"
                      target="_blank"
                      className="flex items-center gap-2 hover:text-[#0040ff] transition-colors"
                    >
                    <AnimatedIcon name="earth" size={14} className="shrink-0 text-current" />
                    {websiteLabel || website}
                    </a>
                  ) : null}
                </div>
              </address>
            </div>
          </aside>
        </div>
    </FormLandingLayout>
  )
}
