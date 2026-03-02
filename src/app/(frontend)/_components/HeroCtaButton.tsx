'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AnimatedIcon } from './AnimatedIcon'

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
      className="px-4 md:px-5 bg-white text-primary-light border-transparent normal-case tracking-normal text-[16px] font-medium"
    >
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
      >
        <AnimatedIcon
          name="trendingUp"
          size={16}
          className="shrink-0 text-primary-light"
          animate={hovered}
        />
        {label}
      </Link>
    </Button>
  )
}
