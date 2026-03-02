import { getHomeCMSContent } from './getHomeCMSContent'

export async function RegulatoryNotice() {
  const cms = await getHomeCMSContent()

  return (
    <section className="bg-secondary text-white/70 py-10 md:py-12">
      <div className="container space-y-6">
        <p className="text-white/90 text-[15px] font-medium">{cms.regulatoryNotice.title}</p>
        <p className="text-[14px] leading-[1.7] max-w-4xl">
          {cms.regulatoryNotice.body}
        </p>
        <p className="text-[13px] text-white/50">{cms.regulatoryNotice.address}</p>
      </div>
    </section>
  )
}
