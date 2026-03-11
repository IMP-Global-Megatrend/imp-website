import { HeaderClient } from '@/Header/Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'

const fallbackNavItems = [
  { link: { type: 'custom' as const, label: 'The Fund', url: '/fund' } },
  { link: { type: 'custom' as const, label: 'Our Megatrends', url: '/megatrends' } },
  { link: { type: 'custom' as const, label: 'Portfolio Strategy', url: '/portfolio-strategy' } },
  { link: { type: 'custom' as const, label: 'Performance', url: '/performance-analysis' } },
  { link: { type: 'custom' as const, label: 'About Us', url: '/about-us' } },
]

export async function Header() {
  let headerData: Header | null = null
  try {
    headerData = await getCachedGlobal('header', 1)()
  } catch {
    // CMS not available, use fallback
  }

  const data = headerData?.navItems?.length
    ? headerData
    : ({ navItems: fallbackNavItems } as unknown as Header)

  return <HeaderClient data={data} />
}
