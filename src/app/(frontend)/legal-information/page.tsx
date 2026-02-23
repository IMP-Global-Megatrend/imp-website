import { SiteShell } from '../_components/SiteShell'
import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'

export default async function LegalPage() {
  const cmsPage = await getCMSPageBySlug('legal-information')
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
              Regulatory &amp; Legal Information
            </h1>
          </div>
        </section>

        <div className="container py-16 md:py-20 max-w-4xl">
          <div className="space-y-6 text-[#2b3045] text-[15px] leading-relaxed">
            <p>
              This website is for informational purposes only and does not constitute an offer,
              recommendation, or solicitation to buy or sell securities.
            </p>
            <p>
              The portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB
              Fund Partners AG. In this website and related materials, &ldquo;we&rdquo; and
              &ldquo;our&rdquo; refer to MRB Fund Partners AG in relation to regulated portfolio
              management activities.
            </p>
            <p>
              Client categories under FinSA include retail, professional and institutional clients,
              each with different levels of protection and eligibility for financial services.
            </p>
            <p>
              Investing in securities involves risk; past performance is not indicative of future
              results and investors may lose all or part of their investment.
            </p>
            <p>Disputes are subject to Swiss law and Swiss courts.</p>
          </div>
        </div>
      </main>
    </SiteShell>
  )
}
