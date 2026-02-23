import { SiteShell } from '../_components/SiteShell'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'

export default async function PrivacyPage() {
  const cmsPage = await getCMSPageBySlug('privacy-policy')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <SiteShell>
      <main className="bg-white text-[#0b1035]">
        {/* Hero */}
        <section className="bg-[#2b3dea] pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="container">
            <h1 className="text-white text-[38px] md:text-[48px] leading-[1.12] tracking-tight max-w-3xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-white/70 text-[17px]">
              Data Protection Statement of MRB Fund Partners AG
            </p>
          </div>
        </section>

        <div className="container py-16 md:py-20 max-w-4xl">
          <div className="space-y-6 text-[#2b3045] text-[15px] leading-relaxed">
            <p>
              We describe how personal data is collected and processed in line with GDPR, Swiss DPA
              and revDPA.
            </p>
            <p>
              Personal data is processed for contractual, legal, operational and communication
              purposes, including client servicing, compliance and infrastructure security.
            </p>
            <p>
              We may use cookies and analytics tools to improve site operation and user experience.
            </p>
            <p>
              Data may be transferred to service providers in Switzerland, Europe and the USA with
              appropriate safeguards.
            </p>
            <p>
              Data subjects may request access, rectification, deletion, restriction, objection and
              portability where applicable.
            </p>
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
