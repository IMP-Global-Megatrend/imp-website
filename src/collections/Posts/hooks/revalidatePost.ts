import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '@/payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const paths = [`/articles/${doc.slug}`, `/posts/${doc.slug}`]
      payload.logger.info(`Revalidating post at paths: ${paths.join(', ')}`)
      for (const path of paths) {
        revalidatePath(path)
      }
      revalidatePath('/articles')
      revalidateTag('posts-sitemap', 'max')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPaths = [`/articles/${previousDoc.slug}`, `/posts/${previousDoc.slug}`]
      payload.logger.info(`Revalidating old post at paths: ${oldPaths.join(', ')}`)
      for (const path of oldPaths) {
        revalidatePath(path)
      }
      revalidatePath('/articles')
      revalidateTag('posts-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const slug = doc?.slug
    if (slug) {
      revalidatePath(`/articles/${slug}`)
      revalidatePath(`/posts/${slug}`)
    }
    revalidatePath('/articles')
    revalidateTag('posts-sitemap', 'max')
  }

  return doc
}
