import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className, loading: _loading = 'lazy', priority: _priority = 'low' } = props

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-2 font-bold tracking-tight text-xl',
        className,
      )}
    >
      <Image
        src="/original-favicon-32.png"
        alt="IMP logo"
        width={32}
        height={32}
        className="shrink-0 rounded-[4px]"
      />
      <span className="hidden sm:inline">
        <span className="text-[var(--primary)]">IMP</span>
        <span className="text-foreground/60 font-normal text-sm ml-1.5">Global Megatrend</span>
      </span>
    </span>
  )
}
