jest.mock('@payloadcms/ui', () => ({ toast: { info: jest.fn(), error: jest.fn() } }))

import { SeedButton } from './index'
import { render, screen } from '@testing-library/react'

describe('SeedButton', () => {
  it('renders a control', () => {
    render(<SeedButton />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
