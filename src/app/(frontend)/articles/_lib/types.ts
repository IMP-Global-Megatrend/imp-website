import type { Post } from '@/payload-types'

export type ArticleListItem = Pick<
  Post,
  'id' | 'slug' | 'title' | 'meta' | 'heroImage' | 'populatedAuthors' | 'publishedAt'
>

export type BreadcrumbItem = {
  label: string
  href?: string
}

export type CategoryLink = {
  title: string
  slug: string
  count: number
}

export type ArticleCategoryMeta = {
  title: string
  slug: string
}
