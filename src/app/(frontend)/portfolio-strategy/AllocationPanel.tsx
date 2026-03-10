'use client'

import { useState } from 'react'
import {
  Bank,
  Broadcast,
  Cpu,
  Factory,
  Heartbeat,
  Lightning,
  ShoppingBag,
  ShoppingCartSimple,
  type Icon,
} from '@phosphor-icons/react'
import { AllocationDonut } from './AllocationCharts'

type AllocationDatum = [string, string, string, string?]

type AllocationPanelProps = {
  title: string
  data: AllocationDatum[]
}

const sectorIconByLabel: Record<string, Icon> = {
  'consumer discretionary': ShoppingBag,
  'info technology': Cpu,
  industrials: Factory,
  healthcare: Heartbeat,
  'consumer staples': ShoppingCartSimple,
  utilities: Lightning,
  'comm services': Broadcast,
  financials: Bank,
}

const countryCodeByLabel: Record<string, string> = {
  usa: 'us',
  'united states': 'us',
  italy: 'it',
  france: 'fr',
  switzerland: 'ch',
  china: 'cn',
  uruguay: 'uy',
  netherlands: 'nl',
  denmark: 'dk',
  turkey: 'tr',
  'united kingdom': 'gb',
}

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const iconByKey: Record<string, Icon> = {
  bank: Bank,
  broadcast: Broadcast,
  cpu: Cpu,
  factory: Factory,
  heartbeat: Heartbeat,
  lightning: Lightning,
  shoppingbag: ShoppingBag,
  shoppingcartsimple: ShoppingCartSimple,
}

function normalizeIconKey(icon: string): string {
  return icon.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function formatDisplayPercent(value: string): string {
  const parsed = Number(value.replace('%', '').trim())
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00'
}

export function AllocationPanel({ title, data }: AllocationPanelProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const isGeographicPanel = normalizeLabel(title).includes('geographic')

  return (
    <div>
      <div className="mb-4 h-px -mx-4 w-[calc(100%+2rem)] bg-[#d9def0] md:hidden" />
      <h3 className="text-[12px] uppercase tracking-[0.12em] text-[#5f6477] mb-4">{title}</h3>
      <AllocationDonut data={data} activeIndex={activeIndex} onActiveIndexChange={setActiveIndex} />
      <div className="mt-5 overflow-hidden border-y border-[#d9def0] text-sm font-display text-[#2b3045]">
        {data.map(([name, pct, color, iconKey], index) => {
          const key = normalizeLabel(name)
          const countryCode = countryCodeByLabel[key]
          const cmsIcon = typeof iconKey === 'string' && iconKey.trim() ? iconByKey[normalizeIconKey(iconKey)] : null
          const SectorIcon = cmsIcon ?? sectorIconByLabel[key]

          return (
          <div
            key={name}
            className={`flex items-center gap-3 py-2 transition-colors ${index < data.length - 1 ? 'border-b border-[#d9def0]' : ''} ${activeIndex === index ? 'bg-[#f5f8ff]' : ''}`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {isGeographicPanel && countryCode ? (
              <img
                src={`https://flagcdn.com/w40/${countryCode}.png`}
                alt=""
                aria-hidden
                className="h-4 w-4 shrink-0 rounded-full border object-cover"
                style={{ borderColor: '#6b7280' }}
                loading="lazy"
              />
            ) : SectorIcon ? (
              <SectorIcon
                size={16}
                weight="duotone"
                className="shrink-0"
                style={{ color }}
                aria-hidden
              />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            )}
            <span className="flex-1">{name}</span>
            <span className="font-medium text-[#0b1035]">{formatDisplayPercent(pct)}%</span>
          </div>
          )
        })}
      </div>
    </div>
  )
}
