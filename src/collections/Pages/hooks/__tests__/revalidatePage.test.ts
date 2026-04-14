/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}))

import { revalidatePath, revalidateTag } from 'next/cache'

import { revalidateDelete, revalidatePage } from '../revalidatePage'

describe('revalidatePage hooks', () => {
  beforeEach(() => {
    jest.mocked(revalidatePath).mockClear()
    jest.mocked(revalidateTag).mockClear()
  })

  it('revalidates root when home page is published', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { _status: 'published' as const, slug: 'home' } as never
    const previousDoc = { _status: 'draft' as const, slug: 'home' } as never

    revalidatePage({
      doc,
      previousDoc,
      req: { payload, context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidateTag).toHaveBeenCalledWith('pages-sitemap', 'max')
  })

  it('skips when disableRevalidate is set', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { _status: 'published' as const, slug: 'about' } as never
    const previousDoc = { _status: 'draft' as const, slug: 'about' } as never

    revalidatePage({
      doc,
      previousDoc,
      req: { payload, context: { disableRevalidate: true } } as never,
    } as never)

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('revalidateDelete targets home path', () => {
    revalidateDelete({
      doc: { slug: 'home' },
      req: { context: {} } as never,
    } as never)

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})
