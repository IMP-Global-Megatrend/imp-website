import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'
import { RegulatoryFlagTooltips } from '@/app/(frontend)/_components/RegulatoryFlagTooltips'

function renderRegulatoryValue(value: string) {
  if (value === 'CH, LI') {
    return <RegulatoryFlagTooltips />
  }

  return value
}

function normalizeRegulatoryLabel(label: string) {
  if (/^lichtenstein$/i.test(label)) {
    return 'Liechtenstein'
  }

  return label
}

export async function RegulatoryStrip() {
  const cms = await getHomeCMSContent()

  return (
    <section className="regulatory-strip bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] py-14 md:py-16">
      <div className="container">
        <div className="grid justify-items-center sm:grid-cols-2 lg:grid-cols-5 gap-x-8 md:gap-x-10 gap-y-6 md:gap-y-7">
          {cms.regulatoryItems.map(({ label, value }, index) => (
            <div
              key={`${label}-${value}-${index}`}
              className="regulatory-strip-item w-full max-w-[260px] border-l border-primary pl-4 md:pl-5 pr-2 py-0 rounded-r-sm space-y-2 text-left"
            >
              <h6 className="font-display text-[16px] md:text-[16px] leading-[1.2] tracking-[0.005em] text-white">
                {normalizeRegulatoryLabel(label)}
              </h6>
              <p className="[font-family:var(--font-display-regular)] font-light text-[14px] md:text-[14px] leading-[1.45] text-primary-light-accessible">
                {renderRegulatoryValue(value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
