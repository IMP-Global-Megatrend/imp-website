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
              <Link href="/about-us" className="text-sm text-foreground/60 hover:text-foreground transition-colors">About Us</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--primary)] mb-4 uppercase tracking-wider">
              Downloads
            </h4>
            <nav className="flex flex-col gap-2.5">
              <a href="https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Factsheet USD</a>
              <a href="https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Factsheet CHF Hedged</a>
              <a href="https://www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Fund Commentary</a>
              <a href="https://www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Presentation</a>
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
