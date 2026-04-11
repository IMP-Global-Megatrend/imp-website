import deepMerge, { isObject } from '../deepMerge'

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
  })

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false)
  })

  it('returns false for primitives', () => {
    expect(isObject(1)).toBe(false)
    expect(isObject('x')).toBe(false)
    expect(isObject(undefined)).toBe(false)
  })
})

describe('deepMerge', () => {
  it('merges shallow keys from source into target', () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it('deep merges nested objects', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 } })).toEqual({ a: { x: 1, y: 2 } })
  })

  it('overwrites with non-object values from source', () => {
    expect(deepMerge({ a: { x: 1 } }, { a: 'replaced' })).toEqual({ a: 'replaced' })
  })
})
