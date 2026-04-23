jest.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => () => Promise.resolve({ navItems: [] }),
}))

import { Footer } from './Component'
import { render, screen } from '@testing-library/react'

describe('Footer', () => {
  it('renders the footer with brand', async () => {
    const ui = await Footer()
    render(ui)
    expect(screen.getByText('IMP')).toBeInTheDocument()
  })
})
