import { getCMSPageBySlug } from '../_components/getCMSPageBySlug'
import { CMSPageContent } from '../_components/CMSPageContent'
import { PageHero } from '../_components/PageHero'

export default async function ContactPage() {
  const cmsPage = await getCMSPageBySlug('contact-us')
  if (cmsPage) {
    return <CMSPageContent page={cmsPage as never} />
  }

  return (
    <main className="bg-white text-[#0b1035]">
        <PageHero title="Get In Touch" titleClassName="max-w-none" />

        <div className="container py-16 md:py-20 grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Form */}
          <section>
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] text-[#5f6477] mb-1.5">First name</label>
                  <input
                    className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-[13px] text-[#5f6477] mb-1.5">Last name</label>
                  <input
                    className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-[#5f6477] mb-1.5">Phone</label>
                <input
                  className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-[13px] text-[#5f6477] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <fieldset>
                <legend className="text-[13px] text-[#5f6477] mb-3">Inquiry type</legend>
                <div className="flex flex-wrap gap-4">
                  {['General Inquiry', 'Investment Request', 'Request Factsheet'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-[14px] text-[#2b3045]">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#d9def0] text-[#0040ff] focus:ring-[#0040ff]"
                        defaultChecked={opt === 'General Inquiry'}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="block text-[13px] text-[#5f6477] mb-1.5">Your message</label>
                <textarea
                  rows={5}
                  className="w-full border border-[#d9def0] rounded-lg px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors resize-none"
                  placeholder="Enter your question or message"
                />
              </div>

              <div className="border-t border-[#d9def0] pt-5">
                <h3 className="text-[15px] font-medium text-[#0b1035] mb-2">Consent</h3>
                <p className="text-[13px] text-[#5f6477] mb-3">
                  By submitting this form, I agree to the storage and processing of my personal data
                  for the purpose of responding to my inquiry, in accordance with the GDPR.
                </p>
                <label className="flex items-start gap-2 text-[14px] text-[#2b3045]">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 w-4 h-4 rounded border-[#d9def0] text-[#0040ff] focus:ring-[#0040ff]"
                  />
                  I consent to the processing of my personal data.
                </label>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded bg-[#0040ff] text-white text-[14px] font-medium hover:bg-[#0035d9] transition-colors"
              >
                Submit
              </button>
            </form>
          </section>

          {/* Contact Info */}
          <aside className="lg:mt-0">
            <div className="bg-[#f5f7ff] rounded-xl border border-[#d9def0] p-8">
              <img
                src="/images/consultation_icon.png"
                alt=""
                className="w-12 h-12 mb-5"
              />
              <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-5">
                MRB Fund Partners AG
              </h2>
              <address className="not-italic text-[15px] text-[#2b3045] leading-relaxed space-y-4">
                <p>
                  Fraumünsterstrasse 9<br />
                  8001 Zürich
                </p>
                <p>
                  <a href="tel:+41444542571" className="hover:text-[#0040ff] transition-colors">
                    +41 44 454 25 71
                  </a>
                  <br />
                  <a href="mailto:info@mrbpartner.ch" className="hover:text-[#0040ff] transition-colors">
                    info@mrbpartner.ch
                  </a>
                </p>
                <p>
                  <a
                    href="https://www.mrbpartner.ch/"
                    rel="noreferrer"
                    target="_blank"
                    className="text-[#0040ff] hover:underline"
                  >
                    www.mrbpartner.ch
                  </a>
                </p>
              </address>
            </div>
          </aside>
        </div>
    </main>
  )
}
