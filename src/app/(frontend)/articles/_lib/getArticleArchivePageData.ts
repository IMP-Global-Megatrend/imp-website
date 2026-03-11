import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ARTICLE_ARCHIVE_PAGE_SIZE, ARTICLE_ARCHIVE_SELECT } from '@/app/(frontend)/articles/_lib/constants'
import { getArticleCategoryLinks } from '@/app/(frontend)/articles/_lib/getArticleCategoryLinks'

export const getArticleArchivePageData = async (page: number = 1) => {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: ARTICLE_ARCHIVE_PAGE_SIZE,
    page,
    overrideAccess: false,
    select: ARTICLE_ARCHIVE_SELECT,
  })
  const categoryLinks = await getArticleCategoryLinks(payload)

  return {
    categoryLinks,
    posts,
  }
}
