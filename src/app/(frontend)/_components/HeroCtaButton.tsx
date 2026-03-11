'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'

type HeroCtaButtonProps = {
  href: string
  label: string
}

export function HeroCtaButton({ href, label }: HeroCtaButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <Button
      asChild
      variant="heroCta"
      size="clear"
      className="px-4 md:px-5 bg-white text-black border-transparent normal-case tracking-normal text-[16px] font-medium"
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-2.5 text-black transition-colors hover:text-primary-light focus-visible:text-primary-light"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <span className="inline-flex items-center gap-2.5 text-current">
          <AnimatedIcon
            name="trendingUp"
            size={16}
            className="shrink-0 text-current transition-colors group-hover:text-primary-light group-focus-visible:text-primary-light"
            animate={hovered}
          />
          <span>{label}</span>
        </span>
      </Link>
    </Button>
  )
}
