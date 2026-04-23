jest.mock('recharts', () => ({
  PieChart: () => <div data-testid="pie" />,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
}))

import { AllocationDonut } from './AllocationCharts'
import { render, screen } from '@testing-library/react'

describe('AllocationDonut', () => {
  it('renders a pie chart', () => {
    const data: [string, string, string][] = [['A', '10', '#aabbcc']]
    render(
      <AllocationDonut
        data={data}
        size={100}
        activeIndex={0}
        onActiveIndexChange={() => undefined}
      />,
    )
    expect(screen.getByTestId('pie')).toBeInTheDocument()
  })
})
