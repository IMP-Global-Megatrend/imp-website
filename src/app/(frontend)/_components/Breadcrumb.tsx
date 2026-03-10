import Link from 'next/link'
import { cn } from '@/utilities/ui'

type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  items: BreadcrumbItem[]
  className?: string
  textClassName?: string
}

export function Breadcrumb({ items, className, textClassName }: BreadcrumbProps) {
  if (!items.length) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('text-[#5f6477]', textClassName)}>
      <div className={cn('inline-flex flex-wrap items-center', className)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <span key={`${item.label}-${index}`} className="inline-flex items-center">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#2b3dea] transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-[#0b1035]' : undefined}>{item.label}</span>
              )}
              {!isLast ? <span className="mx-2">/</span> : null}
            </span>
          )
        })}
      </div>
    </nav>
  )
}
