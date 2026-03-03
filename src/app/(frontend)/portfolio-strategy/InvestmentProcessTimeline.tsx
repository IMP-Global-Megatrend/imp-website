'use client'

import { useEffect, useRef, useState } from 'react'

type InvestmentProcessTimelineProps = {
  items: string[]
}

export function InvestmentProcessTimeline({ items }: InvestmentProcessTimelineProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLLIElement | null>>([])
  const [visibleItems, setVisibleItems] = useState<boolean[]>(() => items.map(() => false))

  useEffect(() => {
    setVisibleItems(items.map(() => false))
  }, [items])

  useEffect(() => {
    const node = rootRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const target = entry.target as HTMLLIElement
          const indexAttr = target.dataset.index
          const index = Number(indexAttr)
          if (Number.isNaN(index)) continue

          setVisibleItems((current) => {
            if (current[index]) return current
            const next = [...current]
            next[index] = true
            return next
          })
          observer.unobserve(target)
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -5% 0px' },
    )

    const refs = itemRefs.current
    refs.forEach((item) => {
      if (item) observer.observe(item)
    })

    return () => {
      observer.disconnect()
    }
  }, [items])

  return (
    <div ref={rootRef} className="relative">
      <div className="hidden md:block absolute left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-[#d9def0]" />
      <ol className="space-y-5 md:space-y-6">
        {items.map((item, i) => {
          const isLeft = i % 2 === 0
          const isVisible = Boolean(visibleItems[i])
          return (
            <li
              key={i}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              data-index={i}
              className="relative md:grid md:grid-cols-2 md:gap-12 lg:gap-14 md:items-center"
            >
              <span
                aria-hidden
                className={`hidden md:block absolute top-1/2 -translate-y-1/2 h-px bg-[#d9def0] transition-opacity duration-500 ease-out ${isLeft ? 'right-[calc(50%+1rem)] w-28 lg:w-32' : 'left-[calc(50%+1rem)] w-28 lg:w-32'} ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              />
              <div
                className={`${isLeft ? 'md:col-start-1' : 'md:col-start-2'} transition-[opacity,transform] duration-500 ease-out will-change-transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <article className="bg-white p-5 border border-[#d9def0]">
                  <span className="md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0040ff] text-white text-[16px] font-semibold mb-3">
                    {i + 1}
                  </span>
                  <p className="text-[#2b3045] text-[15px] md:text-[16px] leading-relaxed">{item}</p>
                </article>
              </div>
              <span
                className={`hidden md:inline-flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center justify-center w-8 h-8 rounded-full bg-white text-[#0040ff] text-[16px] font-display font-medium border border-[#d9def0] transition-[opacity,transform] duration-500 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              >
                {i + 1}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
