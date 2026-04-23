import { CMSPageHero } from './CMSPageHero'
import { render, screen } from '@testing-library/react'

describe('CMSPageHero', () => {
  it('renders a hero title', () => {
    render(
      <CMSPageHero
        page={{} as never}
        fallbackTitle="Fallback"
        showBackground={false}
        showScrollIndicator={false}
      />,
    )
    expect(screen.getByText('Fallback')).toBeInTheDocument()
  })
})
