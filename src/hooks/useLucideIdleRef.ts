'use client'

import { useCallback } from 'react'

export type LucideImperativeHandle = {
  startAnimation?: () => void
  stopAnimation?: () => void
} | null

/**
 * Ref callback for lucide-animated icons: calls `stopAnimation` once the handle
 * exists so Motion does not animate opacity from undefined to 1 on mount.
 */
export function useLucideIdleRef(): (instance: LucideImperativeHandle) => void {
  return useCallback((icon: LucideImperativeHandle) => {
    if (!icon) return
    const settle = () => {
      icon.stopAnimation?.()
    }
    settle()
    queueMicrotask(settle)
    requestAnimationFrame(() => {
      settle()
      requestAnimationFrame(settle)
    })
  }, [])
}
