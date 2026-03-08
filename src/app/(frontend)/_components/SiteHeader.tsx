'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatedIcon } from './AnimatedIcon'

type SiteHeaderNavItem = {
  href: string
  label: string
  newTab?: boolean
}
type HeaderMenuIcon = 'home' | 'fund' | 'megatrends' | 'portfolio' | 'performance' | 'about' | 'mail'

const desktopHeaderNav = [
  { href: '/', label: 'Home', icon: 'home' as const },
  { href: '/fund', label: 'The Fund', icon: 'fund' as const },
  { href: '/megatrends', label: 'Our Megatrends', icon: 'megatrends' as const },
  { href: '/portfolio-strategy', label: 'Portfolio Strategy', icon: 'portfolio' as const },
  { href: '/performance-analysis', label: 'Performance Analysis', icon: 'performance' as const },
  { href: '/about-us', label: 'About Us', icon: 'about' as const },
  { href: '/newsletter-subscription', label: 'Subscribe', icon: 'mail' as const },
]

function renderHeaderMenuIcon(icon: HeaderMenuIcon, animate: boolean) {
  if (icon === 'home') return <AnimatedIcon name="home" size={16} className="shrink-0" animate={animate} />
  if (icon === 'fund')
    return <AnimatedIcon name="rocket" size={16} className="shrink-0" animate={animate} />
  if (icon === 'megatrends')
    return <AnimatedIcon name="telescope" size={16} className="shrink-0" animate={animate} />
  if (icon === 'portfolio') return <AnimatedIcon name="compass" size={16} className="shrink-0" animate={animate} />
  if (icon === 'performance')
    return <AnimatedIcon name="chartLine" size={16} className="shrink-0" animate={animate} />
  if (icon === 'about') return <AnimatedIcon name="users" size={16} className="shrink-0" animate={animate} />
  return <AnimatedIcon name="mailCheck" size={16} className="shrink-0" animate={animate} />
}

function splitLabel(label: string): [string, string?] {
  const parts = label.trim().split(/\s+/)
  if (parts.length <= 1) return [label]
  if (parts.length === 2) return [parts[0]!, parts[1]!]

  const mid = Math.ceil(parts.length / 2)
  return [parts.slice(0, mid).join(' '), parts.slice(mid).join(' ')]
}

