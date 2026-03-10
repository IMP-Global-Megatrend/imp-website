import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  let footerData: Footer | null = null
  try {
    footerData = await getCachedGlobal('footer', 1)()
  } catch {
    // CMS not available
  }

  const navItems = footerData?.navItems || []
  const footerDownloads = [
    { label: 'Factsheet USD', media: footerData?.downloads?.factsheetUsd },
    { label: 'Factsheet CHF Hedged', media: footerData?.downloads?.factsheetChfHedged },
    { label: 'Fund Commentary', media: footerData?.downloads?.fundCommentary },
    { label: 'Presentation', media: footerData?.downloads?.presentation },
  ]
    .map((item) => {
      if (!item.media || typeof item.media !== 'object') return null
      const href = typeof item.media.url === 'string' ? item.media.url.trim() : ''
      if (!href) return null
      return { label: item.label, href }
    })
    .filter((item): item is { label: string; href: string } => Boolean(item))

  return (
    <footer className="mt-auto border-t border-border/30 bg-[var(--card)]">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link className="flex items-center mb-4" href="/">
              <Logo />
            </Link>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Investing in the forces that shape tomorrow.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--primary)] mb-4 uppercase tracking-wider">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/fund" className="text-sm text-foreground/60 hover:text-foreground transition-colors">The Fund</Link>
              <Link href="/megatrends" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Our Megatrends</Link>
              <Link href="/portfolio-strategy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Portfolio Strategy</Link>
              <Link href="/performance-analysis" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Performance Analysis</Link>
              <Link href="/articles" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Articles</Link>
              <Link href="/about-us" className="text-sm text-foreground/60 hover:text-foreground transition-colors">About Us</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--primary)] mb-4 uppercase tracking-wider">
              Downloads
            </h4>
            <nav className="flex flex-col gap-2.5">
              {footerDownloads.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--primary)] mb-4 uppercase tracking-wider">
              Contact
            </h4>
            <div className="flex flex-col gap-2.5 text-sm text-foreground/60">
              <p>MRB Fund Partners AG</p>
              <p>Fraumünsterstrasse 9</p>
              <p>8001 Zürich</p>
              <a href="https://www.mrbpartner.ch" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">www.mrbpartner.ch</a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-foreground/40">
            &copy; {new Date().getFullYear()} IMP Global Megatrend Umbrella Fund. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/legal-information" className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              Legal Information
            </Link>
            <Link href="/privacy-policy" className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors">
              Privacy Policy
            </Link>
            {navItems.map(({ link }, i) => (
              <CMSLink className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors" key={i} {...link} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
