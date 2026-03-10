'use client'

import { useEffect } from 'react'

export function CursorAttrSanitizer() {
  useEffect(() => {
    const strip = () => {
      document
        .querySelectorAll('[data-cursor-ref],[data-cursor-element-id]')
        .forEach((el) => {
          el.removeAttribute('data-cursor-ref')
          el.removeAttribute('data-cursor-element-id')
        })
    }

    strip()
    const observer = new MutationObserver(strip)
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-cursor-ref', 'data-cursor-element-id'],
    })

    const timeout = window.setTimeout(() => observer.disconnect(), 3000)
    return () => {
      window.clearTimeout(timeout)
      observer.disconnect()
    }
  }, [])

  return null
}
