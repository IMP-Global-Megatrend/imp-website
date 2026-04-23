import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

function revalidateAdvisorPathIfSlug(doc: { slug?: string } | null | undefined) {
  const slug = typeof doc?.slug === 'string' ? doc.slug.trim() : ''
  if (slug) revalidatePath(`/advisors/${slug}`)
}

export const revalidateAboutUsPage: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating about us page')
    revalidatePath('/about-us')
    revalidateAdvisorPathIfSlug(doc)
    revalidateTag('pages-sitemap', 'max')
  }
  return doc
}

export const revalidateAboutUsPageOnDelete: CollectionAfterDeleteHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating about us page after advisor delete')
    revalidatePath('/about-us')
    revalidateAdvisorPathIfSlug(doc)
    revalidateTag('pages-sitemap', 'max')
  }
  return doc
}
