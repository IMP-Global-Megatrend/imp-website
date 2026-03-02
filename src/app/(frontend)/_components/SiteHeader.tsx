'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const fallbackNav = [
  { href: '/fund', label: ['The', 'Fund'] },
  { href: '/megatrends', label: ['Our', 'Megatrends'] },
  { href: '/portfolio-strategy', label: ['Portfolio', 'Strategy'] },
  { href: '/performance-analysis', label: ['Performance', 'Analysis'] },
  { href: '/about-us', label: ['About', 'Us'] },
]

type SiteHeaderNavItem = {
  href: string
  label: string
  newTab?: boolean
}

function splitLabel(label: string): [string, string?] {
  const parts = label.trim().split(/\s+/)
  if (parts.length <= 1) return [label]
  if (parts.length === 2) return [parts[0]!, parts[1]!]

  const mid = Math.ceil(parts.length / 2)
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')]
}

export function SiteHeader({ navItems }: { navItems?: SiteHeaderNavItem[] }) {
  const [visible, setVisible] = useState(true)
  const [transparentBg, setTransparentBg] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const nav = (navItems?.length
    ? navItems.map((item) => {
        const [line1, line2] = splitLabel(item.label)
        return { ...item, label: [line1, line2] as [string, string?] }
      })
    : fallbackNav) as Array<{ href: string; label: [string, string?]; newTab?: boolean }>

  useEffect(() => {
    setMenuOpen(false)
    if (typeof window !== 'undefined' && window.scrollY <= 0) {
      setVisible(true)
      setTransparentBg(true)
      lastScrollY.current = 0
    }
  }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const THRESHOLD = 10

    function onScroll() {
      const currentY = window.scrollY

      // Always force the "top of page" visual state.
      if (currentY <= 0) {
        setVisible(true)
        setTransparentBg(true)
        lastScrollY.current = 0
        return
      }

      if (Math.abs(currentY - lastScrollY.current) < THRESHOLD) return

      const isScrollingUp = currentY < lastScrollY.current
      if (isScrollingUp) {
        setVisible(true)
        setTransparentBg(false)
      } else {
        // Keep transparent while sliding out; switch to blue once hidden.
        setVisible(false)
      }
      lastScrollY.current = currentY
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (visible || menuOpen) return

    const timeout = window.setTimeout(() => {
      setTransparentBg(false)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [visible, menuOpen])

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full">
          <div
            className={`w-full rounded-none ${transparentBg ? 'bg-transparent' : 'bg-primary/85'} backdrop-blur-[10px] text-white pointer-events-auto transition-transform duration-300`}
            style={{
              transform: visible || menuOpen ? 'translateY(0)' : 'translateY(calc(-100% - 20px))',
            }}
          >
            <div className="container w-full py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-6">
              <Link href="/" className="block shrink-0">
                <div className="hidden lg:flex items-center gap-2 h-[34px]">
                  <svg
                    className="size-[34px] shrink-0 overflow-visible"
                    viewBox="0 0 28 28"
                    role="img"
                    aria-label="IMP logo mark"
                  >
                    <g
                      className="animate-[logo-spin-once_900ms_cubic-bezier(0.22,1,0.36,1)_1]"
                      style={{ transformOrigin: '16.091px 16.091px', transformBox: 'view-box' }}
                    >
                      <path
                        fill="#ffffff"
                        d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28"
                      />
                      <path
                        fill="#ffffff"
                        d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z"
                      />
                    </g>
                  </svg>
                  <span className="ml-1 font-display text-[16px] leading-[1.05] tracking-[0.01em] text-white whitespace-nowrap">
                    IMP Global Megatrend{' '}
                    <span className="[font-family:var(--font-display-regular)]">Umbrella Fund</span>
                  </span>
                </div>
                <div className="lg:hidden flex items-center gap-2 h-[28px]">
                  <svg
                    className="size-[28px] shrink-0"
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
                  <span className="font-display text-[13px] leading-[1.05] tracking-[0.01em] text-white whitespace-nowrap">
                    IMP Global Megatrend{' '}
                    <span className="[font-family:var(--font-display-regular)]">Umbrella Fund</span>
                  </span>
                </div>
              </Link>

              <Button
                asChild
                variant="headerSubscribe"
                size="clear"
                className="hidden lg:inline-flex group rounded-none bg-white text-primary-light hover:bg-white hover:text-primary-light [font-family:var(--font-display-regular)] [&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:scale-x-[-1]"
              >
                <Link href="/newsletter-subscription">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.25 4.75A1.75 1.75 0 0 1 3 3h10a1.75 1.75 0 0 1 1.75 1.75v6.5A1.75 1.75 0 0 1 13 13H3a1.75 1.75 0 0 1-1.75-1.75z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="m1.75 5.25 5.334 4.14a1.5 1.5 0 0 0 1.832 0l5.334-4.14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Subscribe
                </Link>
              </Button>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden flex items-center justify-center w-12 h-12 -mr-1 rounded-full transition-colors cursor-pointer"
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <div className="relative w-[22px] h-[14px] flex flex-col justify-between">
                  <span
                    className="block h-[2px] w-full bg-white rounded-full transition-all duration-300 origin-center"
                    style={{
                      transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                    }}
                  />
                  <span
                    className="block h-[2px] w-full bg-white rounded-full transition-all duration-300"
                    style={{
                      opacity: menuOpen ? 0 : 1,
                    }}
                  />
                  <span
                    className="block h-[2px] w-full bg-white rounded-full transition-all duration-300 origin-center"
                    style={{
                      transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
                    }}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 lg:hidden flex flex-col transition-all duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
        }}
      >
        <div
          className="absolute inset-0 bg-primary/95 backdrop-blur-sm"
          onClick={toggleMenu}
        />

        <nav
          className="container relative mt-28 flex flex-col gap-1 transition-all duration-300"
          style={{
            transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              className="[font-family:var(--font-display-regular)] text-[20px] font-normal text-white/90 hover:text-white transition-colors py-3 border-b border-white/10"
            >
              {item.label.filter(Boolean).join(' ')}
            </Link>
          ))}
          <Link
            href="/newsletter-subscription"
            className="font-display mt-6 inline-flex items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-3.5 text-white text-[16px] font-medium hover:bg-primary/90 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1.25 4.75A1.75 1.75 0 0 1 3 3h10a1.75 1.75 0 0 1 1.75 1.75v6.5A1.75 1.75 0 0 1 13 13H3a1.75 1.75 0 0 1-1.75-1.75z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m1.75 5.25 5.334 4.14a1.5 1.5 0 0 0 1.832 0l5.334-4.14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Subscribe to Newsletter
          </Link>
        </nav>
      </div>
    </>
  )
}
