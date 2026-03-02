import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface MegatrendCardProps {
  title: string
  body: string
  icon: string
  image: string
  tickers: [string, string][]
  reverse?: boolean
}

export function MegatrendCard({ title, body, icon, image, tickers, reverse }: MegatrendCardProps) {
  return (
    <article className="border-t border-[#d9def0] py-16 md:py-20">
      <div className="container">
        <div
          className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-start ${reverse ? 'lg:direction-rtl' : ''}`}
          style={reverse ? { direction: 'rtl' } : undefined}
        >
          {/* text column */}
          <div style={reverse ? { direction: 'ltr' } : undefined}>
            <div className="flex items-start gap-4">
              {/* vertical title */}
              <div className="hidden md:flex flex-col items-center shrink-0">
                <span
                  className="text-[#0b1035] text-[14px] tracking-[0.05em] uppercase font-medium whitespace-nowrap"
                  style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                >
                  {title}
                </span>
              </div>

              <div className="flex-1 space-y-5">
                <Image src={icon} alt="" width={48} height={50} className="rounded-md" />
                <p className="text-[#2b3045] text-[16px] md:text-[17px] leading-[1.7]">{body}</p>

                <Button
                  asChild
                  variant="outlineBrand"
                  size="clear"
                  className="px-5 py-2.5"
                >
                  <Link href="/megatrends">
                    Megatrend Details
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 10L10 2M10 2H4M10 2v6" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </Link>
                </Button>

                <div className="flex flex-wrap gap-3 pt-2">
                  {tickers.map(([ticker, company]) => (
                    <span
                      key={ticker}
                      className="inline-flex items-center gap-2 rounded-full bg-[#e8edff] text-[#0b1035] px-4 py-2 text-[13px] uppercase tracking-[0.06em] font-medium"
                    >
                      <span className="text-[#0040ff] font-semibold">{ticker}</span>
                      {company}
                    </span>
                  ))}
                </div>

                {/* mobile title fallback */}
                <h2 className="md:hidden text-[22px] leading-[1.3] text-[#0b1035] pt-3">{title}</h2>
              </div>
            </div>
          </div>

          {/* image column */}
          <div
            className="flex justify-center lg:justify-end"
            style={reverse ? { direction: 'ltr' } : undefined}
          >
            <Image
              src={image}
              alt={title}
              width={480}
              height={480}
              className="w-full max-w-[420px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
