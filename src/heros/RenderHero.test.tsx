jest.mock('@/heros/HighImpact', () => ({ HighImpactHero: () => <div>hi</div> }))
jest.mock('@/heros/LowImpact', () => ({ LowImpactHero: () => <div>lo</div> }))
jest.mock('@/heros/MediumImpact', () => ({ MediumImpactHero: () => <div>me</div> }))
import { RenderHero } from './RenderHero'
import { render, screen } from '@testing-library/react'
describe('RenderHero', () => {
  it('picks a hero for the type', () => {
    render(
      <RenderHero
        type="highImpact"
        richText={null as never}
        subheading={null as never}
        cta="c"
        ctaPath="/"
        media={null as never}
        content={null as never}
        links={[] as never}
        title="t"
        className="x"
        postMeta={[] as never}
      />,
    )
    expect(screen.getByText('hi')).toBeInTheDocument()
  })
})
