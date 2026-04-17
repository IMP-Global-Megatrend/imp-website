import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateAboutUsPage: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating about us page')
    revalidatePath('/about-us')
  }
  return doc
}

export const revalidateAboutUsPageOnDelete: CollectionAfterDeleteHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating about us page after advisor delete')
    revalidatePath('/about-us')
  }
  return doc
}
