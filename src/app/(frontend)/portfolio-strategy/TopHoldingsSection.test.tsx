import { TopHoldingsSection } from './TopHoldingsSection'
import { render, screen } from '@testing-library/react'

const holdings: [string, string, string][] = [
  ['Microsoft', '3.5', '#0f3bbf'],
  ['Other', '1.0', '#dbeaff'],
]

describe('TopHoldingsSection', () => {
  it('renders the section', () => {
    render(<TopHoldingsSection holdings={holdings} />)
    expect(screen.getByText('Microsoft')).toBeInTheDocument()
  })
})
