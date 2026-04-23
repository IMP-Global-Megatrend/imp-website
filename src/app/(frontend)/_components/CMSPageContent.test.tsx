jest.mock('@/blocks/RenderBlocks', () => ({
  RenderBlocks: () => <div data-testid="blocks" />,
}))

jest.mock('@/heros/RenderHero', () => ({
  RenderHero: () => <div data-testid="hero" />,
}))

import { CMSPageContent } from './CMSPageContent'
import { render, screen } from '@testing-library/react'
import type { Page } from '@/payload-types'

describe('CMSPageContent', () => {
  it('renders article structure for layout blocks', () => {
    const page = { title: 'My page', id: 1, slug: 'p', layout: [] } as Page
    render(<CMSPageContent page={page} />)
    expect(document.querySelector('article')).toBeInTheDocument()
  })
})
