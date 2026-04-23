import { HeroGrainientBackground } from './HeroGrainientBackground'
import { render, screen } from '@testing-library/react'
const palette = { top: 'red', bottom: 'blue' } as never
describe('HeroGrainientBackground', () => {
  it('applies a gradient', () => {
    const { container } = render(
      <HeroGrainientBackground palette={palette} className="test-gradient" />,
    )
    expect(container.querySelector('.test-gradient')).toBeInTheDocument()
  })
})
