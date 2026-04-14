jest.mock('@payload-config', () => ({ __esModule: true, default: Promise.resolve({}) }))

jest.mock('../../../../payload.config', () => ({ __esModule: true, default: Promise.resolve({}) }))

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

import { generateMetadata } from '../page'

describe('Articles index page', () => {
  it('generateMetadata sets canonical path and OG image', () => {
    const meta = generateMetadata()

    expect(meta.alternates?.canonical).toBe('/articles')
    expect(meta.openGraph?.url).toBe('/articles')
    expect(Array.isArray(meta.openGraph?.images)).toBe(true)
  })
})
