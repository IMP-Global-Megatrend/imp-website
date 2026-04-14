import { populatePublishedAt } from '../populatePublishedAt'

describe('populatePublishedAt', () => {
  it('sets publishedAt on create when missing on req.data', () => {
    const data = { title: 'x' }
    const now = new Date('2020-01-01T00:00:00.000Z')

    jest.useFakeTimers()
    jest.setSystemTime(now)

    const result = populatePublishedAt({
      data,
      operation: 'create',
      req: { data: {} } as never,
    } as never)

    expect(result).toEqual(expect.objectContaining({ title: 'x', publishedAt: now }))

    jest.useRealTimers()
  })

  it('returns data unchanged when publishedAt already set on req.data', () => {
    const data = { title: 'x' }
    const result = populatePublishedAt({
      data,
      operation: 'create',
      req: { data: { publishedAt: '2021-01-01' } } as never,
    } as never)

    expect(result).toBe(data)
  })
})
