'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { Brush } from '@visx/brush'
import { Group } from '@visx/group'
import { scaleLinear, scaleTime } from '@visx/scale'
import { LinePath } from '@visx/shape'

type PerformanceNavPoint = {
  dateISO: string
  nav: number
}

type ChartPoint = {
  xTs: number
  displayLabel: string
  nav: number
}

const chartFontFamily = 'var(--font-display), ui-sans-serif, system-ui, sans-serif'

/* ── USD Share Class — NAV time series ───────────────────────────── */

const usdYearEndNav: Record<number, number> = {
  2016: 100,
  2017: 115.36,
  2018: 95.08,
  2019: 112.36,
  2020: 167.49,
  2021: 165.92,
  2022: 107.6,
  2023: 136.46,
  2024: 174.92,
  2025: 193.72,
}

const quarterLabels = ['Mar', 'Jun', 'Sep', 'Dec']

const usdNavSeries = Object.entries(usdYearEndNav)
  .map(([yearStr, nav]) => ({ year: Number(yearStr), nav }))
  .sort((a, b) => a.year - b.year)
  .flatMap((current, i, arr) => {
    const buildPoint = (year: number, monthIndex: number, day: number, nav: number): ChartPoint => {
      const date = new Date(Date.UTC(year, monthIndex, day))
      return {
        xTs: date.getTime(),
        displayLabel: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        nav: Math.round(nav * 100) / 100,
      }
    }

    if (i === 0) {
      return [
        buildPoint(current.year, 11, 31, current.nav),
      ]
    }

    const prev = arr[i - 1]!
    const quarterMonthDay: Array<{ monthIndex: number; day: number }> = [
      { monthIndex: 2, day: 31 }, // Mar
      { monthIndex: 5, day: 30 }, // Jun
      { monthIndex: 8, day: 30 }, // Sep
      { monthIndex: 11, day: 31 }, // Dec
    ]
    const points = quarterLabels.map((q, qIndex) => {
      const ratio = (qIndex + 1) / 4
      const nav = prev.nav + (current.nav - prev.nav) * ratio
      const monthDay = quarterMonthDay[qIndex]!
      return buildPoint(current.year, monthDay.monthIndex, monthDay.day, nav)
    })

    return points
  })

/* ── CHF Hedged Share Class — NAV time series ────────────────────── */

const chfMonthlyNav = [
  { date: '2025-09', nav: 100.0 },
  { date: '2025-10', nav: 100.86 },
  { date: '2025-11', nav: 96.44 },
  { date: '2025-12', nav: 94.13 },
  { date: '2026-01', nav: 93.29 },
]

const monthShort: Record<string, string> = {
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dec',
  '01': 'Jan',
}

const chfNavSeries = chfMonthlyNav.map((entry) => {
  const [yyyy, mm] = entry.date.split('-')
  const year = Number(yyyy)
  const monthIndex = Number(mm) - 1
  const date = new Date(Date.UTC(year, monthIndex, 1))
  return {
    xTs: date.getTime(),
    displayLabel: `${monthShort[mm]} '${entry.date.slice(2, 4)}`,
    nav: Math.round(entry.nav * 100) / 100,
  }
})

