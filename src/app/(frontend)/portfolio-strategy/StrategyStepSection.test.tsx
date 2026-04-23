import { StrategyStepSection } from './StrategyStepSection'
import { render, screen } from '@testing-library/react'

const step = {
  title: 'Step 1',
  src: '/x.png',
  items: [{ heading: 'H', body: 'B' }],
}

describe('StrategyStepSection', () => {
  it('renders a step with title and items', () => {
    render(<StrategyStepSection step={step} index={0} total={2} />)
    expect(screen.getByRole('heading', { name: 'Step 1', level: 2 })).toBeInTheDocument()
  })
})
