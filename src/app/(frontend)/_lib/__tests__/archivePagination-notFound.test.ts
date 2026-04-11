import { notFound } from 'next/navigation'
import { parsePositivePageOr404 } from '../archivePagination'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
}))

describe('parsePositivePageOr404', () => {
  beforeEach(() => {
    jest.mocked(notFound).mockClear()
  })

  it('returns parsed integer for valid page strings', () => {
    expect(parsePositivePageOr404('1')).toBe(1)
    expect(parsePositivePageOr404('42')).toBe(42)
  })

  it('calls notFound for non-integers or values below 1', () => {
    expect(() => parsePositivePageOr404('0')).toThrow('NEXT_NOT_FOUND')
    expect(notFound).toHaveBeenCalled()

    expect(() => parsePositivePageOr404('-1')).toThrow('NEXT_NOT_FOUND')
    expect(() => parsePositivePageOr404('1.5')).toThrow('NEXT_NOT_FOUND')
    expect(() => parsePositivePageOr404('abc')).toThrow('NEXT_NOT_FOUND')
  })
})
