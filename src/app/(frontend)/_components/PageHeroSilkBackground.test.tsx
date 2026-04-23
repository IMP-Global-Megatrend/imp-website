import { PageHeroSilkBackground } from './PageHeroSilkBackground'
import { render, screen } from '@testing-library/react'
const palette = { a: 'red' } as never
describe('PageHeroSilkBackground', () => {
  it('renders a decorative layer for the given palette', () => {
    const { container } = render(
      <PageHeroSilkBackground
        palette={palette}
        withNoise={true}
        noiseOpacity={0.1}
        noiseSize={0.1}
        noiseBlendMode="soft-light"
      />,
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
