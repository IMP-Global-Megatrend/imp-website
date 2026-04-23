import { HeaderNav } from './index'
import { render, screen } from '@testing-library/react'
import type { Header } from '@/payload-types'

const data = {
  navItems: [
    { link: { type: 'custom' as const, label: 'Home', url: '/' } },
  ],
} as unknown as Header

describe('HeaderNav', () => {
  it('renders nav links and contact CTA', () => {
    render(<HeaderNav data={data} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact-us')
  })
})
