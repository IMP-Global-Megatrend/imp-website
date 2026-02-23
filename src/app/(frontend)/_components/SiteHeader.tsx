'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/fund', label: ['The', 'Fund'] },
  { href: '/megatrends', label: ['Our', 'Megatrends'] },
  { href: '/portfolio-strategy', label: ['Portfolio', 'Strategy'] },
  { href: '/performance-analysis', label: ['Performance', 'Analysis'] },
  { href: '/about-us', label: ['About', 'Us'] },
]

export function SiteHeader() {
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastScrollY = useRef(0)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
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
      if (Math.abs(currentY - lastScrollY.current) < THRESHOLD) return

      setVisible(currentY <= 0 || currentY < lastScrollY.current)
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pt-5 pointer-events-none">
        <div className="container">
          <div
            className="rounded-[999px] bg-[#0040ff]/90 backdrop-blur-md text-white pl-6 pr-4 lg:pl-8 lg:pr-5 py-3 lg:py-4 shadow-[0_10px_30px_rgba(0,40,180,0.25)] flex items-center justify-between gap-4 lg:gap-6 pointer-events-auto transition-transform duration-300"
            style={{
              transform: visible || menuOpen ? 'translateY(0)' : 'translateY(calc(-100% - 20px))',
            }}
          >
            <Link href="/" className="block shrink-0">
              <img
                alt="IMP Global Megatrend Umbrella Fund"
                className="hidden xl:block h-[34px] w-auto max-w-none"
                src="/original-logo.svg"
              />
              <img
                alt="IMP Global Megatrend Umbrella Fund"
                className="xl:hidden h-[28px] w-auto max-w-none"
                src="/mobile-logo.svg"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-5 shrink-0">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="font-display text-[15px] leading-tight text-white/90 hover:text-white transition-colors text-left"
                >
                  {item.label[0]}
                  <br />
                  {item.label[1]}
                </Link>
              ))}
              <Link
                href="/newsletter-subscription"
                className="font-display inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[#0040ff] text-[13px] font-medium whitespace-nowrap"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M1 3h14v10H1V3Z" stroke="currentColor" />
                  <path d="m1.5 3.5 6.5 4.7 6.5-4.7" stroke="currentColor" />
                </svg>
                Subscribe
              </Link>
            </nav>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center w-12 h-12 -mr-1 rounded-full bg-white/20 backdrop-blur-sm transition-colors"
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
          className="absolute inset-0 bg-[#0b1035]/95 backdrop-blur-sm"
          onClick={toggleMenu}
        />

        <nav
          className="relative mt-28 px-8 flex flex-col gap-1 transition-all duration-300"
          style={{
            transform: menuOpen ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-display text-[22px] font-light text-white/90 hover:text-white transition-colors py-3 border-b border-white/10"
            >
              {item.label.join(' ')}
            </Link>
          ))}
          <Link
            href="/newsletter-subscription"
            className="font-display mt-6 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#0040ff] px-6 py-3.5 text-white text-[16px] font-medium"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path d="M1 3h14v10H1V3Z" stroke="currentColor" />
              <path d="m1.5 3.5 6.5 4.7 6.5-4.7" stroke="currentColor" />
            </svg>
            Subscribe to Newsletter
          </Link>
        </nav>
      </div>
    </>
  )
}
