import { normalizeWixDataFields, sanitizeWixRawData } from '../normalize-data'

describe('normalizeWixDataFields', () => {
  it('skips excluded Wix keys', () => {
    const result = normalizeWixDataFields({
      _id: 'x',
      _createdDate: 'y',
      title: 'Hello',
    })
    expect(result.textFields).toEqual([{ key: 'title', value: 'Hello' }])
  })

  it('classifies ISO-like strings as dates', () => {
    const result = normalizeWixDataFields({
      published: '2024-03-01T00:00:00.000Z',
      note: 'not-a-date',
    })
    expect(result.dateFields).toContainEqual({ key: 'published', value: '2024-03-01T00:00:00.000Z' })
    expect(result.textFields).toContainEqual({ key: 'note', value: 'not-a-date' })
  })

  it('ignores empty strings', () => {
    expect(normalizeWixDataFields({ empty: '' }).textFields).toEqual([])
  })

  it('handles numbers, booleans, and Wix date objects', () => {
    const result = normalizeWixDataFields({
      count: 3,
      active: true,
      wixDate: { $date: '2024-01-01T00:00:00.000Z' },
    })
    expect(result.numberFields).toEqual([{ key: 'count', value: 3 }])
    expect(result.booleanFields).toEqual([{ key: 'active', value: true }])
    expect(result.dateFields).toEqual([{ key: 'wixDate', value: '2024-01-01T00:00:00.000Z' }])
  })
})

describe('sanitizeWixRawData', () => {
  it('drops excluded keys and keeps JSON-serializable values', () => {
    expect(
      sanitizeWixRawData({
        _id: '1',
        keep: { nested: true },
      }),
    ).toEqual({ keep: { nested: true } })
  })
})
