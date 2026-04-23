import { TickerBadge } from './TickerBadge'
import { render, screen } from '@testing-library/react'
describe('TickerBadge', () => {
  it('shows the ticker and company', () => {
    render(<TickerBadge ticker="IMP" company="C" />)
    expect(screen.getByText('IMP', { exact: true })).toBeInTheDocument()
  })
})
