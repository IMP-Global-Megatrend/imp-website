'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'

const FADE_DURATION_MS = 190
const HERO_HEIGHT_TRANSITION_MS = 280

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const timersRef = useRef<number[]>([])
  const hasMountedRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const heroRafRef = useRef<number | null>(null)
  const pendingHeroHeightRef = useRef<number | null>(null)

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (heroRafRef.current !== null) {
      window.cancelAnimationFrame(heroRafRef.current)
      heroRafRef.current = null
    }
  }

  const setPhase = (element: Element, phase: 'in' | 'out') => {
    element.classList.add('transition-item')
    element.classList.remove('transition-item-in', 'transition-item-out')
    element.classList.add(phase === 'in' ? 'transition-item-in' : 'transition-item-out')
  }

  const getContentTargets = (contentRoot: HTMLElement): Element[] => {
    const directChildren = Array.from(contentRoot.children)
    if (directChildren.length === 0) return [contentRoot]

    // If page renders multiple top-level blocks, animate each block in sequence.
    if (directChildren.length > 1) {
      return directChildren.filter((element) => !element.matches('[data-transition-skip="true"]'))
    }

    const onlyChild = directChildren[0]
    if (!onlyChild) return [contentRoot]

    // If a single main/article wraps the whole page, stagger its direct blocks.
    if (onlyChild.tagName === 'MAIN' || onlyChild.tagName === 'ARTICLE') {
      const nestedBlocks = Array.from(onlyChild.children)
      const filteredBlocks = nestedBlocks.filter((element) => !element.matches('[data-transition-skip="true"]'))
      return filteredBlocks
    }

    return onlyChild.matches('[data-transition-skip="true"]') ? [] : [onlyChild]
  }

  const getOrderedTargets = () => {
    const content = contentRef.current
    if (!content) return []
    const contentTargets = getContentTargets(content)
    const forcedTargets = Array.from(content.querySelectorAll('[data-transition-force="true"]'))
    return Array.from(new Set([...contentTargets, ...forcedTargets]))
  }

  const getSkippedHero = () => {
    const content = contentRef.current
    if (!content) return null
    return content.querySelector('[data-transition-skip="true"]') as HTMLElement | null
  }

  const animateHeroHeightIfNeeded = () => {
    const hero = getSkippedHero()
    const previousHeight = pendingHeroHeightRef.current
    pendingHeroHeightRef.current = null
    if (!hero || !previousHeight) return

    const nextHeight = hero.getBoundingClientRect().height
    if (Math.abs(nextHeight - previousHeight) < 1) return

    hero.style.overflow = 'hidden'
    hero.style.height = `${previousHeight}px`
    hero.style.transition = 'none'
    // Force style flush before starting the transition.
    hero.getBoundingClientRect()

    heroRafRef.current = window.requestAnimationFrame(() => {
      hero.style.transition = `height ${HERO_HEIGHT_TRANSITION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
      hero.style.height = `${nextHeight}px`
      timersRef.current.push(
        window.setTimeout(() => {
          hero.style.removeProperty('height')
          hero.style.removeProperty('overflow')
          hero.style.removeProperty('transition')
        }, HERO_HEIGHT_TRANSITION_MS),
      )
    })
  }

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target as Element | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const nextUrl = new URL(anchor.href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return

      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
      const nextPath = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
      if (nextPath === currentPath) return

      // In-page anchor jumps should not run route transition.
      if (
        nextUrl.pathname === window.location.pathname &&
        nextUrl.search === window.location.search &&
        nextUrl.hash.length > 0
      ) {
        return
      }

      const currentHero = getSkippedHero()
      pendingHeroHeightRef.current = currentHero ? currentHero.getBoundingClientRect().height : null

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        event.preventDefault()
        router.push(nextPath)
        return
      }

      const orderedTargets = getOrderedTargets()

      event.preventDefault()
      clearTimers()
      if (orderedTargets.length === 0) {
        router.push(nextPath)
        return
      }
      orderedTargets.forEach((targetElement) => setPhase(targetElement, 'out'))
      timersRef.current.push(window.setTimeout(() => router.push(nextPath), FADE_DURATION_MS))
    }

    document.addEventListener('click', onDocumentClick, true)
    return () => {
      document.removeEventListener('click', onDocumentClick, true)
    }
  }, [router, pathname])

  useLayoutEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const orderedTargets = getOrderedTargets()
    clearTimers()
    animateHeroHeightIfNeeded()
    // Apply out phase before paint so new content does not flash fully visible first.
    orderedTargets.forEach((target) => setPhase(target, 'out'))
    rafRef.current = window.requestAnimationFrame(() => {
      orderedTargets.forEach((target) => setPhase(target, 'in'))
    })

    return clearTimers
  }, [pathname])

  return (
    <div ref={contentRef} className="page-transition" data-transition-region="content">
      {children}
    </div>
  )
}
