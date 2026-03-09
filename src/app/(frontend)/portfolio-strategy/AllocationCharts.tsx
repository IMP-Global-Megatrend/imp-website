'use client'

import { PieChart, Pie, Cell, Tooltip } from 'recharts'

type Slice = { name: string; value: number; color: string }

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: Slice }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  return (
    <div className="border border-[#d9def0] bg-white px-3 py-2 text-sm font-display shadow-md">
      {d.name ? <p className="font-medium text-[#0b1035]">{d.name}</p> : null}
      <p className="text-[#5f6477]">{d.value}%</p>
    </div>
  )
}

export function AllocationDonut({
  data,
  size = 260,
  activeIndex,
  onActiveIndexChange,
}: {
  data: Array<[string, string, string]>
  size?: number
  activeIndex?: number | null
  onActiveIndexChange?: (index: number | null) => void
}) {
  const slices: Slice[] = data.map(([name, pct, color]) => ({
    name: name!,
    value: Number(pct),
    color: color!,
  }))

  return (
    <div className="mx-auto flex justify-center" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie
          data={slices}
          cx="50%"
          cy="50%"
          innerRadius={size * 0.3}
          outerRadius={size * 0.46}
          dataKey="value"
          stroke="none"
          paddingAngle={1}
          onMouseEnter={(_, index) => onActiveIndexChange?.(index)}
          onMouseLeave={() => onActiveIndexChange?.(null)}
        >
          {slices.map((s, index) => {
            const isActive = activeIndex == null || activeIndex === index
            return (
              <Cell
                key={s.name}
                fill={s.color}
                style={{
                  opacity: isActive ? 1 : 0.58,
                  transition: 'opacity 320ms ease',
                }}
              />
            )
          })}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
      </PieChart>
    </div>
  )
}
