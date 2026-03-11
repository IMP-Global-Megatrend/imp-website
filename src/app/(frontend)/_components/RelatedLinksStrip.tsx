import type { ReactNode } from 'react'
import type { ButtonProps } from '@/components/ui/button'
import type { AnimatedIconName } from '@/app/(frontend)/_components/AnimatedIcon'
import { ActionLinkButton } from '@/app/(frontend)/_components/ActionLinkButton'
import { cn } from '@/utilities/ui'

export type RelatedLinkItem = {
  href: string
  label: string
  icon: AnimatedIconName
  external?: boolean
  iconBefore?: boolean
  buttonVariant?: ButtonProps['variant']
}

type RelatedLinksStripProps = {
  heading?: string
  items: RelatedLinkItem[]
  className?: string
  borderTop?: boolean
  extraActions?: ReactNode
}

export function RelatedLinksStrip({
  heading,
  items,
  className,
  borderTop = false,
  extraActions,
}: RelatedLinksStripProps) {
  return (
    <section className={cn('pt-10 pb-10 md:pt-12 md:pb-12', borderTop ? 'border-t border-[#d9def0]' : '', className)}>
      <div className="container">
        {heading ? (
          <h3 className="mb-5 text-center text-[20px] md:text-[22px] text-[#0b1035]">
            {heading}
          </h3>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {items.map((item) => (
            <ActionLinkButton
              key={`${item.label}-${item.href}`}
              href={item.href}
              label={item.label}
              icon={item.icon}
              external={item.external}
              iconBefore={item.iconBefore}
              buttonVariant={item.buttonVariant ?? 'outlineMuted'}
            />
          ))}
          {extraActions}
        </div>
      </div>
    </section>
  )
}
