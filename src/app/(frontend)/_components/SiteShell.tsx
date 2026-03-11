import Link from 'next/link'
import React from 'react'
import { ContentGatePopup } from '@/app/(frontend)/_components/ContentGatePopup'
import { RegulatoryNotice } from '@/app/(frontend)/_components/RegulatoryNotice'
import { SiteHeader } from '@/app/(frontend)/_components/SiteHeader'
import { TrackingConsentManager } from '@/app/(frontend)/_components/TrackingConsentManager'
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
const requiredFooterOrder = [
  'The Fund',
  'Our Megatrends',
  'Portfolio Strategy',
  'Performance Analysis',
  'About Us',
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

function buildFooterNav(footerNavItems: NavItem[]): NavItem[] {
  const byLabel = new Map<string, NavItem>()
  for (const item of footerNavItems) {
    byLabel.set(item.label, item)
  }
  for (const item of footerNav) {
    if (!byLabel.has(item.label)) byLabel.set(item.label, item)
  }

  const required = requiredFooterOrder
    .map((label) => byLabel.get(label))
    .filter((item): item is NavItem => Boolean(item))
  const rest = Array.from(byLabel.values()).filter((item) => !requiredFooterOrder.includes(item.label))

  return [...required, ...rest]
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const currentYear = new Date().getFullYear()
  let headerData: Header | null = null
  let footerData: Footer | null = null

  try {
    ;[headerData, footerData] = await Promise.all([
      getCachedGlobal('header', 1)() as Promise<Header>,
      getCachedGlobal('footer', 1)() as Promise<Footer>,
    ])
  } catch {}

  const headerNavItems =
    headerData?.navItems
      ?.map((item) => resolveCMSLink(item?.link))
      .filter(Boolean)
      .map((item) => item as NavItem) || []

  const cmsFooterNavItems =
    footerData?.navItems
      ?.map((item) => resolveCMSLink(item?.link))
      .filter(Boolean)
      .map((item) => item as NavItem) || footerNav
  const footerNavItems = buildFooterNav(cmsFooterNavItems)

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
          <div className="mb-6 lg:mb-7">
            <Link href="/" className="inline-flex max-w-full items-center gap-2.5 min-h-[44px]">
              <svg
                className="size-[44px] shrink-0"
                viewBox="0 0 28 28"
                role="img"
                aria-label="IMP logo mark"
              >
                <path
                  fill="#ffffff"
                  d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28"
                />
                <path
                  fill="#ffffff"
                  d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z"
                />
              </svg>
              <span className="ml-1 min-w-0 font-display font-semibold text-[17px] md:text-[20px] leading-[1.05] tracking-[0.01em] text-white whitespace-normal">
                IMP Global Megatrend{' '}
                <span className="[font-family:var(--font-display-regular)] font-normal whitespace-nowrap">
                  Umbrella Fund
                </span>
              </span>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
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
            </nav>

            {/* Social column */}
            <nav className="flex flex-col gap-3">
              <a
                href="https://www.linkedin.com/company/mrb-fund-partners-ag"
                rel="noreferrer"
                target="_blank"
                className="mt-1 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
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
                <span className="font-display text-[15px]">MRB Fund Partners AG</span>
              </a>
              <a
                href="https://www.instagram.com/imp_gmt_fund?"
                rel="noreferrer"
                target="_blank"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37a4 4 0 1 1-7.74 1.26 4 4 0 0 1 7.74-1.26z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                <span className="font-display text-[15px]">IMP Global Megatrend</span>
              </a>
            </nav>
          </div>
        </div>

        <RegulatoryNotice />

        {/* Copyright bar */}
        <div className="border-t border-white/10">
          <div className="container py-6">
            <p className="text-[15px] font-light italic text-white/80">
              © {currentYear} IMP Global Megatrend Umbrella Fund. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
