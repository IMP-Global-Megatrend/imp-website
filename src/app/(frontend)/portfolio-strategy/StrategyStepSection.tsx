'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

type StrategyStep = {
  title: string
  src: string
  items: Array<{
    heading: string
    body: string
  }>
}

type StrategyStepSectionProps = {
  step: StrategyStep
  index: number
  total: number
}

export function StrategyStepSection({ step, index, total }: StrategyStepSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const isReversed = index % 2 === 1

  useEffect(() => {
    const element = sectionRef.current
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
    <section
      ref={sectionRef}
      className={`border-b border-[#d9def0] scroll-mt-24 pt-16 md:pt-20 pb-0 transition-[opacity,transform] duration-700 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <div className="container">
        <div
          className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch ${isReversed ? 'lg:direction-rtl' : ''}`}
          style={isReversed ? { direction: 'rtl' } : undefined}
        >
          <div className="h-full" style={isReversed ? { direction: 'ltr' } : undefined}>
            <div className="flex h-full items-stretch gap-4">
              <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
                <div className="self-stretch flex items-start">
                  <span
                    className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  >
                    {step.title}
                  </span>
                </div>
                <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
              </div>
              <div className="flex-1 self-start pb-8 md:pb-6">
                <div className="mb-5 flex items-center justify-center md:hidden">
                  <Image
                    src={step.src}
                    alt={step.title}
                    className="w-full h-auto object-contain"
                    width={1200}
                    height={1200}
                    sizes="100vw"
                    loading="lazy"
                  />
                </div>
                <h2 className="md:hidden text-[24px] leading-[1.25] text-[#0b1035] mb-5">{step.title}</h2>
                <div className="space-y-5">
                  {step.items.map((item) => (
                    <div key={item.heading}>
                      <h3 className="text-[16px] font-semibold text-[#0b1035] mb-1">{item.heading}</h3>
                      <p className="text-[#2b3045] text-[17px] md:text-[15px] leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div
            className={`hidden md:flex items-center justify-center ${isReversed ? 'lg:pr-8' : 'lg:pl-8'}`}
            style={isReversed ? { direction: 'ltr' } : undefined}
          >
            <Image
              src={step.src}
              alt={step.title}
              className="w-full h-auto object-contain"
              width={1200}
              height={1200}
              sizes="(max-width: 1280px) 50vw, 40vw"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
