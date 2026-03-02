import Image from 'next/image'
import Link from 'next/link'
import { AnimatedIcon } from './AnimatedIcon'
import { getHomeCMSContent } from './getHomeCMSContent'

export async function BottomGrid() {
  const cms = await getHomeCMSContent()

  return (
    <section className="border-t border-[#e8ecf4] bg-white py-16 md:py-20">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
          {/* See Performance */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-[20px] md:text-[22px] text-[#0b1035] mb-4">See Performance</h3>
            <Image
              src="/images/performance_icon.png"
              alt="Performance"
              width={160}
              height={160}
              className="mb-5"
            />
            <Link
              href="/performance-analysis"
              className="group inline-flex items-center gap-2 border border-[#0040ff] text-[#0040ff] px-5 py-2.5 rounded text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-[#0040ff]/5 transition-colors"
            >
              Performance Chart
              <AnimatedIcon name="arrowUpRight" size={12} className="shrink-0 text-current" />
            </Link>
          </div>

          {/* Request Consultation */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-[20px] md:text-[22px] text-[#0b1035] mb-4">
              Request Consultation
            </h3>
            <Image
              src="/images/consultation_icon.png"
              alt="Consultation"
              width={160}
              height={160}
              className="mb-5"
            />
            <Link
              href="/contact-us"
              className="group inline-flex items-center gap-2 bg-[#0040ff] text-white px-5 py-2.5 rounded text-[13px] uppercase tracking-[0.12em] font-medium hover:bg-[#0035d9] transition-colors"
            >
              Write to us
              <AnimatedIcon name="arrowUpRight" size={12} className="shrink-0 text-current" />
            </Link>
          </div>

          {/* Downloads */}
          <div>
            <h3 className="text-[20px] md:text-[22px] text-[#0b1035] mb-4 text-center md:text-left">
              Downloads
            </h3>
            <div className="flex justify-center md:justify-start mb-5">
              <Image
                src="/images/downloads_icon.png"
                alt="Downloads"
                width={140}
                height={140}
              />
            </div>
            <div className="space-y-2">
              {cms.downloads.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 border border-[#d9def0] rounded px-4 py-3 text-[14px] text-[#0b1035] hover:bg-[#f5f7ff] transition-colors"
                >
                  <AnimatedIcon name="download" size={14} className="shrink-0 text-[#0040ff]" />
                  {d.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
