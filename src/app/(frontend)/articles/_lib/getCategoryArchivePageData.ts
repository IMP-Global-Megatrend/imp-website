import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { buildStaticPageParams } from '@/app/(frontend)/_lib/archivePagination'
import { ARTICLE_ARCHIVE_PAGE_SIZE, ARTICLE_ARCHIVE_SELECT } from '@/app/(frontend)/articles/_lib/constants'

export const getCategoryArchivePageData = async (slug: string, page: number = 1) => {
  const payload = await getPayload({ config: configPromise })

  const categoryResult = await payload.find({
    collection: 'categories',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })
  const category = categoryResult.docs?.[0]
  if (!category) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    page,
    limit: ARTICLE_ARCHIVE_PAGE_SIZE,
    overrideAccess: false,
    where: {
      categories: {
        contains: category.id,
      },
    },
    select: ARTICLE_ARCHIVE_SELECT,
  })

  if (posts.totalDocs > 0 && page > posts.totalPages) {
    notFound()
  }

  return {
    category,
    posts,
  }
}

export const getArticleCategoryStaticParams = async (): Promise<Array<{ slug: string }>> => {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return categories.docs
    .filter((category) => typeof category.slug === 'string' && category.slug)
    .map((category) => ({
      slug: String(category.slug),
    }))
}

export const getCategoryArchiveStaticParams = async (): Promise<
  Array<{ slug: string; pageNumber: string }>
> => {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      id: true,
      slug: true,
    },
  })

  const params: Array<{ slug: string; pageNumber: string }> = []
  for (const category of categories.docs || []) {
    if (!category?.slug || !category?.id) continue

    const countResult = await payload.count({
      collection: 'posts',
      overrideAccess: false,
      where: {
        categories: {
          contains: category.id,
        },
      },
    })

    params.push(
      ...buildStaticPageParams(countResult.totalDocs || 0, ARTICLE_ARCHIVE_PAGE_SIZE).map((pageParam) => ({
        slug: String(category.slug),
        pageNumber: pageParam.pageNumber,
      })),
    )
  }

  return params
}
