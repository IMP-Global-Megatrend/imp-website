import { InvestmentProcessTimeline } from './InvestmentProcessTimeline'
import { render, screen } from '@testing-library/react'

describe('InvestmentProcessTimeline', () => {
  it('renders a list of items', () => {
    render(<InvestmentProcessTimeline items={['First', 'Second']} />)
    expect(screen.getByText('First')).toBeInTheDocument()
  })
})
