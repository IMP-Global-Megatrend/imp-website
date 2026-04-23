'use client'

import React, { useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <nav className="hidden md:flex gap-6 items-center">
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-sm text-foreground/70 hover:text-[var(--primary)] transition-colors"
            />
          )
        })}
        <Link
          href="/contact-us"
          className="text-sm bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Contact
        </Link>
      </nav>

      <button
        className="md:hidden text-foreground"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <XMarkIcon className="size-6" aria-hidden /> : <Bars3Icon className="size-6" aria-hidden />}
      </button>

      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--background)] border-b border-border/50 md:hidden z-50">
          <nav className="container py-4 flex flex-col gap-3">
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  {...link}
                  appearance="link"
                  className="text-sm text-foreground/70 hover:text-[var(--primary)] transition-colors py-2"
                />
              )
            })}
            <Link
              href="/contact-us"
              className="text-sm bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity text-center mt-2"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
