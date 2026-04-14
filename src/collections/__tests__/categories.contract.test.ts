/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  slugField: () => ({ name: 'slug', type: 'text', admin: {} }),
}))

import { Categories } from '../Categories'

describe('Categories collection', () => {
  it('defines slug, access, and fields', () => {
    expect(Categories.slug).toBe('categories')
    expect(Categories.access).toBeDefined()
    expect(Categories.fields?.length).toBeGreaterThan(0)
  })
})
