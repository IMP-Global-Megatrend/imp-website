jest.mock('@/components/Grainient', () => ({ __esModule: true, default: () => <div data-testid="grain" /> }))

import { OgPreviewFrame } from './OgPreviewFrame'
import { render, screen } from '@testing-library/react'

describe('OgPreviewFrame', () => {
  it('renders the title in the frame', () => {
    render(<OgPreviewFrame title="OG test title" />)
    expect(screen.getByRole('heading', { level: 1, name: 'OG test title' })).toBeInTheDocument()
  })
})
