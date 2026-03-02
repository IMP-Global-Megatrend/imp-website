import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'

export default async function NewsletterSubscriptionPage() {
  const cmsPage = await getCMSPageBySlug('newsletter-subscription')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero
          title="Newsletter Subscription"
          subtitle="Receive periodic updates on market developments, fund news, and our latest perspectives on global megatrends."
          subtitleClassName="text-white/85 text-[16px] md:text-[18px] leading-relaxed max-w-2xl"
        />

        <section className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl rounded-xl border border-[#d9def0] bg-white p-6 md:p-8">
            <h2 className="text-[24px] leading-[1.25] text-[#0b1035]">Stay informed</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4f566f]">
              Enter your email address to subscribe to the IMP Global Megatrend newsletter.
            </p>

            <form className="mt-7 space-y-4">
              <div>
                <label htmlFor="newsletter-email" className="block text-[13px] text-[#5f6477] mb-1.5">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors"
                />
              </div>

              <label className="flex items-start gap-2 text-[14px] text-[#2b3045]">
                <input
                  type="checkbox"
                  required
                  className="mt-0.5 w-4 h-4 rounded border-[#d9def0] text-[#0040ff] focus:ring-[#0040ff]"
                />
                I agree to receive newsletter emails and understand I can unsubscribe at any time.
              </label>

              <button
                type="submit"
                className="px-8 py-3 rounded bg-[#0040ff] text-white text-[14px] font-medium hover:bg-[#0035d9] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
    </main>
  )
}
