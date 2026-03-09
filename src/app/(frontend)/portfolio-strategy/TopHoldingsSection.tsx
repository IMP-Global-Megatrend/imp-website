'use client'

import { useEffect, useState } from 'react'
import { AllocationDonut } from './AllocationCharts'

type TopHolding = [string, string, string]

export function TopHoldingsSection({ holdings }: { holdings: TopHolding[] }) {
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const chartData = [
    ...holdings
      .filter(([name]) => {
        const normalized = name.trim().toLowerCase()
        return normalized !== 'other' && normalized !== 'others'
      })
      .map(([name, pct, color]) => [name, pct, color] as TopHolding),
    ...holdings
      .filter(([name]) => {
        const normalized = name.trim().toLowerCase()
        return normalized === 'other' || normalized === 'others'
      })
      .map(([, pct, color]) => ['', pct, color] as TopHolding),
  ]
  const tableRows = holdings
    .map((holding, chartIndex) => ({ holding, chartIndex }))
    .filter(({ holding: [name] }) => {
      const normalized = name.trim().toLowerCase()
      return normalized !== 'other' && normalized !== 'others'
    })

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-center">
      <div className="shrink-0">
        <AllocationDonut
          data={chartData}
          size={isDesktop ? 320 : 260}
          activeIndex={activeChartIndex}
          onActiveIndexChange={setActiveChartIndex}
        />
      </div>
      <div className="w-full flex-1 overflow-hidden border-y border-[#d9def0] text-sm font-display text-[#2b3045]">
        {tableRows.map(({ holding: [name, pct, color], chartIndex }, index, arr) => (
          <div
            key={`${name}-${chartIndex}`}
            className={`flex items-center gap-3 py-2 transition-colors ${index < arr.length - 1 ? 'border-b border-[#d9def0]' : ''} ${activeChartIndex === chartIndex ? 'bg-[#f5f8ff]' : ''}`}
            onMouseEnter={() => setActiveChartIndex(chartIndex)}
            onMouseLeave={() => setActiveChartIndex(null)}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1">{name}</span>
            <span className="font-medium text-[#0b1035]">{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