export function SiteHeader({ navItems }: { navItems?: SiteHeaderNavItem[] }) {
  const MENU_CONTAINER_MS = 300
  const MENU_ITEM_TRANSITION_MS = 300
  const MENU_ITEM_STAGGER_MS = 55
  const MENU_ITEM_INITIAL_DELAY_MS = 70
  const [transparentBg, setTransparentBg] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuExpanded, setMenuExpanded] = useState(false)
  const [menuItemsVisible, setMenuItemsVisible] = useState(false)
  const [hoveredDesktopItem, setHoveredDesktopItem] = useState<string | null>(null)
  const pathname = usePathname()
  const menuAnimationTimeoutRef = useRef<number | null>(null)
  const nav = (navItems?.length
    ? navItems.map((item) => {
        const [line1, line2] = splitLabel(item.label)
        return { ...item, label: [line1, line2] as [string, string?] }
      })
    : []) as Array<{ href: string; label: [string, string?]; newTab?: boolean }>
  const navWithoutHome = nav.filter((item) => item.href !== '/')
  const mobileMenuItems = [
    { href: '/', label: ['Home'] as [string, string?] },
    ...navWithoutHome,
    { href: '/newsletter-subscription', label: ['Subscribe to Newsletter'] as [string, string?] },
  ]

  useEffect(() => {
    setMenuOpen(false)
    setMenuExpanded(false)
    setMenuItemsVisible(false)
    setTransparentBg(true)
    setHoveredDesktopItem(null)
  }, [pathname])

  useEffect(() => {
    if (menuExpanded) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuExpanded])

  useEffect(() => {
    if (menuAnimationTimeoutRef.current) {
      window.clearTimeout(menuAnimationTimeoutRef.current)
      menuAnimationTimeoutRef.current = null
    }

    if (menuOpen) {
      setMenuExpanded(true)
      menuAnimationTimeoutRef.current = window.setTimeout(() => {
        setMenuItemsVisible(true)
      }, MENU_CONTAINER_MS)
      return
    }

    // Close choreography: hide items first, then collapse container.
    setMenuItemsVisible(false)
    const longestExitDelay = (mobileMenuItems.length - 1) * MENU_ITEM_STAGGER_MS
    const collapseDelay = longestExitDelay + MENU_ITEM_TRANSITION_MS
    menuAnimationTimeoutRef.current = window.setTimeout(() => {
      setMenuExpanded(false)
    }, collapseDelay)

    return () => {
      if (menuAnimationTimeoutRef.current) {
        window.clearTimeout(menuAnimationTimeoutRef.current)
        menuAnimationTimeoutRef.current = null
      }
    }
  }, [menuOpen, mobileMenuItems.length, MENU_CONTAINER_MS, MENU_ITEM_STAGGER_MS, MENU_ITEM_TRANSITION_MS])

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), [])

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="w-full">
          <div
            className={`w-full rounded-none ${transparentBg ? 'bg-transparent' : 'bg-primary/85'} text-white pointer-events-auto`}
          >
            <nav className="hidden lg:flex w-full bg-transparent text-white items-stretch justify-start">
              <div className="flex w-full overflow-hidden rounded-none">
                {desktopHeaderNav.map((item, index) => {
                  const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group [font-family:var(--font-display-regular)] inline-flex flex-1 min-w-0 flex-col xl:flex-row items-center justify-center whitespace-normal xl:whitespace-nowrap bg-transparent px-4 xl:px-5 py-2 xl:py-3 text-[15px] font-medium text-white text-center gap-1 xl:gap-2 border-t-[5px] border-t-secondary border-b transition-colors duration-200 ${
                        index > 0 ? 'border-l border-secondary' : ''
                      } ${
                        isActive
                          ? 'border-b-transparent'
                          : 'border-b-secondary hover:bg-white hover:text-[#0b1035] focus-visible:bg-white focus-visible:text-[#0b1035] active:bg-white active:text-[#0b1035]'
                      }`}
                      onMouseEnter={() => setHoveredDesktopItem(item.href)}
                      onMouseLeave={() => setHoveredDesktopItem((prev) => (prev === item.href ? null : prev))}
                      onFocus={() => setHoveredDesktopItem(item.href)}
                      onBlur={() => setHoveredDesktopItem((prev) => (prev === item.href ? null : prev))}
                    >
                      {renderHeaderMenuIcon(item.icon, hoveredDesktopItem === item.href)}
                      <span className="leading-[1.15] pt-0.5">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            <div className="container w-full py-3 lg:py-4 flex items-center justify-between gap-4 lg:gap-6">
              <Link href="/" className="block flex-1 min-w-0 lg:flex-none lg:shrink-0">
                <div className="hidden lg:flex items-center gap-2.5 h-[44px] mt-6">
                  <svg
                    className="size-[44px] shrink-0 overflow-visible"
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
                  <span className="ml-1 font-display font-semibold text-[20px] leading-[1.05] tracking-[0.01em] text-white whitespace-nowrap">
                    IMP Global Megatrend{' '}
                    <span className="[font-family:var(--font-display-regular)] font-normal">Umbrella Fund</span>
                  </span>
                </div>
                <div className="lg:hidden flex min-w-0 items-center gap-2.5 h-[44px]">
                  <svg
                    className="size-[44px] shrink-0 overflow-visible"
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
                  <span className="min-w-0 font-display font-semibold text-[17px] leading-[1.05] tracking-[0.01em] text-white whitespace-normal">
                    IMP Global Megatrend{' '}
                    <span className="[font-family:var(--font-display-regular)] font-normal whitespace-nowrap">
                      Umbrella Fund
                    </span>
                  </span>
                </div>
              </Link>

              {/* Mobile hamburger */}
              <button
                className="lg:hidden shrink-0 flex items-center justify-center w-12 h-12 -mr-1 rounded-full transition-colors cursor-pointer"
                onClick={toggleMenu}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span className="relative block h-[22px] w-[22px]" aria-hidden="true">
                  <span
                    className={`absolute left-0 top-[3px] h-[2px] w-full rounded-full bg-white transition-transform duration-300 ease-out ${
                      menuOpen ? 'translate-y-[8px] rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[10px] h-[2px] w-full rounded-full bg-white transition-all duration-250 ease-out ${
                      menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-[17px] h-[2px] w-full rounded-full bg-white transition-transform duration-300 ease-out ${
                      menuOpen ? '-translate-y-[6px] -rotate-45' : ''
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 lg:hidden flex flex-col transition-all duration-300"
        style={{
          opacity: menuExpanded ? 1 : 0,
          pointerEvents: menuExpanded ? 'auto' : 'none',
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#2b3dea]" />
        <nav
          className="container relative z-10 mt-28 flex flex-col gap-1 transition-all duration-300"
          style={{
            transform: menuExpanded ? 'translateY(0)' : 'translateY(-20px)',
          }}
        >
          {mobileMenuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.newTab ? '_blank' : undefined}
              rel={item.newTab ? 'noopener noreferrer' : undefined}
              className="[font-family:var(--font-display-regular)] text-[20px] font-light text-white/90 hover:text-white transition-[color,opacity,transform] duration-300 ease-out motion-reduce:transition-none py-3 border-b border-white/10"
              style={{
                opacity: menuItemsVisible ? 1 : 0,
                transform: menuItemsVisible ? 'translateY(0)' : 'translateY(10px)',
                transitionDelay: menuItemsVisible
                  ? `${MENU_ITEM_INITIAL_DELAY_MS + index * MENU_ITEM_STAGGER_MS}ms`
                  : `${(mobileMenuItems.length - 1 - index) * MENU_ITEM_STAGGER_MS}ms`,
              }}
            >
              {item.label.filter(Boolean).join(' ')}
            </Link>
          ))}
        </nav>
      </div>
    </>
  )
}
