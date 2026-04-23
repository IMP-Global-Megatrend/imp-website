jest.mock('lucide-animated', () => {
  const React = require('react')
  const C = React.forwardRef((p, r) => React.createElement('span', { 'data-testid': 'lucide', ref: r }))
  C.displayName = 'I'
  return new Proxy({}, { get: () => C })
})
jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { SiteHeader } from './SiteHeader'
import { render, screen } from '@testing-library/react'
describe('SiteHeader', () => {
  it('renders primary navigation', () => {
    render(<SiteHeader />)
    const fundLinks = screen.getAllByRole('link', { name: 'The Fund' })
    expect(fundLinks.length).toBeGreaterThan(0)
  })
})
