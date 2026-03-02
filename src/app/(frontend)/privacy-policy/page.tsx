import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'

export default async function PrivacyPage() {
  const cmsPage = await getCMSPageBySlug('privacy-policy')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title="Privacy Policy"
          subtitle="Data Protection Statement of MRB Fund Partners AG"
          subtitleClassName="max-w-none"
        />

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
  )
}
