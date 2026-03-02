import React from 'react'
import { cn } from '@/utilities/ui'
import { TypeSwapHeading } from './TypeSwapHeading'

type PageHeroSubtitleProps = React.ComponentProps<'p'>

export function PageHeroSubtitle({ className, children, ...props }: PageHeroSubtitleProps) {
  return (
    <p
      className={cn('mt-4 text-white text-[19px] md:text-[21px] max-w-lg leading-[1.6]', className)}
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
    <div className={cn('mt-6 flex flex-wrap items-center gap-4', className)}>
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
  sectionClassName?: string
  containerClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function PageHero({
  title,
  subtitle,
  children,
  sectionClassName,
  containerClassName,
  titleClassName,
  subtitleClassName,
}: PageHeroProps) {
  return (
    <section
      className={cn('bg-[#2b3dea] pt-32 pb-16 md:pt-40 md:pb-20', sectionClassName)}
      data-transition-skip="true"
    >
      <div className={cn('container', containerClassName)}>
        {typeof title === 'string' ? (
          <TypeSwapHeading
            text={title}
            className={cn(
              'text-white text-[38px] md:text-[48px] leading-[1.12] tracking-tight max-w-3xl',
              titleClassName,
            )}
          />
        ) : (
          <h1
            className={cn(
              'text-white text-[38px] md:text-[48px] leading-[1.12] tracking-tight max-w-3xl',
              titleClassName,
            )}
          >
            {title}
          </h1>
        )}
        {subtitle ? <PageHeroSubtitle className={subtitleClassName}>{subtitle}</PageHeroSubtitle> : null}
        {children}
      </div>
    </section>
  )
}
