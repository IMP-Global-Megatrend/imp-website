type MegatrendDetail = {
  icon: string
  title: string
  subtitle: string
  description: string[]
  conclusion: string
}

type MegatrendDetailSectionProps = {
  id: string
  index: number
  trend: MegatrendDetail
  reverse?: boolean
  noTopBorder?: boolean
}

export function MegatrendDetailSection({
  id,
  index,
  trend,
  reverse = false,
  noTopBorder = false,
}: MegatrendDetailSectionProps) {
  return (
    <section
      id={id}
      className={`${noTopBorder ? '' : 'border-t border-[#d9def0]'} scroll-mt-24 pt-16 md:pt-20 pb-0`}
    >
      <div
        className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch ${reverse ? 'lg:direction-rtl' : ''}`}
        style={reverse ? { direction: 'rtl' } : undefined}
      >
        <div className="h-full" style={reverse ? { direction: 'ltr' } : undefined}>
          <div className="flex h-full items-stretch gap-4">
            <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
              <span
                className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
              >
                {trend.title}
              </span>
              <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
            </div>
            <div className="flex-1 self-start pb-5 md:pb-6">
              <p className="font-display text-[12px] text-[#5f6477] uppercase tracking-[0.15em] mb-2">
                Megatrend {index + 1}
              </p>
              <h2 className="md:hidden text-[24px] leading-[1.25] text-[#0b1035] mb-2">{trend.title}</h2>
              <p className="text-[#0040ff] text-[17px] mb-5">{trend.subtitle}</p>
              <div className="space-y-3 text-[#2b3045] leading-relaxed">
                {trend.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              <p className="pt-3 text-[#2b3045] leading-relaxed font-medium">{trend.conclusion}</p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-center ${reverse ? 'lg:pr-8' : 'lg:pl-8'}`}
          style={reverse ? { direction: 'ltr' } : undefined}
        >
          {trend.icon ? (
            <img
              src={trend.icon}
              alt=""
              className="w-full h-auto object-contain"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
