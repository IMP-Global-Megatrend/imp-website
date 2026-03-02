import Link from 'next/link'
import React from 'react'
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
    <div className="min-h-screen bg-white text-[#0b1035]">
      <TrackingConsentManager />
      <SiteHeader navItems={headerNavItems} />
      <ContentGatePopup />

      {children}

      {/* Footer */}
      <footer className="bg-primary text-white">
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
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
