import { formatArticleDate } from '../formatArticleDate'

describe('formatArticleDate', () => {
  it('returns empty string for missing or invalid input', () => {
    expect(formatArticleDate()).toBe('')
    expect(formatArticleDate(null)).toBe('')
    expect(formatArticleDate('')).toBe('')
    expect(formatArticleDate('not-a-date')).toBe('')
  })

  it('formats a valid ISO date with ordinal and full month', () => {
    expect(formatArticleDate('2024-01-15T12:00:00.000Z')).toBe('15th of January 2024')
  })

  it('uses correct ordinal suffixes', () => {
    expect(formatArticleDate('2024-01-01T00:00:00.000Z')).toBe('1st of January 2024')
    expect(formatArticleDate('2024-01-02T00:00:00.000Z')).toBe('2nd of January 2024')
    expect(formatArticleDate('2024-01-03T00:00:00.000Z')).toBe('3rd of January 2024')
    expect(formatArticleDate('2024-01-11T00:00:00.000Z')).toBe('11th of January 2024')
    expect(formatArticleDate('2024-01-12T00:00:00.000Z')).toBe('12th of January 2024')
    expect(formatArticleDate('2024-01-13T00:00:00.000Z')).toBe('13th of January 2024')
    expect(formatArticleDate('2024-01-21T00:00:00.000Z')).toBe('21st of January 2024')
  })
})
