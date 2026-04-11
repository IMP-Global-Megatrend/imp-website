jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))
jest.mock('payload', () => ({ getPayload: jest.fn() }))

import { decodeSlugParam } from '../contentQueries'

describe('decodeSlugParam', () => {
  it('decodes URI-encoded slug segments', () => {
    expect(decodeSlugParam('hello%20world')).toBe('hello world')
    expect(decodeSlugParam('caf%C3%A9')).toBe('café')
  })

  it('passes through strings without escapes', () => {
    expect(decodeSlugParam('simple-slug')).toBe('simple-slug')
  })
})
