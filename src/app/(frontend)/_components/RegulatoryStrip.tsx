import { getHomeCMSContent } from './getHomeCMSContent'

export async function RegulatoryStrip() {
  const cms = await getHomeCMSContent()

  return (
    <section className="bg-[#0b1035] text-white py-14 md:py-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
          {cms.regulatoryItems.map(({ label, value }) => (
            <div key={label} className="border-l-2 border-white/20 pl-5 py-1">
              <h6 className="text-[15px] md:text-[17px] leading-snug tracking-wide text-white/90">
                {label}
              </h6>
              <p className="text-[14px] md:text-[15px] text-white/60 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
