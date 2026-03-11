'use client'

import { useEffect, useState } from 'react'
import { AllocationDonut } from '@/app/(frontend)/portfolio-strategy/AllocationCharts'

type TopHolding = [string, string, string, string?]

function parsePct(value: string): number {
  const n = Number(value.replace('%', '').trim())
  return Number.isFinite(n) ? n : 0
}

function formatPct(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return rounded.toFixed(2)
}

function interpolateChannel(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t)
}

function buildBlueScaleColor(weight: number, minWeight: number, maxWeight: number): string {
  // Darker for larger weights, lighter for smaller weights.
  const dark = { r: 15, g: 59, b: 191 } // #0f3bbf
  const light = { r: 219, g: 234, b: 255 } // #dbeaff
  const range = Math.max(maxWeight - minWeight, 0.000001)
  const normalized = Math.min(1, Math.max(0, (weight - minWeight) / range))
  const t = 1 - normalized
  const r = interpolateChannel(dark.r, light.r, t)
  const g = interpolateChannel(dark.g, light.g, t)
  const b = interpolateChannel(dark.b, light.b, t)
  const toHex = (value: number) => value.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function TopHoldingsSection({ holdings }: { holdings: TopHolding[] }) {
  const [activeChartIndex, setActiveChartIndex] = useState<number | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const nonOtherHoldings = holdings.filter(([name]) => {
    const normalized = name.trim().toLowerCase()
    return normalized !== 'other' && normalized !== 'others'
  })
  const explicitOtherSlices = holdings
    .filter(([name]) => {
      const normalized = name.trim().toLowerCase()
      return normalized === 'other' || normalized === 'others'
    })
    .map(([, pct, color]) => ['', pct, color] as TopHolding)

  const totalWithoutSynthetic =
    nonOtherHoldings.reduce((sum, [, pct]) => sum + parsePct(pct), 0) +
    explicitOtherSlices.reduce((sum, [, pct]) => sum + parsePct(pct), 0)
  const remainingPct = Math.round((100 - totalWithoutSynthetic) * 100) / 100
  const syntheticRestSlice =
    explicitOtherSlices.length === 0 && remainingPct > 0.05
      ? (['', formatPct(remainingPct), '#dbeaff'] as TopHolding)
      : null

  const rawChartData = [
    ...nonOtherHoldings.map(([name, pct]) => [name, pct, ''] as TopHolding),
    ...explicitOtherSlices,
    ...(syntheticRestSlice ? [syntheticRestSlice] : []),
  ]

  const LIGHTEST_BLUE = '#dbeaff'
  const weightedRows = rawChartData.filter(([name]) => name.trim().length > 0)
  const weights = weightedRows.map(([, pct]) => parsePct(pct))
  const minWeight = weights.length ? Math.min(...weights) : 0
  const maxWeight = weights.length ? Math.max(...weights) : 0

  const chartData = rawChartData.map(([name, pct]) => {
    if (name.trim().length === 0) {
      return [name, pct, LIGHTEST_BLUE] as TopHolding
    }
    const weight = parsePct(pct)
    return [name, pct, buildBlueScaleColor(weight, minWeight, maxWeight)] as TopHolding
  })

  const colorByNamePct = new Map<string, string>(
    chartData
      .filter(([name]) => Boolean(name.trim()))
      .map(([name, pct, color]) => [`${name}::${pct}`, color]),
  )

  const tableRows = holdings
    .map((holding, chartIndex) => ({ holding, chartIndex }))
    .filter(({ holding: [name] }) => {
      const normalized = name.trim().toLowerCase()
      return normalized !== 'other' && normalized !== 'others'
    })
    .map(({ holding: [name, pct], chartIndex }) => ({
      name,
      pct,
      chartIndex,
      color: colorByNamePct.get(`${name}::${pct}`) || '#0f3bbf',
    }))

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
        {tableRows.map(({ name, pct, color, chartIndex }, index, arr) => (
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
            <span className="font-medium text-[#0b1035]">{formatPct(parsePct(pct))}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
