import { ArticleCategoryChips } from './ArticleCategoryChips'
import { render, screen } from '@testing-library/react'

const categories = [
  { slug: 'c', title: 'Category', type: 'meta' as const },
] as never

describe('ArticleCategoryChips', () => {
  it('links to category pages', () => {
    render(
      <ArticleCategoryChips
        categories={categories}
        showCounts={false}
        showHeading
      />,
    )
    expect(screen.getByRole('link', { name: 'Category' })).toHaveAttribute('href', '/articles/category/c')
  })
})
