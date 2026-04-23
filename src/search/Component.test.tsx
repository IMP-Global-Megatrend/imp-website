const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/utilities/useDebounce', () => ({
  useDebounce: (value: string) => value,
}))

import { Search } from './Component'
import { fireEvent, render, screen } from '@testing-library/react'

describe('Search', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('navigates to /search on mount', () => {
    render(<Search />)
    expect(mockPush).toHaveBeenCalledWith('/search')
  })

  it('updates the route when the query changes', () => {
    render(<Search />)
    mockPush.mockClear()

    fireEvent.change(screen.getByPlaceholderText('Search'), { target: { value: 'climate' } })

    expect(mockPush).toHaveBeenCalledWith('/search?q=climate')
  })
})
