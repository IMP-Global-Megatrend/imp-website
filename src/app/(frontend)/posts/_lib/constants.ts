import { DEFAULT_ARCHIVE_PAGE_SIZE } from '@/app/(frontend)/_lib/archivePagination'

export const POSTS_ARCHIVE_PAGE_SIZE = DEFAULT_ARCHIVE_PAGE_SIZE

export const POSTS_ARCHIVE_SELECT = {
  title: true,
  slug: true,
  categories: true,
  meta: true,
} as const
