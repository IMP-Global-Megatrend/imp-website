import { formatDateTime } from '../formatDateTime'

describe('formatDateTime', () => {
  it('formats an ISO timestamp as MM/DD/YYYY in UTC', () => {
    expect(formatDateTime('2024-01-15T12:00:00.000Z')).toBe('01/15/2024')
  })

  it('uses the current date when timestamp is empty', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-06-20T00:00:00.000Z'))
    expect(formatDateTime('')).toBe('06/20/2024')
    jest.useRealTimers()
  })
})
