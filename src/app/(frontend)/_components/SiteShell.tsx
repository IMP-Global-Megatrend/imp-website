import Link from 'next/link'
import React from 'react'
import { AnimatedIcon } from './AnimatedIcon'
import { ContentGatePopup } from './ContentGatePopup'
import { SiteHeader } from './SiteHeader'
import { TrackingConsentManager } from './TrackingConsentManager'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { Footer, Header } from '@/payload-types'

type NavItem = { href: string; label: string; newTab?: boolean }

const footerNav: NavItem[] = [
  { href: '/fund', label: 'The Fund' },
  { href: '/megatrends', label: 'Our Megatrends' },
  { href: '/portfolio-strategy', label: 'Portfolio Strategy' },
  { href: '/performance-analysis', label: 'Performance Analysis' },
  { href: '/about-us', label: 'About Us' },
]

const footerLegal: NavItem[] = [
  { href: '/legal-information', label: 'Regulatory & Legal Information' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/contact-us', label: 'Contact Us' },
]

function resolveCMSLink(link?: {
  type?: 'reference' | 'custom' | null
  url?: string | null
  label?: string | null
  newTab?: boolean | null
  reference?:
    | { relationTo: 'pages' | 'posts'; value: number | { slug?: string | null } }
    | null
}): NavItem | null {
  if (!link?.label) return null

  let href = link.url || ''
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = link.reference.value?.slug
    if (slug) {
      href = link.reference.relationTo === 'pages' ? `/${slug}` : `/${link.reference.relationTo}/${slug}`
    }
  }

  if (!href) return null
  return { href, label: link.label, newTab: link.newTab ?? false }
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  let headerData: Header | null = null
  let footerData: Footer | null = null

  try {
    ;[headerData, footerData] = await Promise.all([
      getCachedGlobal('header', 1)() as Promise<Header>,
      getCachedGlobal('footer', 1)() as Promise<Footer>,
    ])
  } catch {
    // Fall back to hardcoded nav if CMS is unavailable.
  }

  const headerNavItems =
    headerData?.navItems
      ?.map((item) => resolveCMSLink(item?.link))
      .filter(Boolean)
      .map((item) => item as NavItem) || []

  const footerNavItems =
    footerData?.navItems
      ?.map((item) => resolveCMSLink(item?.link))
      .filter(Boolean)
      .map((item) => item as NavItem) || footerNav

  return (
    <div className="min-h-screen bg-primary text-[#0b1035]">
      <TrackingConsentManager />
      <div data-transition-region="header" className="relative z-[80]">
        <SiteHeader navItems={headerNavItems} />
      </div>
      <ContentGatePopup />

      {children}

      {/* Footer */}
      <footer className="bg-primary text-white" data-transition-region="footer">
        <div className="container py-14 md:py-16">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {/* Logo column */}
            <div className="flex items-start gap-3">
              <img
                alt="IMP Global Megatrend Umbrella Fund"
                className="h-10 w-auto"
                src="/original-logo.svg"
              />
            </div>

            {/* Nav column */}
            <nav className="flex flex-col gap-3">
              {footerNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.newTab ? '_blank' : undefined}
                  rel={item.newTab ? 'noopener noreferrer' : undefined}
                  className="font-display text-[15px] text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Legal column */}
            <nav className="flex flex-col gap-3">
              {footerLegal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display text-[15px] text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="https://www.linkedin.com/company/mrb-fund-partners-ag"
                rel="noreferrer"
                target="_blank"
                className="mt-1 inline-flex items-center text-white/80 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <AnimatedIcon name="linkedin" size={20} className="text-current" />
              </a>
            </nav>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/10">
          <div className="container py-6">
            <p className="text-[13px] text-white/50">
              © 2025 IMP Global Megatrend Umbrella Fund. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