function formatXAxisLabel(dateISO: string): string {
  const parsed = new Date(dateISO)
  if (Number.isNaN(parsed.getTime())) return dateISO

  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function mapCMSSeries(points: PerformanceNavPoint[]): ChartPoint[] {
  return points
    .filter((point) => typeof point.nav === 'number' && Number.isFinite(point.nav) && point.dateISO)
    .sort((a, b) => new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime())
    .map((point) => ({
      xTs: new Date(point.dateISO).getTime(),
      displayLabel: formatXAxisLabel(point.dateISO),
      nav: Math.round(point.nav * 100) / 100,
    }))
}

function formatTimelineTick(value: number): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function formatLastValueDate(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

function getQuarterlyGridMarkers(minTs: number, maxTs: number): number[] {
  if (!Number.isFinite(minTs) || !Number.isFinite(maxTs) || minTs > maxTs) return []

  const start = new Date(minTs)
  const end = new Date(maxTs)
  const markers: number[] = []
  const quarterMonths = [2, 5, 8, 11] // Mar, Jun, Sep, Dec

  for (let year = start.getUTCFullYear(); year <= end.getUTCFullYear(); year += 1) {
    quarterMonths.forEach((monthIndex) => {
      const ts = Date.UTC(year, monthIndex, 1)
      if (ts >= minTs && ts <= maxTs) markers.push(ts)
    })
  }

  return markers
}

function getMonthlyTickMarkers(minTs: number, maxTs: number): number[] {
  if (!Number.isFinite(minTs) || !Number.isFinite(maxTs) || minTs > maxTs) return []

  const start = new Date(minTs)
  const end = new Date(maxTs)
  const markers: number[] = []
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1))

  while (cursor.getTime() <= end.getTime()) {
    markers.push(cursor.getTime())
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  return markers
}

function ExportIconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="group/button relative inline-flex h-8 w-8 cursor-pointer items-center justify-center border-l border-[#d9def0] first:border-l-0 bg-white text-[#0b1035] hover:bg-[#f7f8ff] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap border border-[#d9def0] bg-white px-2 py-1 text-[11px] text-[#0b1035] shadow-sm group-hover/button:block group-focus-visible/button:block">
        {label}
      </span>
    </button>
  )
}

/* ── Reusable plot chart ─────────────────────────────────────────── */

function getNavDomain(points: ChartPoint[]): [number, number] {
  const values = points.map((point) => point.nav)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
    return [0, 1]
  }
  if (minValue === maxValue) {
    return [minValue - 1, maxValue + 1]
  }

  const padding = (maxValue - minValue) * 0.08
  return [minValue - padding, maxValue + padding]
}

