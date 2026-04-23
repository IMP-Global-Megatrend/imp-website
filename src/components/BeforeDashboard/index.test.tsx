import type { ReactNode } from 'react'

jest.mock('@payloadcms/ui/elements/Banner', () => ({
  Banner: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/BeforeDashboard/SeedButton', () => ({ SeedButton: () => <span>seed</span> }))

import BeforeDashboard from './index'
import { render, screen } from '@testing-library/react'

describe('BeforeDashboard', () => {
  it('renders the welcome copy', () => {
    render(<BeforeDashboard />)
    expect(screen.getByText('Welcome to your dashboard!')).toBeInTheDocument()
  })
})
