import { QuoteBandSection } from './QuoteBandSection'
import { render, screen } from '@testing-library/react'

describe('QuoteBandSection', () => {
  it('renders string quotes', () => {
    render(
      <QuoteBandSection
        heading="H"
        quotes={['One quote', 'Two quote']}
      />,
    )
    expect(screen.getByText('H', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('One quote', { exact: true })).toBeInTheDocument()
  })
})
