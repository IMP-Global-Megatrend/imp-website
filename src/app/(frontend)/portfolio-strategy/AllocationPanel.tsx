'use client'

import { useState } from 'react'
import { AllocationDonut } from './AllocationCharts'

type AllocationDatum = [string, string, string]

type AllocationPanelProps = {
  title: string
  data: AllocationDatum[]
}

export function AllocationPanel({ title, data }: AllocationPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div>
      <h3 className="text-[12px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{title}</h3>
      <AllocationDonut data={data} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
      <div className="mt-5 overflow-hidden border-y border-[#d9def0] text-sm font-display text-[#2b3045]">
        {data.map(([name, pct, color], index) => (
          <div
            key={name}
            className={`flex items-center gap-3 py-2 transition-colors ${index < data.length - 1 ? 'border-b border-[#d9def0]' : ''} ${activeIndex === index ? 'bg-[#f5f8ff]' : ''}`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="flex-1">{name}</span>
            <span className="font-medium text-[#0b1035]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
