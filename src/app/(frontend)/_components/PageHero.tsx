import React from 'react'
import { cn } from '@/utilities/ui'
import { AnimatedHeroHeading } from '@/app/(frontend)/_components/AnimatedHeroHeading'
import { PageHeroSilkBackground, type PageHeroPalette } from '@/app/(frontend)/_components/PageHeroSilkBackground'

type PageHeroSubtitleProps = React.ComponentProps<'p'>

export function PageHeroSubtitle({ className, children, ...props }: PageHeroSubtitleProps) {
  return (
    <p
      className={cn('mt-4 min-h-[4.8em] text-white text-[19px] md:text-[21px] max-w-lg leading-[1.6]', className)}
      data-transition-force="true"
      {...props}
    >
      {children}
    </p>
  )
}

type PageHeroMetaProps = {
  items: React.ReactNode[]
  className?: string
  itemClassName?: string
  separator?: React.ReactNode
  separatorClassName?: string
}

export function PageHeroMeta({
  items,
  className,
  itemClassName,
  separator = '|',
  separatorClassName,
}: PageHeroMetaProps) {
  return (
    <div
      className={cn('mt-6 flex flex-wrap items-center gap-4', className)}
      data-transition-force="true"
    >
      {items.map((item, index) => (
        <React.Fragment key={`hero-meta-${index}`}>
          <span className={cn('text-white text-[19px] md:text-[21px] leading-[1.6]', itemClassName)}>{item}</span>
          {index < items.length - 1 ? (
            <span aria-hidden="true" className={cn('text-white/80 text-[19px] md:text-[21px] leading-[1.6]', separatorClassName)}>
              {separator}
            </span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  )
}

type PageHeroProps = {
  title: React.ReactNode
  subtitle?: React.ReactNode
  children?: React.ReactNode
  palette?: PageHeroPalette
  showBackground?: boolean
  showScrollIndicator?: boolean
  sectionClassName?: string
  containerClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function PageHero({
  title,
  subtitle,
  children,
  palette = {
    color1: '#2b3dea',
    color2: 'oklch(0.46 0.13 334)',
    color3: 'oklch(0.46 0.11 278)',
  },
  showBackground = true,
  showScrollIndicator = true,
  sectionClassName,
  containerClassName,
  titleClassName,
  subtitleClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative min-h-screen overflow-hidden bg-[#2b3dea] -mb-px',
        sectionClassName,
      )}
      data-transition-skip="true"
    >
      {showBackground ? <PageHeroSilkBackground palette={palette} /> : null}
      <div
        className="relative z-10 flex min-h-screen items-center pt-40 pb-16 md:pt-48 md:pb-20"
        data-transition-hero-content="true"
      >
        <div className={cn('container', containerClassName)}>
          {typeof title === 'string' ? (
            <AnimatedHeroHeading
              heading={title}
              className={cn(
                'text-white text-[38px] md:text-[48px] font-semibold leading-[1.12] tracking-tight max-w-3xl',
                titleClassName,
              )}
            />
          ) : (
            <h1
              className={cn(
                'text-white text-[38px] md:text-[48px] font-semibold leading-[1.12] tracking-tight max-w-3xl',
                titleClassName,
              )}
            >
              {title}
            </h1>
          )}
          {subtitle ? (
            <>
              <PageHeroSubtitle className={subtitleClassName}>{subtitle}</PageHeroSubtitle>
            </>
          ) : null}
          {children}
        </div>
      </div>

      {showScrollIndicator ? (
        <div
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/75 animate-bounce"
          data-transition-force="true"
          aria-hidden="true"
        >
          <svg width="22" height="30" viewBox="0 0 22 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8L11 15L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16L11 23L18 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </section>
  )
}
