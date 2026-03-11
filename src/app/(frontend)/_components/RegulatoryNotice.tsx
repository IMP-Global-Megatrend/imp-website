import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'

export async function RegulatoryNotice() {
  const cms = await getHomeCMSContent()

  return (
    <section className="border-t border-white/10 bg-primary">
      <div className="container space-y-2 py-6">
        <p className="text-[15px] font-medium italic text-white/80">{cms.regulatoryNotice.title}</p>
        <p className="max-w-4xl text-[15px] leading-[1.7] font-light italic text-white/80">
          {cms.regulatoryNotice.body}
        </p>
      </div>
    </section>
  )
}
