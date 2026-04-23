import { act, renderHook } from '@testing-library/react'

import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the initial value immediately', () => {
    const { result } = renderHook(({ v }) => useDebounce(v, 200), { initialProps: { v: 'first' } })
    expect(result.current).toBe('first')
  })

  it('updates to the latest value after the delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 200), { initialProps: { v: 'a' } })

    rerender({ v: 'b' })
    expect(result.current).toBe('a')

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBe('b')
  })
})
