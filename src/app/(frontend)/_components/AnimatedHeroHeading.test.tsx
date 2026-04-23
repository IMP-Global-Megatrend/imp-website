import { AnimatedHeroHeading } from './AnimatedHeroHeading'
import { render, screen } from '@testing-library/react'

describe('AnimatedHeroHeading', () => {
  it('renders heading text', () => {
    render(<AnimatedHeroHeading heading="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
