'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

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
    <div className="rounded-lg border border-[#d9def0] bg-white px-3 py-2 text-[13px] shadow-md">
      <p className="font-semibold text-[#0b1035]">{d.name}</p>
      <p className="text-[#5f6477]">{d.value}%</p>
    </div>
  )
}

export function AllocationDonut({
  data,
  size = 220,
}: {
  data: Array<[string, string, string]>
  size?: number
}) {
  const slices: Slice[] = data.map(([name, pct, color]) => ({
    name: name!,
    value: Number(pct),
    color: color!,
  }))

  return (
    <div className="flex justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="50%"
            innerRadius={size * 0.3}
            outerRadius={size * 0.46}
            dataKey="value"
            stroke="none"
            paddingAngle={1}
          >
            {slices.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
