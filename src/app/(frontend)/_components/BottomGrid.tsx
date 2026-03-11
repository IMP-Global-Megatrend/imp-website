import Image from 'next/image'
import type { ReactNode } from 'react'
import { ActionLinkButton } from '@/app/(frontend)/_components/ActionLinkButton'
import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'

function BottomGridColumn({
  title,
  children,
  className = '',
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col items-center text-center px-4 py-10 md:px-6 md:py-12 ${className}`}>
      <h3 className="text-[20px] md:text-[22px] text-[#0b1035] mb-4">{title}</h3>
      {children}
    </div>
  )
}

export async function ExploreMegatrendsCard() {
  const cms = await getHomeCMSContent()
  const hasExploreCard = Boolean(cms.exploreMegatrendsCard.title && cms.exploreMegatrendsCard.imageUrl)

  if (!hasExploreCard) return null

  return (
    <div className="flex flex-col items-center text-center">
      <h3 className="mb-4 text-[17px] md:text-[19px] text-[#5f6477]">{cms.exploreMegatrendsCard.title}</h3>
      <img
        src={cms.exploreMegatrendsCard.imageUrl}
        alt={cms.exploreMegatrendsCard.title}
        className="mb-5 w-[140px] h-[140px] object-contain"
        loading="lazy"
      />
    </div>
  )
}

export async function BottomGrid() {
  const cms = await getHomeCMSContent()

  return (
    <section
      className="relative border-t border-[#d9def0] bg-white"
      data-transition-static="true"
    >
      <div className="container">
        <div className="grid md:grid-cols-3 divide-y divide-[#d9def0] md:divide-y-0 md:divide-x md:divide-[#e8ecf4]">
          {/* See Performance */}
          <BottomGridColumn title="See Performance">
            <Image
              src="/images/performance_icon.png"
              alt="Performance"
              width={160}
              height={160}
              className="mb-5"
            />
            <ActionLinkButton
              href="/performance-analysis"
              label="Performance Chart"
              icon="chartLine"
              iconBefore
              buttonVariant="outlineMuted"
            />
          </BottomGridColumn>

          {/* Request Consultation */}
          <BottomGridColumn title="Request Consultation">
            <Image
              src="/images/consultation_icon.png"
              alt="Consultation"
              width={160}
              height={160}
              className="mb-5"
            />
            <ActionLinkButton
              href="/contact-us"
              label="Write to us"
              icon="mailCheck"
              iconBefore
              buttonVariant="outlineMuted"
            />
          </BottomGridColumn>

          {/* Downloads */}
          <BottomGridColumn title="Downloads">
            <div className="flex justify-center mb-5">
              <Image
                src="/images/downloads_icon.png"
                alt="Downloads"
                width={140}
                height={140}
              />
            </div>
            <div className="flex flex-col items-center space-y-4">
              {cms.downloads.map((d) => (
                <div key={d.label}>
                  <ActionLinkButton
                    href={d.href}
                    label={d.label}
                    icon="download"
                    external
                    iconBefore
                    buttonVariant="outlineMuted"
                    className="justify-center px-3 py-2.5 text-[11px] sm:px-4 sm:text-[12px] md:px-5 md:text-[13px]"
                  />
                </div>
              ))}
            </div>
          </BottomGridColumn>
        </div>
      </div>
    </section>
  )
}
