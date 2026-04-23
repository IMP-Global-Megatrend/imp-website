import { HeroCtaButton } from './HeroCtaButton'
import { render, screen } from '@testing-library/react'
describe('HeroCtaButton', () => {
  it('renders a CTA link', () => {
    render(<HeroCtaButton href="/x" label="Next" />)
    expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/x')
  })
})
