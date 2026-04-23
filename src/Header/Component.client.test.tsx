jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

jest.mock('@/providers/HeaderTheme', () => ({
  useHeaderTheme: () => ({ headerTheme: null, setHeaderTheme: jest.fn() }),
}))

import { HeaderClient } from './Component.client'
import { render, screen } from '@testing-library/react'
import type { Header } from '@/payload-types'

const data = {
  navItems: [{ link: { type: 'custom' as const, label: 'The Fund', url: '/fund' } }],
} as unknown as Header

describe('HeaderClient', () => {
  it('renders logo and navigation', () => {
    render(<HeaderClient data={data} />)
    expect(screen.getByRole('img', { name: 'IMP logo' })).toBeInTheDocument()
  })
})
