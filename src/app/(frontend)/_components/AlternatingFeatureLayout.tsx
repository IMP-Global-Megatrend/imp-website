import { cn } from '@/utilities/ui'
import type { ReactNode } from 'react'

type AlternatingFeatureLayoutProps = {
  reverse?: boolean
  className?: string
  content: ReactNode
  media: ReactNode
  contentClassName?: string
  mediaClassName?: string
  applyOrderSwap?: boolean
  normalContentOrderClassName?: string
  reverseContentOrderClassName?: string
  normalMediaOrderClassName?: string
  reverseMediaOrderClassName?: string
}

export function AlternatingFeatureLayout({
  reverse = false,
  className,
  content,
  media,
  contentClassName,
  mediaClassName,
  applyOrderSwap = true,
  normalContentOrderClassName = 'lg:order-1',
  reverseContentOrderClassName = 'lg:order-2',
  normalMediaOrderClassName = 'lg:order-2',
  reverseMediaOrderClassName = 'lg:order-1',
}: AlternatingFeatureLayoutProps) {
  const contentOrderClassName = applyOrderSwap
    ? reverse
      ? reverseContentOrderClassName
      : normalContentOrderClassName
    : ''
  const mediaOrderClassName = applyOrderSwap
    ? reverse
      ? reverseMediaOrderClassName
      : normalMediaOrderClassName
    : ''

  return (
    <div className={className}>
      <div className={cn(contentClassName, contentOrderClassName)}>{content}</div>
      <div className={cn(mediaClassName, mediaOrderClassName)}>{media}</div>
    </div>
  )
}
