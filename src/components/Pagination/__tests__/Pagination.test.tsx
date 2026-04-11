import { Pagination } from '@/components/Pagination'
import { render, screen } from '@testing-library/react'

describe('Pagination (archive)', () => {
  it('links page 1 to basePath and uses /page/N for other pages', () => {
    render(<Pagination page={2} totalPages={4} basePath="/articles" />)

    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/articles')
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/articles/page/2')
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/articles/page/3')
    expect(screen.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute(
      'href',
      '/articles',
    )
    expect(screen.getByRole('link', { name: 'Go to next page' })).toHaveAttribute(
      'href',
      '/articles/page/3',
    )
  })

  it('defaults basePath to /posts', () => {
    render(<Pagination page={1} totalPages={2} />)
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/posts/page/2')
  })

  it('hides prev controls on page 1 but keeps the current page link', () => {
    render(<Pagination page={1} totalPages={3} basePath="/blog" />)
    expect(screen.queryByRole('link', { name: 'Go to previous page' })).not.toBeInTheDocument()
    const current = screen.getByRole('link', { name: '1' })
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveAttribute('href', '/blog')
  })

  it('hides next controls on the last page', () => {
    render(<Pagination page={3} totalPages={3} basePath="/blog" />)
    expect(screen.queryByRole('link', { name: 'Go to next page' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: '4' })).not.toBeInTheDocument()
  })
})
