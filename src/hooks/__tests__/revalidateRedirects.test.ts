/**
 * @jest-environment node
 */

jest.mock('next/cache', () => ({
  revalidateTag: jest.fn(),
}))

import { revalidateTag } from 'next/cache'

import { revalidateRedirects } from '../revalidateRedirects'

describe('revalidateRedirects', () => {
  beforeEach(() => {
    jest.mocked(revalidateTag).mockClear()
  })

  it('revalidates the redirects cache tag', () => {
    const payload = { logger: { info: jest.fn() } }
    const doc = { id: '1' }

    revalidateRedirects({
      doc,
      req: { payload } as never,
    } as never)

    expect(revalidateTag).toHaveBeenCalledWith('redirects', 'max')
    expect(payload.logger.info).toHaveBeenCalled()
  })
})
