type CategoryLink = {
  title: string
  slug: string
  count: number
}

const toKebabCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

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
