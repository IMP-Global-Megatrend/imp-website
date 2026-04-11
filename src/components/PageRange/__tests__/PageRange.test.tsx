import { PageRange } from '@/components/PageRange'
import { render, screen } from '@testing-library/react'

describe('PageRange', () => {
  it('shows empty-state copy when there are no docs', () => {
    render(<PageRange totalDocs={0} />)
    expect(screen.getByText(/Search produced no results/)).toBeInTheDocument()
  })

  it('shows a single-index range on the first page', () => {
    render(<PageRange currentPage={1} limit={12} totalDocs={24} collection="posts" />)
    expect(screen.getByText(/Showing 1 - 12 of 24 Posts/)).toBeInTheDocument()
  })

  it('uses singular label when only one doc', () => {
    render(<PageRange currentPage={1} limit={12} totalDocs={1} collection="posts" />)
    expect(screen.getByText(/Showing 1 of 1 Post/)).toBeInTheDocument()
  })

  it('uses custom collection labels when provided', () => {
    render(
      <PageRange
        currentPage={2}
        limit={10}
        totalDocs={25}
        collectionLabels={{ plural: 'Items', singular: 'Item' }}
      />,
    )
    expect(screen.getByText(/Showing 11 - 20 of 25 Items/)).toBeInTheDocument()
  })
})
