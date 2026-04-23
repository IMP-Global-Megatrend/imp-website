jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { PageHero, PageHeroSubtitle, PageHeroMeta } from './PageHero'
import { render, screen } from '@testing-library/react'
describe('PageHero', () => {
  it('renders title and subtitle', () => {
    render(
      <PageHero title="T" subtitle="S" showBackground={false} showScrollIndicator={false} />,
    )
    expect(screen.getByText('T', { exact: false })).toBeInTheDocument()
  })
})
describe('PageHero parts', () => {
  it('renders PageHeroSubtitle and meta', () => {
    render(
      <>
        <PageHeroSubtitle>sub</PageHeroSubtitle>
        <PageHeroMeta items={[<span key="1">A</span>, <span key="2">B</span>]} />
      </>,
    )
    expect(screen.getByText('sub')).toBeInTheDocument()
  })
})
