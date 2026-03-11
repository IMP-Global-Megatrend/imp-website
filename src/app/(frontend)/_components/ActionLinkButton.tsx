import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import type { AnimatedIconName } from '@/app/(frontend)/_components/AnimatedIcon'
import { AnimatedIcon } from '@/app/(frontend)/_components/AnimatedIcon'

interface ActionLinkButtonProps {
  href: string
  label: string
  icon: AnimatedIconName
  className?: string
  external?: boolean
  buttonVariant?: ButtonProps['variant']
  iconBefore?: boolean
}

export function ActionLinkButton({
  href,
  label,
  icon,
  className,
  external = false,
  buttonVariant = 'outlineBrand',
  iconBefore = false,
}: ActionLinkButtonProps) {
  const iconNode = <AnimatedIcon name={icon} size={12} animateOnHover className="shrink-0 text-current" />

  return (
    <Button
      asChild
      variant={buttonVariant}
      size="clear"
      className={cn('px-5 py-2.5 rounded-none font-display', className)}
    >
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className="group">
          {iconBefore ? iconNode : null}
          {label}
          {!iconBefore ? iconNode : null}
        </a>
      ) : (
        <Link href={href} className="group">
          {iconBefore ? iconNode : null}
          {label}
          {!iconBefore ? iconNode : null}
        </Link>
      )}
    </Button>
  )
}
