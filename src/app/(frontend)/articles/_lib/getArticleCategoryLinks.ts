import type { Post } from '@/payload-types'
import { toKebabCase } from '@/utilities/toKebabCase'
import type { ArticleCategoryMeta, CategoryLink } from '@/app/(frontend)/articles/_lib/types'

export async function getArticleCategoryLinks(payload: any): Promise<CategoryLink[]> {
  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 1000,
    pagination: false,
    overrideAccess: false,
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })

  const categoryLinksBase: Array<{ id: number; title: string; slug: string }> = []
  for (const category of categoriesResult.docs || []) {
    if (typeof category?.id !== 'number') continue

    const title = typeof category.title === 'string' ? category.title.trim() : ''
    if (!title) continue

    const slug =
      typeof category.slug === 'string' && category.slug.trim()
        ? category.slug.trim()
        : toKebabCase(title)

    categoryLinksBase.push({ id: category.id, title, slug })
  }

  const categoryLinks = await Promise.all(
    categoryLinksBase.map(async (category) => {
      const countResult = await payload.count({
        collection: 'posts',
        overrideAccess: false,
        where: {
          categories: {
            contains: category.id,
          },
        },
      })

      return {
        title: category.title,
        slug: category.slug,
        count: countResult.totalDocs || 0,
      }
    }),
  )

  return categoryLinks.filter((category) => category.count > 0)
}

export const getArticleCategoryMeta = (categories: Post['categories']): ArticleCategoryMeta[] => {
  if (!Array.isArray(categories)) return []

  return categories
    .map((category) => {
      if (typeof category === 'object' && category !== null && 'title' in category) {
        const maybeTitle = category.title
        const maybeSlug = 'slug' in category ? category.slug : ''
        const title = typeof maybeTitle === 'string' ? maybeTitle.trim() : ''
        if (!title) return null

        const slug = typeof maybeSlug === 'string' && maybeSlug.trim() ? maybeSlug.trim() : toKebabCase(title)
        return { title, slug }
      }

      return null
    })
    .filter((item): item is ArticleCategoryMeta => Boolean(item?.title && item?.slug))
}
