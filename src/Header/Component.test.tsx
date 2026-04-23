jest.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => () => Promise.resolve({ navItems: [] }),
}))

import { Header } from './Component'
import { render, screen } from '@testing-library/react'

describe('Header', () => {
  it('renders the client header shell', async () => {
    const ui = await Header()
    render(ui)
    expect(screen.getByRole('link', { name: 'The Fund' })).toBeInTheDocument()
  })
})
