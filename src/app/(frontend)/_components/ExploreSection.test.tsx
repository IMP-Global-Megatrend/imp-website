jest.mock('lucide-animated', () => {
  const React = require('react')
  const C = React.forwardRef((p, r) => React.createElement('span', { 'data-testid': 'lucide', ref: r }))
  C.displayName = 'I'
  return new Proxy({}, { get: () => C })
})

import { ExploreSection } from './ExploreSection'
import { render, screen } from '@testing-library/react'
describe('ExploreSection', () => {
  it('renders a heading', () => {
    render(<ExploreSection />)
    expect(screen.getByText('Explore Our Megatrends')).toBeInTheDocument()
  })
})
