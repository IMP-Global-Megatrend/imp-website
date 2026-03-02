import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'

const stefanCerts = [
  'Certificate Analyzing and Benchmarking Financial Information, New York Institute of Finance',
  'Certificate Money Markets and Portfolio Management, New York Institute of Finance',
  'Certificate Portfolio Management, New York Institute of Finance',
  'Certificate Portfolio Risk, New York Institute of Finance',
]

const karinCerts = [
  'Certified Member of the Board of Directors, International Business School (ZfU), Zürich',
  'Professional Certificate in Asset Management, New York Institute of Finance',
  'Professional Certificate in Portfolio Management, New York Institute of Finance',
  'Professional Certificate in Wealth Management, New York Institute of Finance',
]

const highlights = [
  'Entrepreneurial, owner-led, deeply client-focused family office',
  '20+ years of combined experience fund management',
  'Independent portfolio manager',
  'Based in Zürich – Switzerland & Vaduz – Liechtenstein',
]

export default async function AboutUsPage() {
  const cmsPage = await getCMSPageBySlug('about-us')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero title="Meet the Team Behind the Strategy" />

        {/* Quote */}
        <section className="container py-16 md:py-20">
          <blockquote className="max-w-3xl">
            <p className="text-[20px] md:text-[24px] leading-[1.5] text-[#2b3045] italic">
              &ldquo;We founded this investment strategy to offer forward-looking investors a way to
              benefit from the structural forces shaping the next decades &ndash; responsibly and with
              precision.&rdquo;
            </p>
            <footer className="mt-4 text-[15px] text-[#5f6477]">
              &mdash; Karin &amp; Stefan Wiederkehr
            </footer>
          </blockquote>
        </section>

        {/* Team */}
        <div className="container pb-16 md:pb-20 space-y-16">
          {/* Stefan */}
          <section className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-4">Stefan Wiederkehr</h2>
              <div className="space-y-3 text-[#2b3045] text-[15px] leading-relaxed">
                <p>
                  Stefan began his investment career in 2008 as a private investor and financial
                  advisor to entrepreneurial families in Europe. He obtained his Bachelor&rsquo;s
                  degree in Boston, USA, and pursued further executive education in finance and
                  portfolio management.
                </p>
                <p>
                  Stefan Wiederkehr is a Portfolio Manager for the IMP Global Megatrend Fund, which
                  he manages with Karin Wiederkehr at MRB Fund Partners AG. He has served as a
                  Portfolio Manager for the fund since 2016.
                </p>
                <p>
                  Previously, Stefan was part of the executive management at two successful asset
                  management firms in Liechtenstein and acted as a Portfolio Manager for two
                  investment funds. His extensive experience in discretionary asset allocation, fund
                  selection, and multi-asset portfolio management positions him well for navigating
                  complex global markets.
                </p>
              </div>
              <div className="mt-6">
                <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-3">
                  Certifications
                </h3>
                <ul className="space-y-1.5">
                  {stefanCerts.map((c) => (
                    <li key={c} className="text-[14px] text-[#2b3045]">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-[360px] aspect-[3/4] rounded-xl bg-[#eef1fa] flex items-center justify-center">
                <span className="text-[#5f6477] text-[14px]">Portrait</span>
              </div>
            </div>
          </section>

          {/* Karin */}
          <section className="grid md:grid-cols-2 gap-10 items-start">
            <div className="md:order-2">
              <h2 className="text-[28px] leading-[1.2] text-[#0b1035] mb-4">Karin B. Wiederkehr</h2>
              <div className="space-y-3 text-[#2b3045] text-[15px] leading-relaxed">
                <p>
                  Karin began her career in investment management in 2002 and has developed profound
                  expertise in both traditional financial markets and innovative investment
                  strategies. She earned her Bachelor&rsquo;s and Master&rsquo;s degrees in
                  Switzerland and pursued executive education at leading international institutions.
                </p>
                <p>
                  Karin B. Wiederkehr is a Portfolio Manager for the IMP Global Megatrend Fund,
                  which she manages with Stefan Wiederkehr at MRB Fund Partners AG. With over 23
                  years of experience in finance and asset management, she brings deep expertise in
                  portfolio construction, strategic investing, and governance.
                </p>
                <p>
                  Previously, Karin served as a managing director at two successful asset management
                  firms in Liechtenstein, holding a board position at one of them. Her extensive
                  experience also includes being licensed as an independent portfolio manager and
                  serving as advisor to multiple private equity and venture capital initiatives.
                </p>
              </div>
              <div className="mt-6">
                <h3 className="text-[14px] uppercase tracking-[0.12em] text-[#5f6477] mb-3">
                  Certifications
                </h3>
                <ul className="space-y-1.5">
                  {karinCerts.map((c) => (
                    <li key={c} className="text-[14px] text-[#2b3045]">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center md:order-1">
              <div className="w-full max-w-[360px] aspect-[3/4] rounded-xl bg-[#eef1fa] flex items-center justify-center">
                <span className="text-[#5f6477] text-[14px]">Portrait</span>
              </div>
            </div>
          </section>
        </div>

        {/* Highlights */}
        <section className="bg-[#f5f7ff] py-16 md:py-20">
          <div className="container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl border border-[#d9def0] p-6 text-center"
                >
                  <p className="text-[15px] text-[#0b1035] font-medium leading-snug">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container py-16 md:py-20 text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact-us"
              className="px-6 py-3 rounded bg-[#0040ff] text-white text-[14px] font-medium"
            >
              Request a call
            </a>
            <a
              href="https://www.linkedin.com"
              rel="noreferrer"
              target="_blank"
              className="px-6 py-3 rounded border border-[#d9def0] text-[14px] font-medium text-[#0b1035] hover:bg-[#f5f7ff]"
            >
              Connect on LinkedIn
            </a>
          </div>
        </section>
    </main>
  )
}
