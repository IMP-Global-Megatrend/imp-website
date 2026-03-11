import { DEFAULT_ARCHIVE_PAGE_SIZE } from '@/app/(frontend)/_lib/archivePagination'

export const ARTICLE_ARCHIVE_PAGE_SIZE = DEFAULT_ARCHIVE_PAGE_SIZE

export const ARTICLE_ARCHIVE_SELECT = {
  title: true,
  slug: true,
  authors: true,
  publishedAt: true,
  categories: true,
  heroImage: true,
  meta: true,
  populatedAuthors: true,
} as const
