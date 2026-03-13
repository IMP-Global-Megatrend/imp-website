import Image from 'next/image'

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
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          <div className={`h-full order-2 ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
            <div className="flex h-full items-stretch gap-4">
              <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
                <div className="self-stretch flex items-start">
                  <span
                    className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  >
                    {trend.title}
                  </span>
                </div>
                <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
              </div>
              <div className="flex-1 self-start pb-5 md:pb-6">
                <p className="font-display text-[12px] text-[#5f6477] uppercase tracking-[0.15em] mb-2">
                  Megatrend {index + 1}
                </p>
                <h2 className="md:hidden text-[24px] leading-[1.25] text-[#0b1035] mb-2">{trend.title}</h2>
                <p className="mb-5 [font-family:var(--font-display-regular)] text-[19px] md:text-[20px] text-[#0040ff]">
                  {trend.subtitle}
                </p>
                <div className="space-y-3 text-[17px] md:text-[16px] text-[#2b3045] leading-relaxed">
                  {trend.description.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <p className="pt-3 text-[17px] md:text-[16px] text-[#2b3045] leading-relaxed font-medium">
                  {trend.conclusion}
                </p>
              </div>
            </div>
          </div>

          <div
            className={`flex items-center justify-center order-1 ${reverse ? 'lg:order-1 lg:pr-8' : 'lg:order-2 lg:pl-8'}`}
          >
            {trend.icon ? (
              <Image
                src={trend.icon}
                alt={`${trend.title} icon`}
                className="w-full h-auto object-contain"
                width={1200}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
