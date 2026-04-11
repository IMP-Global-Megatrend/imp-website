import { toKebabCase } from '../toKebabCase'

describe('toKebabCase', () => {
  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('fooBar')).toBe('foo-bar')
  })

  it('replaces spaces with hyphens', () => {
    expect(toKebabCase('Foo Bar')).toBe('foo-bar')
  })

  it('inserts hyphens only between lowercase and uppercase letters', () => {
    expect(toKebabCase('XMLHttpRequest')).toBe('xmlhttp-request')
  })
})
