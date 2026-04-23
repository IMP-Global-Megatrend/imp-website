jest.mock('recharts', () => ({
  PieChart: () => <div data-testid="pie" />,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}))

import { AllocationPanel } from './AllocationPanel'
import { render, screen } from '@testing-library/react'

const data: [string, string, string][] = [
  ['Industrials', '25', '#0f3bbf', 'Factory'],
]

describe('AllocationPanel', () => {
  it('renders a title and allocations', () => {
    render(<AllocationPanel title="Sectors" data={data} />)
    expect(screen.getByText('Sectors', { exact: true })).toBeInTheDocument()
  })
})
