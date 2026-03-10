import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePerformanceAnalysisPage: CollectionAfterChangeHook = ({ req: { payload, context }, doc }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating performance analysis page')
    revalidatePath('/performance-analysis')
  }

  return doc
}

export const revalidatePerformanceAnalysisPageOnDelete: CollectionAfterDeleteHook = ({ req: { payload, context }, doc }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating performance analysis page after delete')
    revalidatePath('/performance-analysis')
  }

  return doc
}
