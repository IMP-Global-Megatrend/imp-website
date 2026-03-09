'use client'

import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'

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

/* ── Shared tooltip ──────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
  currencyCode,
}: {
  active?: boolean
  payload?: Array<{ dataKey?: string; value?: number; payload?: { displayLabel?: string; xTs?: number } }>
  currencyCode: string
}) {
  if (!active || !payload?.length) return null
  const navPoint = payload.find((entry) => entry.dataKey === 'nav')
  const label =
    navPoint?.payload?.displayLabel ??
    payload[0]?.payload?.displayLabel ??
    (typeof payload[0]?.payload?.xTs === 'number' ? formatTimelineTick(payload[0].payload.xTs) : '')
  const navValue = typeof navPoint?.value === 'number' ? navPoint.value : null

  return (
    <div className="border border-[#d9def0] bg-white px-3 py-2 text-[13px] shadow-md font-display">
      <p className="font-medium text-[#0b1035]">{label}</p>
      {navValue !== null && (
        <p className="text-[#0b1035]">
          {currencyCode} {navValue.toFixed(2)}
        </p>
      )}
    </div>
  )
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

function NavPlotChart({
  data,
  accentColor,
  currencyCode,
  height = 300,
  exportFileName,
  exportSvgTooltip = 'Export SVG',
  exportCsvTooltip = 'Export CSV',
  timelineTickCadence = 'quarterly',
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
  timelineTickCadence?: 'monthly' | 'quarterly'
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
  const dotRadius = isMobile ? 1.75 : 2.75
  const activeDotRadius = isMobile ? 2.5 : 3.5
  const dotStrokeWidth = isMobile ? 1.25 : 1.5
  const formatTick = (value: number) => `${currencyCode} ${Math.round(value)}`
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
  const minTs = plotData[0]?.xTs ?? 0
  const maxTs = plotData[plotData.length - 1]?.xTs ?? 0
  const quarterlyGridMarkers = getQuarterlyGridMarkers(minTs, maxTs)
  const timelineTickMarkers =
    timelineTickCadence === 'monthly'
      ? getMonthlyTickMarkers(minTs, maxTs)
      : quarterlyGridMarkers
  const xAxisInterval = 0
  const xAxisMinTickGap = timelineTickCadence === 'monthly' ? 12 : 0
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
      <div ref={chartContainerRef} className="relative w-full overflow-visible" style={{ height }}>
        {canRenderChart ? (
          <LineChart width={chartWidth} height={height} data={plotData} margin={{ top: 16, right: 20, left: 8, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical stroke="#e5e7f0" />
            <XAxis
              type="number"
              dataKey="xTs"
              scale="time"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 12, fill: '#5f6477', fontFamily: chartFontFamily }}
              axisLine={{ stroke: '#d9def0' }}
              tickLine={false}
              tickFormatter={formatTimelineTick}
              ticks={timelineTickMarkers}
              interval={xAxisInterval}
              minTickGap={xAxisMinTickGap}
              angle={-90}
              textAnchor="end"
              tickMargin={18}
              height={96}
            />
            <YAxis
              yAxisId="nav"
              tick={{ fontSize: 12, fill: '#5f6477', fontFamily: chartFontFamily }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatTick}
              width={74}
            />
            <Tooltip content={<ChartTooltip currencyCode={currencyCode} />} cursor={{ fill: 'rgba(0,64,255,0.04)' }} />
            {quarterlyGridMarkers.map((xValue) => (
              <ReferenceLine
                key={`vline-${xValue}`}
                x={xValue}
                stroke="#d9def0"
                strokeDasharray="2 4"
                strokeWidth={1}
              />
            ))}
            <Line
              yAxisId="nav"
              type="monotone"
              dataKey="nav"
              stroke={accentColor}
              strokeWidth={2}
              dot={{ r: dotRadius, stroke: accentColor, strokeWidth: dotStrokeWidth, fill: '#ffffff' }}
              activeDot={{ r: activeDotRadius, stroke: accentColor, strokeWidth: dotStrokeWidth, fill: '#ffffff' }}
            />
          </LineChart>
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
            timelineTickCadence="monthly"
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
