/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDelete, revalidatePost } from '../revalidatePost'

describe('revalidatePost hooks', () => {
  beforeEach(() => {
    jest.mocked(revalidatePath).mockClear()
    jest.mocked(revalidateTag).mockClear()
  })

  it('revalidates paths when a post is published', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { _status: 'published' as const, slug: 'hello' } as never
    const previousDoc = { _status: 'draft' as const, slug: 'hello' } as never

    revalidatePost({
      doc,
      previousDoc,
      req: { payload, context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/articles/hello')
    expect(revalidateTag).toHaveBeenCalledWith('posts-sitemap', 'max')
  })

  it('skips revalidation when disableRevalidate is set', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { _status: 'published' as const, slug: 'hello' } as never
    const previousDoc = { _status: 'draft' as const, slug: 'hello' } as never

    revalidatePost({
      doc,
      previousDoc,
      req: { payload, context: { disableRevalidate: true } } as never,
    } as never)

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidateDelete clears paths for a deleted post', () => {
    revalidateDelete({
      doc: { slug: 'gone' },
      req: { context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/articles/gone')
    expect(revalidateTag).toHaveBeenCalledWith('posts-sitemap', 'max')
  })
})
