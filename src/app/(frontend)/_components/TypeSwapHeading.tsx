'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

let lastRenderedHeroTitle = ''

type TypeSwapHeadingProps = {
  text: string
  className?: string
}

const DELETE_STEP_MS = 14
const TYPE_STEP_MS = 22
const PAUSE_BETWEEN_MS = 90

export function TypeSwapHeading({ text, className }: TypeSwapHeadingProps) {
  const pathname = usePathname()
  const [displayText, setDisplayText] = useState(text)
  const [reservedHeight, setReservedHeight] = useState<number | null>(null)
  const timersRef = useRef<number[]>([])
  const measureRef = useRef<HTMLHeadingElement | null>(null)

  useLayoutEffect(() => {
    const node = measureRef.current
    if (!node) return
    const nextHeight = Math.ceil(node.getBoundingClientRect().height)
    if (nextHeight > 0) {
      setReservedHeight((prev) => (prev === nextHeight ? prev : nextHeight))
    }
  }, [text, className])

  useEffect(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const previous = lastRenderedHeroTitle

    if (!previous || previous === text || prefersReducedMotion) {
      setDisplayText(text)
      lastRenderedHeroTitle = text
      return
    }

    setDisplayText(previous)

    const schedule = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay)
      timersRef.current.push(id)
    }

    let elapsed = 0

    for (let i = previous.length - 1; i >= 0; i--) {
      elapsed += DELETE_STEP_MS
      schedule(() => {
        setDisplayText(previous.slice(0, i))
      }, elapsed)
    }

    elapsed += PAUSE_BETWEEN_MS

    for (let i = 1; i <= text.length; i++) {
      elapsed += TYPE_STEP_MS
      schedule(() => {
        setDisplayText(text.slice(0, i))
      }, elapsed)
    }

    schedule(() => {
      lastRenderedHeroTitle = text
    }, elapsed + 1)

    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id))
      timersRef.current = []
    }
  }, [pathname, text])

  return (
    <div className="relative">
      <h1 className={className} style={{ whiteSpace: 'pre-line', minHeight: reservedHeight ?? undefined }}>
        {displayText}
      </h1>
      <h1
        ref={measureRef}
        aria-hidden="true"
        className={className}
        style={{
          whiteSpace: 'pre-line',
          position: 'absolute',
          top: 0,
          left: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {text}
      </h1>
    </div>
  )
}
