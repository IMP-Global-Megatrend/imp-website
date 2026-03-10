import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePortfolioStrategyPage: CollectionAfterChangeHook = ({ req: { payload, context }, doc }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating portfolio strategy page')
    revalidatePath('/portfolio-strategy')
  }

  return doc
}

export const revalidatePortfolioStrategyPageOnDelete: CollectionAfterDeleteHook = ({ req: { payload, context }, doc }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating portfolio strategy page after delete')
    revalidatePath('/portfolio-strategy')
  }

  return doc
}
