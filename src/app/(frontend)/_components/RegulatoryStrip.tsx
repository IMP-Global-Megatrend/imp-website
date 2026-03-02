import { getHomeCMSContent } from './getHomeCMSContent'

export async function RegulatoryStrip() {
  const cms = await getHomeCMSContent()

  return (
    <section className="regulatory-strip bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] py-14 md:py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-x-8 md:gap-x-10 gap-y-6 md:gap-y-7">
          {cms.regulatoryItems.map(({ label, value }) => (
            <div
              key={label}
              className="regulatory-strip-item self-start border-l border-primary pl-4 md:pl-5 pr-2 py-0 rounded-r-sm space-y-2"
            >
              <h6 className="font-display text-[15px] md:text-[16px] leading-[1.2] tracking-[0.005em] text-white">
                {label}
              </h6>
              <p className="[font-family:var(--font-display-regular)] font-light text-[13px] md:text-[14px] leading-[1.45] text-primary-light-accessible">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
