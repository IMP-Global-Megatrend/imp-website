import { link } from '../link'

describe('link field', () => {
  it('returns a group field named link', () => {
    const field = link() as { type?: string; name?: string; fields?: unknown[] }
    expect(field.type).toBe('group')
    expect(field.name).toBe('link')
    expect(Array.isArray(field.fields)).toBe(true)
  })
})
