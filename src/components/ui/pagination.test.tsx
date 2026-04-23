import {
  Pagination,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { render, screen } from '@testing-library/react'

describe('ui/pagination primitives', () => {
  it('renders Pagination as a navigation landmark', () => {
    render(
      <Pagination className="extra">
        <span>child</span>
      </Pagination>,
    )
    const nav = screen.getByRole('navigation', { name: 'pagination' })
    expect(nav).toHaveClass('extra')
    expect(nav).toHaveTextContent('child')
  })

  it('renders PaginationLink as a link when href is provided', () => {
    render(
      <PaginationLink href="/posts/page/2" isActive>
        2
      </PaginationLink>,
    )
    const link = screen.getByRole('link', { name: '2' })
    expect(link).toHaveAttribute('href', '/posts/page/2')
    expect(link).toHaveAttribute('aria-current', 'page')
    expect(link.className).toContain('border-primary-light')
  })

  it('renders PaginationLink as a button when there is no href', () => {
    render(<PaginationLink>1</PaginationLink>)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
  })

  it('renders Previous and Next with accessible names', () => {
    render(
      <>
        <PaginationPrevious href="/posts" />
        <PaginationNext href="/posts/page/2" />
      </>,
    )
    expect(screen.getByRole('link', { name: 'Go to previous page' })).toHaveAttribute('href', '/posts')
    expect(screen.getByRole('link', { name: 'Go to next page' })).toHaveAttribute(
      'href',
      '/posts/page/2',
    )
  })

  it('exposes an sr-only label on the ellipsis', () => {
    render(
      <PaginationEllipsis data-testid="ellipsis" />,
    )
    expect(screen.getByText('More pages')).toHaveClass('sr-only')
  })
})