function VisxBrushChart({
  data,
  accentColor,
  currencyCode,
  width,
  height,
  isMobile = false,
}: {
  data: ChartPoint[]
  accentColor: string
  currencyCode: string
  width: number
  height: number
  isMobile?: boolean
}) {
  const mainMargin = { top: 16, right: 20, bottom: 96, left: 74 }
  const brushMargin = { top: 8, right: 20, bottom: 24, left: 74 }
  const brushHeight = 80
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<ChartPoint | null>(null)
  const [isHoverActive, setIsHoverActive] = useState(false)
  const hoverFadeTimeoutRef = useRef<number | null>(null)

  const fullMinTs = data[0]?.xTs ?? 0
  const fullMaxTs = data[data.length - 1]?.xTs ?? 0
  const displayData = useMemo(() => {
    if (!selectedRange) return data
    const [rawStart, rawEnd] = selectedRange
    const start = Math.min(rawStart, rawEnd)
    const end = Math.max(rawStart, rawEnd)

    const inRange = data.filter((point) => point.xTs >= start && point.xTs <= end)
    if (inRange.length >= 2) return inRange

    // Keep at least 2 points in focus so scales and paths remain stable.
    const rightIndex = data.findIndex((point) => point.xTs >= start)
    if (rightIndex <= 0) return data.slice(0, 2)
    if (rightIndex >= data.length - 1) return data.slice(-2)
    return data.slice(rightIndex - 1, rightIndex + 1)
  }, [data, selectedRange])

  let focusMinTs = displayData[0]?.xTs ?? fullMinTs
  let focusMaxTs = displayData[displayData.length - 1]?.xTs ?? fullMaxTs
  if (focusMinTs === focusMaxTs) {
    focusMinTs -= 24 * 60 * 60 * 1000
    focusMaxTs += 24 * 60 * 60 * 1000
  }
  const focusSpanMs = Math.max(focusMaxTs - focusMinTs, 1)
  const focusHeight = height
  const svgHeight = focusHeight + brushHeight + 44

  const focusInnerWidth = Math.max(width - mainMargin.left - mainMargin.right, 1)
  const focusInnerHeight = Math.max(focusHeight - mainMargin.top - mainMargin.bottom, 1)
  const brushInnerWidth = Math.max(width - brushMargin.left - brushMargin.right, 1)
  const brushInnerHeight = Math.max(brushHeight - brushMargin.top - brushMargin.bottom, 1)

  const [focusMinNav, focusMaxNav] = getNavDomain(displayData.length > 1 ? displayData : data)
  const [contextMinNav, contextMaxNav] = getNavDomain(data)
  const focusQuarterlyMarkers = getQuarterlyGridMarkers(focusMinTs, focusMaxTs)
  const focusTickMarkers = (() => {
    const candidateTicks =
      displayData.length <= 12
        ? displayData.map((point) => point.xTs)
        : focusSpanMs <= 92 * 24 * 60 * 60 * 1000
          ? getMonthlyTickMarkers(focusMinTs, focusMaxTs)
          : focusQuarterlyMarkers

    // Always keep the latest visible date on the axis.
    const uniqueTicks = new Set<number>(candidateTicks)
    uniqueTicks.add(focusMaxTs)
    const sortedTicks = Array.from(uniqueTicks).sort((a, b) => a - b)

    if (!isMobile || sortedTicks.length <= 2) return sortedTicks

    // Reduce label density on mobile while preserving first/last ticks.
    const reduced = sortedTicks.filter((_, index) => index === 0 || index === sortedTicks.length - 1 || index % 2 === 0)
    const dedupedReduced = Array.from(new Set(reduced))
    if (dedupedReduced[dedupedReduced.length - 1] !== sortedTicks[sortedTicks.length - 1]) {
      dedupedReduced.push(sortedTicks[sortedTicks.length - 1]!)
    }
    return dedupedReduced
  })()

  const formatFocusTick = (value: number): string => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''

    if (focusSpanMs <= 45 * 24 * 60 * 60 * 1000) {
      return parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    }
    return parsed.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  const formatHoverDate = (value: number): string => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  }

  const focusXScale = scaleTime<number>({
    domain: [new Date(focusMinTs), new Date(focusMaxTs)],
    range: [0, focusInnerWidth],
  })
  const focusYScale = scaleLinear<number>({
    domain: [focusMinNav, focusMaxNav],
    range: [focusInnerHeight, 0],
    nice: true,
  })

  const contextXScale = scaleTime<number>({
    domain: [new Date(fullMinTs), new Date(fullMaxTs)],
    range: [0, brushInnerWidth],
  })
  const contextYScale = scaleLinear<number>({
    domain: [contextMinNav, contextMaxNav],
    range: [brushInnerHeight, 0],
    nice: true,
  })
  const hasVisualClamp = data.length >= 2
  const visualClampStartTs = selectedRange ? Math.min(selectedRange[0], selectedRange[1]) : fullMinTs
  const visualClampEndTs = selectedRange ? Math.max(selectedRange[0], selectedRange[1]) : fullMaxTs
  const visualClampStartX = contextXScale(new Date(visualClampStartTs))
  const visualClampEndX = contextXScale(new Date(visualClampEndTs))

  const resolveHoveredPoint = (localX: number) => {
    if (!displayData.length) return null
    const targetTs = focusXScale.invert(localX).getTime()
    let nearest = displayData[0]!
    let nearestDelta = Math.abs(nearest.xTs - targetTs)

    for (let i = 1; i < displayData.length; i += 1) {
      const candidate = displayData[i]!
      const delta = Math.abs(candidate.xTs - targetTs)
      if (delta < nearestDelta) {
        nearest = candidate
        nearestDelta = delta
      }
    }

    return nearest
  }

  const handleMainHover = (event: React.MouseEvent<SVGRectElement>) => {
    if (hoverFadeTimeoutRef.current !== null) {
      window.clearTimeout(hoverFadeTimeoutRef.current)
      hoverFadeTimeoutRef.current = null
    }
    const bounds = event.currentTarget.getBoundingClientRect()
    const localX = Math.max(0, Math.min(focusInnerWidth, event.clientX - bounds.left))
    setHoveredPoint(resolveHoveredPoint(localX))
    setIsHoverActive(true)
  }

  const handleMainHoverTouch = (event: React.TouchEvent<SVGRectElement>) => {
    const touch = event.touches[0]
    if (!touch) return
    if (hoverFadeTimeoutRef.current !== null) {
      window.clearTimeout(hoverFadeTimeoutRef.current)
      hoverFadeTimeoutRef.current = null
    }
    const bounds = event.currentTarget.getBoundingClientRect()
    const localX = Math.max(0, Math.min(focusInnerWidth, touch.clientX - bounds.left))
    setHoveredPoint(resolveHoveredPoint(localX))
    setIsHoverActive(true)
  }

  const handleMainHoverLeave = () => {
    setIsHoverActive(false)
    if (hoverFadeTimeoutRef.current !== null) {
      window.clearTimeout(hoverFadeTimeoutRef.current)
    }
    hoverFadeTimeoutRef.current = window.setTimeout(() => {
      setHoveredPoint(null)
      hoverFadeTimeoutRef.current = null
    }, 180)
  }

  return (
    <svg
      role="img"
      aria-label={`Interactive ${currencyCode} chart with brush`}
      className="recharts-surface"
      data-main-chart-height={focusHeight}
      width={width}
      height={svgHeight}
      viewBox={`0 0 ${width} ${svgHeight}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <Group left={mainMargin.left} top={mainMargin.top}>
        {focusQuarterlyMarkers.map((markerTs) => (
          <line
            key={`focus-quarter-${markerTs}`}
            x1={focusXScale(new Date(markerTs))}
            x2={focusXScale(new Date(markerTs))}
            y1={0}
            y2={focusInnerHeight}
            stroke="#d9def0"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        <AxisLeft
          scale={focusYScale}
          stroke="#d9def0"
          tickStroke="#d9def0"
          numTicks={5}
          tickLabelProps={() => ({
            fill: '#5f6477',
            fontFamily: chartFontFamily,
            fontSize: 12,
            textAnchor: 'end',
            dy: '0.33em',
            dx: -8,
          })}
          tickFormat={(value) => `${currencyCode} ${Math.round(Number(value))}`}
        />
        <AxisBottom
          top={focusInnerHeight}
          scale={focusXScale}
          stroke="#d9def0"
          tickStroke="#d9def0"
          tickLabelProps={() => ({
            fill: '#5f6477',
            fontFamily: chartFontFamily,
            fontSize: 12,
            textAnchor: 'end',
            dy: 14,
            angle: -90,
          })}
          tickFormat={(value) => formatFocusTick(Number(value))}
          tickValues={focusTickMarkers}
          numTicks={6}
        />
        <LinePath
          data={displayData}
          x={(point) => focusXScale(new Date(point.xTs))}
          y={(point) => focusYScale(point.nav)}
          stroke={accentColor}
          strokeWidth={2}
        />
        {displayData.map((point) => (
          <circle
            key={`focus-dot-${point.xTs}`}
            cx={focusXScale(new Date(point.xTs))}
            cy={focusYScale(point.nav)}
            r={2.75}
            fill="#ffffff"
            stroke={accentColor}
            strokeWidth={1.5}
          />
        ))}
        {hoveredPoint ? (
          <>
            <line
              x1={focusXScale(new Date(hoveredPoint.xTs))}
              x2={focusXScale(new Date(hoveredPoint.xTs))}
              y1={0}
              y2={focusInnerHeight}
              stroke="#aeb9e6"
              strokeWidth={1}
              opacity={isHoverActive ? 1 : 0}
              style={{ transition: 'opacity 180ms ease' }}
            />
            <circle
              cx={focusXScale(new Date(hoveredPoint.xTs))}
              cy={focusYScale(hoveredPoint.nav)}
              r={4}
              fill="#ffffff"
              stroke={accentColor}
              strokeWidth={2}
              opacity={isHoverActive ? 1 : 0}
              style={{ transition: 'opacity 180ms ease' }}
            />
            <Group
              left={
                Math.min(
                  focusInnerWidth - 132,
                  Math.max(8, focusXScale(new Date(hoveredPoint.xTs)) + 10),
                )
              }
              top={Math.max(8, focusYScale(hoveredPoint.nav) - 42)}
              opacity={isHoverActive ? 1 : 0}
              style={{ transition: 'opacity 180ms ease' }}
            >
              <rect
                x={0}
                y={0}
                width={124}
                height={38}
                fill="#ffffff"
                stroke="#d9def0"
                strokeWidth={1}
                rx={0}
              />
              <text
                x={8}
                y={14}
                fill="#0b1035"
                fontFamily={chartFontFamily}
                fontSize={11}
              >
                {formatHoverDate(hoveredPoint.xTs)}
              </text>
              <text
                x={8}
                y={29}
                fill="#0b1035"
                fontFamily={chartFontFamily}
                fontSize={12}
                fontWeight={700}
              >
                {currencyCode} {hoveredPoint.nav.toFixed(2)}
              </text>
            </Group>
          </>
        ) : null}
        <rect
          x={0}
          y={0}
          width={focusInnerWidth}
          height={focusInnerHeight}
          fill="transparent"
          onMouseMove={handleMainHover}
          onMouseLeave={handleMainHoverLeave}
          onTouchStart={handleMainHoverTouch}
          onTouchMove={handleMainHoverTouch}
          onTouchEnd={handleMainHoverLeave}
        />
      </Group>

      <Group
        left={brushMargin.left}
        top={focusHeight + brushMargin.top}
        data-export-exclude="true"
      >
        <LinePath
          data={data}
          x={(point) => contextXScale(new Date(point.xTs))}
          y={(point) => contextYScale(point.nav)}
          stroke={accentColor}
          strokeWidth={1.5}
          opacity={0.85}
        />

        <Brush
          xScale={contextXScale}
          yScale={contextYScale}
          width={brushInnerWidth}
          height={brushInnerHeight}
          margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          resizeTriggerAreas={['left', 'right']}
          brushDirection="horizontal"
          handleSize={8}
          selectedBoxStyle={{ fill: '#2b3dea22', stroke: accentColor }}
          useWindowMoveEvents
          initialBrushPosition={{
            start: { x: 0, y: 0 },
            end: { x: brushInnerWidth, y: brushInnerHeight },
          }}
          onChange={(bounds) => {
            if (!bounds) {
              setSelectedRange(null)
              return
            }
            const x0Value = bounds.x0 as unknown
            const x1Value = bounds.x1 as unknown
            const rawX0 = x0Value instanceof Date ? x0Value.getTime() : Number(x0Value)
            const rawX1 = x1Value instanceof Date ? x1Value.getTime() : Number(x1Value)

            if (!Number.isFinite(rawX0) || !Number.isFinite(rawX1)) {
              setSelectedRange(null)
              return
            }

            // visx Brush may return either:
            // - domain values (timestamps for time scales), or
            // - range values (pixels in/near brush local space).
            const looksLikeDomainValues = rawX0 > 1e10 && rawX1 > 1e10

            let normalizedStartTs = 0
            let normalizedEndTs = 0

            if (looksLikeDomainValues) {
              normalizedStartTs = Math.max(fullMinTs, Math.min(fullMaxTs, Math.min(rawX0, rawX1)))
              normalizedEndTs = Math.max(fullMinTs, Math.min(fullMaxTs, Math.max(rawX0, rawX1)))
            } else {
              const appearsOffsetByGroup =
                (rawX0 > brushInnerWidth + 1 || rawX1 > brushInnerWidth + 1) &&
                rawX0 >= brushMargin.left - 1 &&
                rawX1 >= brushMargin.left - 1

              const localX0 = appearsOffsetByGroup ? rawX0 - brushMargin.left : rawX0
              const localX1 = appearsOffsetByGroup ? rawX1 - brushMargin.left : rawX1

              const clampedStartPx = Math.max(0, Math.min(brushInnerWidth, Math.min(localX0, localX1)))
              const clampedEndPx = Math.max(0, Math.min(brushInnerWidth, Math.max(localX0, localX1)))

              if (Math.abs(clampedEndPx - clampedStartPx) < 0.5) {
                setSelectedRange(null)
                return
              }

              const startTs = contextXScale.invert(clampedStartPx).getTime()
              const endTs = contextXScale.invert(clampedEndPx).getTime()
              normalizedStartTs = Math.max(fullMinTs, Math.min(fullMaxTs, startTs))
              normalizedEndTs = Math.max(fullMinTs, Math.min(fullMaxTs, endTs))
            }

            if (Math.abs(normalizedEndTs - normalizedStartTs) < 1) {
              setSelectedRange(null)
              return
            }

            if (!Number.isFinite(normalizedStartTs) || !Number.isFinite(normalizedEndTs)) {
              setSelectedRange(null)
              return
            }

            setSelectedRange([
              Math.min(normalizedStartTs, normalizedEndTs),
              Math.max(normalizedStartTs, normalizedEndTs),
            ])
          }}
        />
        {hasVisualClamp ? (
          <>
            <Group
              left={visualClampStartX - 6}
              top={Math.max(0, Math.round(brushInnerHeight / 2) - 12)}
              style={{ pointerEvents: 'none' }}
            >
              <rect x={0} y={0} width={12} height={24} fill="#ffffff" stroke="#d9def0" strokeWidth={1} />
              <line x1={5} y1={6} x2={5} y2={18} stroke="#5f6477" strokeWidth={1} />
              <line x1={7} y1={6} x2={7} y2={18} stroke="#5f6477" strokeWidth={1} />
            </Group>
            <Group
              left={visualClampEndX - 6}
              top={Math.max(0, Math.round(brushInnerHeight / 2) - 12)}
              style={{ pointerEvents: 'none' }}
            >
              <rect x={0} y={0} width={12} height={24} fill="#ffffff" stroke="#d9def0" strokeWidth={1} />
              <line x1={5} y1={6} x2={5} y2={18} stroke="#5f6477" strokeWidth={1} />
              <line x1={7} y1={6} x2={7} y2={18} stroke="#5f6477" strokeWidth={1} />
            </Group>
          </>
        ) : null}

        <AxisBottom
          top={brushInnerHeight}
          scale={contextXScale}
          stroke="#d9def0"
          tickStroke="#d9def0"
          tickLabelProps={() => ({
            fill: '#5f6477',
            fontFamily: chartFontFamily,
            fontSize: 11,
            textAnchor: 'middle',
            dy: 10,
          })}
          tickFormat={(value) => formatTimelineTick(Number(value))}
        />
      </Group>
    </svg>
  )
}

function NavPlotChart({
  data,
  accentColor,
  currencyCode,
  height = 300,
  exportFileName,
  exportSvgTooltip = 'Export SVG',
  exportCsvTooltip = 'Export CSV',
  historyLabel = 'NAV History',
  lastAddedValueDateLabel = 'N/A',
  badgeLabel,
}: {
  data: ChartPoint[]
  accentColor: string
  currencyCode: string
  height?: number
  exportFileName: string
  exportSvgTooltip?: string
  exportCsvTooltip?: string
  historyLabel?: string
  lastAddedValueDateLabel?: string
  badgeLabel?: string
}) {
  type TimeRange = '1Y' | '3Y' | '5Y' | 'ALL'
  const chartContainerRef = useRef<HTMLDivElement | null>(null)
  const [exportingType, setExportingType] = useState<'svg' | 'csv' | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [chartWidth, setChartWidth] = useState(0)
  const [timeRange, setTimeRange] = useState<TimeRange>('ALL')
  const filteredSeries = useMemo(() => {
    if (timeRange === 'ALL') return data
    const latestTs = data[data.length - 1]?.xTs
    if (!latestTs) return data

    const start = new Date(latestTs)
    if (timeRange === '1Y') start.setUTCFullYear(start.getUTCFullYear() - 1)
    if (timeRange === '3Y') start.setUTCFullYear(start.getUTCFullYear() - 3)
    if (timeRange === '5Y') start.setUTCFullYear(start.getUTCFullYear() - 5)

    const startTs = start.getTime()
    const rangeData = data.filter((point) => point.xTs >= startTs)
    return rangeData.length >= 2 ? rangeData : data
  }, [data, timeRange])

  const plotData = filteredSeries
  const csvFileName = exportFileName.replace(/\.(png|svg)$/i, '.csv')

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const container = chartContainerRef.current
    if (!container) return

    const updateWidth = (nextWidth: number) => {
      setChartWidth(nextWidth > 0 ? Math.floor(nextWidth) : 0)
    }

    updateWidth(container.getBoundingClientRect().width)

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      updateWidth(entry.contentRect.width)
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  const downloadBlob = (blob: Blob, fileName: string) => {
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const exportAsSvg = async () => {
    const container = chartContainerRef.current
    if (!container) return

    const svg = container.querySelector('svg')
    if (!svg) return

    setExportingType('svg')

    try {
      const serializer = new XMLSerializer()
      const svgClone = svg.cloneNode(true) as SVGSVGElement
      svgClone
        .querySelectorAll('[data-export-exclude="true"]')
        .forEach((node) => node.parentNode?.removeChild(node))

      const mainChartHeight = Number(svgClone.getAttribute('data-main-chart-height'))
      if (Number.isFinite(mainChartHeight) && mainChartHeight > 0) {
        const currentViewBox = svgClone.getAttribute('viewBox')
        if (currentViewBox) {
          const parts = currentViewBox.trim().split(/\s+/)
          if (parts.length === 4) {
            parts[3] = String(mainChartHeight)
            svgClone.setAttribute('viewBox', parts.join(' '))
          }
        }
        svgClone.setAttribute('height', String(mainChartHeight))
      }

      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      const rootStyles = getComputedStyle(document.documentElement)
      const resolvedDisplayFont = rootStyles.getPropertyValue('--font-display').trim().replace(/^['"]|['"]$/g, '')
      const exportFontFamily = resolvedDisplayFont
        ? `${resolvedDisplayFont}, ui-sans-serif, system-ui, sans-serif`
        : 'ui-sans-serif, system-ui, sans-serif'
      svgClone.style.fontFamily = exportFontFamily
      svgClone.querySelectorAll<SVGElement>('[font-family], text, tspan').forEach((node) => {
        node.setAttribute('font-family', exportFontFamily)
        const inlineStyle = node.getAttribute('style')
        if (inlineStyle?.includes('font-family')) {
          node.setAttribute(
            'style',
            inlineStyle.replace(/font-family\s*:\s*[^;]+;?/i, `font-family:${exportFontFamily};`),
          )
        }
      })
      const svgMarkup = serializer.serializeToString(svgClone)
      const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
      downloadBlob(svgBlob, exportFileName)
    } finally {
      setExportingType(null)
    }
  }

  const exportAsCsv = () => {
    setExportingType('csv')
    try {
      const rows = [
        ['Date', 'NAV'],
        ...plotData.map((point) => [
          new Date(point.xTs).toISOString().slice(0, 10),
          point.nav.toFixed(2),
        ]),
      ]
      const csv = rows.map((row) => row.join(',')).join('\n')
      const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(csvBlob, csvFileName)
    } finally {
      setExportingType(null)
    }
  }

  const canRenderChart = chartWidth > 0 && height > 0

  return (
    <div className="group/chart w-full">
      <div className="container mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-[14px] md:text-[15px] text-[#5f6477] font-sans italic">
          <span>{historyLabel} | Last update: {lastAddedValueDateLabel}</span>
          {badgeLabel ? (
            <span className="inline-flex items-center border border-[#d9def0] bg-white px-2 py-0.5 text-[11px] text-[#5f6477]">
              {badgeLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <div className="inline-flex border border-[#d9def0] rounded-none bg-white">
            {(['1Y', '3Y', '5Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`h-8 min-w-10 cursor-pointer border-l border-[#d9def0] px-2 text-[11px] font-medium transition-colors first:border-l-0 ${
                  timeRange === range
                    ? 'bg-[#eef2ff] text-[#0b1035]'
                    : 'text-[#5f6477] hover:bg-[#f7f8ff]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <div className="inline-flex border border-[#d9def0] rounded-none bg-white">
            <ExportIconButton label={exportSvgTooltip} onClick={exportAsSvg} disabled={exportingType !== null}>
              {exportingType === 'svg' ? (
                <span className="text-[11px]">...</span>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="9" cy="10" r="1.5" fill="currentColor" />
                  <path d="M5.5 17l4.2-4.2a1 1 0 0 1 1.4 0l2.3 2.3a1 1 0 0 0 1.4 0l1.7-1.7a1 1 0 0 1 1.4 0L20.5 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </ExportIconButton>
            <ExportIconButton label={exportCsvTooltip} onClick={exportAsCsv} disabled={exportingType !== null}>
              {exportingType === 'csv' ? (
                <span className="text-[11px]">...</span>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M7 3.5h7l4 4v13H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M14 3.5v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8.5 14h7M8.5 17h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </ExportIconButton>
          </div>
        </div>
      </div>
      <div
        ref={chartContainerRef}
        className="relative w-full overflow-x-clip overflow-y-visible"
        style={{ height: height + 124 }}
      >
        {canRenderChart ? (
          <VisxBrushChart
            data={plotData}
            accentColor={accentColor}
            currencyCode={currencyCode}
            width={chartWidth}
            height={height}
            isMobile={isMobile}
          />
        ) : (
          <div className="h-full w-full" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

/* ── Exported composite component ────────────────────────────────── */

export function PerformanceChart({
  usdSeries = [],
  chfSeries = [],
  exportSvgTooltip = 'Export SVG',
  exportCsvTooltip = 'Export CSV',
}: {
  usdSeries?: PerformanceNavPoint[]
  chfSeries?: PerformanceNavPoint[]
  exportSvgTooltip?: string
  exportCsvTooltip?: string
}) {
  const hasUSDFromCMS = usdSeries.length > 0
  const hasCHFFromCMS = chfSeries.length > 0
  const usdData = hasUSDFromCMS ? mapCMSSeries(usdSeries) : usdNavSeries
  const chfData = hasCHFFromCMS ? mapCMSSeries(chfSeries) : chfNavSeries
  const usdLastAddedValueDate = formatLastValueDate(usdData[usdData.length - 1]?.xTs)
  const chfLastAddedValueDate = formatLastValueDate(chfData[chfData.length - 1]?.xTs)

  return (
    <div className="grid grid-cols-1 gap-8 font-display">
      {/* USD Share Class */}
      <div className="w-full">
        <div className="container">
          <h3 className="text-[15px] font-semibold text-[#0b1035] mb-1">USD Share Class</h3>
        </div>
        <div className="w-full">
          <NavPlotChart
            data={usdData}
            accentColor="#2b3dea"
            currencyCode="USD"
            height={300}
            exportFileName="usd-share-class-performance.svg"
            exportSvgTooltip={exportSvgTooltip}
            exportCsvTooltip={exportCsvTooltip}
            historyLabel={hasUSDFromCMS ? 'NAV History' : 'NAV History (Quarterly Points)'}
            lastAddedValueDateLabel={usdLastAddedValueDate}
            badgeLabel={!hasUSDFromCMS ? '2016-2026' : undefined}
          />
        </div>
        <p className="container mt-2 pb-4 text-center text-[13px] md:text-[14px] text-[#5f6477] font-sans italic">
          Net of all fees. Past performance is not indicative of future results.
        </p>
      </div>

      {/* CHF Hedged Share Class */}
      <div className="w-full">
        <div className="container">
          <h3 className="text-[15px] font-semibold text-[#0b1035] mb-1">CHF Hedged Share Class</h3>
        </div>
        <div className="w-full">
          <NavPlotChart
            data={chfData}
            accentColor="#0f3bbf"
            currencyCode="CHF"
            height={300}
            exportFileName="chf-hedged-share-class-performance.svg"
            exportSvgTooltip={exportSvgTooltip}
            exportCsvTooltip={exportCsvTooltip}
            historyLabel={hasCHFFromCMS ? 'NAV History' : 'NAV History (Since Inception Oct 2025)'}
            lastAddedValueDateLabel={chfLastAddedValueDate}
          />
        </div>
        <p className="container mt-2 pb-4 text-center text-[13px] md:text-[14px] text-[#5f6477] font-sans italic">
          Net of all fees. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  )
}
