'use client'

import { useState } from 'react'
import { AllocationDonut } from './AllocationCharts'

type TopHolding = [string, string, string]

export function TopHoldingsSection({ holdings }: { holdings: TopHolding[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
      <div className="shrink-0">
        <AllocationDonut
          data={holdings}
          size={320}
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
        />
      </div>
      <div className="flex-1 mt-5 lg:mt-0 overflow-hidden border-y border-[#d9def0] text-sm font-display text-[#2b3045]">
        {holdings.map(([name, pct, color], index, arr) => (
          <div
            key={name}
            className={`flex items-center gap-3 py-2 transition-colors ${index < arr.length - 1 ? 'border-b border-[#d9def0]' : ''} ${activeIndex === index ? 'bg-[#f5f8ff]' : ''}`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1">{name === 'Other' ? 'Others' : name}</span>
            <span className="font-medium text-[#0b1035]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
