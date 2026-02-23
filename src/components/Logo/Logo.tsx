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
        src="/impgmt-clone/static.wixstatic.com/media/c3fe54_db73cbbc71114b7b8aa56454abccb539~mv2.png/v1/fill/w_32,h_32,lg_1,usm_0.66_1.00_0.01/c3fe54_db73cbbc71114b7b8aa56454abccb539~mv2.png"
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
