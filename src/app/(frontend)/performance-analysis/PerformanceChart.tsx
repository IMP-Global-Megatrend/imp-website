'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

/* ── USD Share Class — quarterly NAV → annual returns ────────────── */

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

const usdAnnualPerformance = Object.entries(usdYearEndNav)
  .slice(1)
  .map(([yearStr, nav]) => {
    const year = Number(yearStr)
    const prevNav = usdYearEndNav[year - 1]!
    const pct = ((nav - prevNav) / prevNav) * 100
    return { label: yearStr, pct: Math.round(pct * 100) / 100 }
  })

/* ── CHF Hedged Share Class — monthly NAV → monthly returns ──────── */

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

const chfMonthlyPerformance = chfMonthlyNav.slice(1).map((entry, i) => {
  const prev = chfMonthlyNav[i]!
  const pct = ((entry.nav - prev.nav) / prev.nav) * 100
  const mm = entry.date.split('-')[1]!
  return {
    label: `${monthShort[mm]} '${entry.date.slice(2, 4)}`,
    pct: Math.round(pct * 100) / 100,
  }
})

/* ── Shared tooltip ──────────────────────────────────────────────── */

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ value: number; payload: { label: string } }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!
  return (
    <div className="rounded-lg border border-[#d9def0] bg-white px-3 py-2 text-[13px] shadow-md">
      <p className="font-semibold text-[#0b1035]">{d.payload.label}</p>
      <p className={d.value >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}>
        {d.value >= 0 ? '+' : ''}
        {d.value.toFixed(2)}%
      </p>
    </div>
  )
}

/* ── Reusable bar chart ──────────────────────────────────────────── */

function ReturnBarChart({
  data,
  accentColor,
  height = 300,
}: {
  data: Array<{ label: string; pct: number }>
  accentColor: string
  height?: number
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 4 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#5f6477' }}
            axisLine={{ stroke: '#d9def0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#5f6477' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
            width={54}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,64,255,0.04)' }} />
          <ReferenceLine y={0} stroke="#a0a5b8" strokeWidth={1} />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]} maxBarSize={52}>
            {data.map((entry) => (
              <Cell
                key={entry.label}
                fill={entry.pct >= 0 ? accentColor : '#dc2626'}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Exported composite component ────────────────────────────────── */

export function PerformanceChart() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* USD Share Class */}
      <div className="rounded-xl border border-[#d9def0] bg-[#f5f7ff] p-4 md:p-6">
        <h3 className="text-[15px] font-semibold text-[#0b1035] mb-1">USD Share Class</h3>
        <p className="text-[12px] text-[#5f6477] mb-3">Annual Returns (2017–2025)</p>
        <ReturnBarChart data={usdAnnualPerformance} accentColor="#2b3dea" height={300} />
        <p className="text-[11px] text-[#5f6477] mt-2 text-center">
          Net of all fees. Past performance is not indicative of future results.
        </p>
      </div>

      {/* CHF Hedged Share Class */}
      <div className="rounded-xl border border-[#d9def0] bg-[#f5f7ff] p-4 md:p-6">
        <h3 className="text-[15px] font-semibold text-[#0b1035] mb-1">CHF Hedged Share Class</h3>
        <p className="text-[12px] text-[#5f6477] mb-3">Monthly Returns (Since Inception Oct 2025)</p>
        <ReturnBarChart data={chfMonthlyPerformance} accentColor="#0f3bbf" height={300} />
        <p className="text-[11px] text-[#5f6477] mt-2 text-center">
          Net of all fees. Past performance is not indicative of future results.
        </p>
      </div>
    </div>
  )
}
