'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AlternatingFeatureLayout } from '@/app/(frontend)/_components/AlternatingFeatureLayout'
import type { AnimatedIconName } from '@/app/(frontend)/_components/AnimatedIcon'
import { ActionLinkButton } from '@/app/(frontend)/_components/ActionLinkButton'
import { TickerBadge } from '@/app/(frontend)/_components/TickerBadge'

interface MegatrendCardProps {
  title: string
  body: string
  imageUrl: string
  tickers: [string, string][]
  reverse?: boolean
  detailsHref?: string
  detailsIcon?: AnimatedIconName
  noBottomBorder?: boolean
  animationDelayMs?: number
}

export function MegatrendCard({
  title,
  body,
  imageUrl,
  tickers,
  reverse,
  detailsHref = '/megatrends',
  detailsIcon = 'arrowUpRight',
  noBottomBorder = false,
  animationDelayMs = 0,
}: MegatrendCardProps) {
  const cardRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const imageSrc = imageUrl.trim()

  useEffect(() => {
    const element = cardRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={cardRef}
      className={`${noBottomBorder ? '' : 'border-b border-[#d9def0]'} pt-16 md:pt-20 pb-0 transition-[opacity,transform] duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${animationDelayMs}ms` }}
    >
      <div className="container pb-8 md:pb-0">
        <AlternatingFeatureLayout
          className={`grid xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-10 xl:gap-16 items-stretch ${reverse ? 'xl:[direction:rtl]' : ''}`}
          reverse={reverse}
          applyOrderSwap={false}
          contentClassName="h-full md:order-2 xl:order-none"
          mediaClassName="hidden md:flex justify-center xl:justify-end md:order-1 xl:order-none"
          content={
            <div className="flex h-full items-stretch gap-4" style={reverse ? { direction: 'ltr' } : undefined}>
              <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
                <div className="self-stretch flex items-start">
                  <span
                    className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  >
                    {title}
                  </span>
                </div>
                <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
              </div>

              <div className="flex-1 self-start space-y-5 md:-mt-2 md:pb-8">
                <h2 className="md:hidden text-[22px] leading-[1.3] text-[#0b1035]">{title}</h2>

                {imageSrc ? (
                  <div className="md:hidden flex justify-center">
                    <Image
                      src={imageSrc}
                      alt={title}
                      width={480}
                      height={480}
                      className="w-full max-w-[420px] h-auto object-contain"
                    />
                  </div>
                ) : null}

                <p className="text-[#2b3045] text-[17px] md:text-[17px] leading-[1.7]">{body}</p>

                <ActionLinkButton href={detailsHref} label="Megatrend Details" icon={detailsIcon} />

                <div className="flex flex-wrap gap-3 pt-2">
                  {tickers.map(([ticker, company]) => (
                    <TickerBadge key={ticker} ticker={ticker} company={company} />
                  ))}
                </div>
              </div>
            </div>
          }
          media={
            imageSrc ? (
              <div style={reverse ? { direction: 'ltr' } : undefined}>
                <Image
                  src={imageSrc}
                  alt={title}
                  width={480}
                  height={480}
                  className="w-full max-w-[420px] h-auto object-contain"
                />
              </div>
            ) : null
          }
        />
      </div>
    </article>
  )
}


