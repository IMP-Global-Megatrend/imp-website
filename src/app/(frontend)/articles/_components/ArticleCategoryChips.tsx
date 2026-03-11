import Link from 'next/link'
import type { ArticleCategoryMeta, CategoryLink } from '@/app/(frontend)/articles/_lib/types'

type ArticleCategoryChip = ArticleCategoryMeta | CategoryLink

type ArticleCategoryChipsProps = {
  categories: ArticleCategoryChip[]
  className?: string
  showCounts?: boolean
  showHeading?: boolean
}

export function ArticleCategoryChips({
  categories,
  className,
  showCounts = false,
  showHeading = false,
}: ArticleCategoryChipsProps) {
  if (!categories.length) return null

  return (
    <div className={className}>
      {showHeading && (
        <p className="mb-2 font-display text-[12px] md:text-[13px] uppercase tracking-[0.12em] text-[#5f6477]">
          Categories
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const countLabel = showCounts && 'count' in category ? ` (${category.count})` : ''

          return (
            <Link
              key={category.slug}
              href={`/articles/category/${category.slug}`}
              className="inline-flex items-center rounded-full border border-[#d9def0] bg-[#f4f6fb] px-3 py-1 font-display text-[12px] md:text-[13px] uppercase tracking-[0.08em] text-[#2b3045]"
            >
              {category.title}
              {countLabel}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
