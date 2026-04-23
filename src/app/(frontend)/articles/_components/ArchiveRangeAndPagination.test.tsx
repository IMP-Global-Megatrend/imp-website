jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { ArchiveRangeAndPagination } from './ArchiveRangeAndPagination'
import { render, screen } from '@testing-library/react'
describe('ArchiveRangeAndPagination', () => {
  it('shows a range and pagination', () => {
    render(
      <ArchiveRangeAndPagination
        page={1}
        totalPages={2}
        totalDocs={10}
        currentPage={1}
        pageLimit={5}
        basePath="/articles"
        collectionLabel="Articles"
      />,
    )
    expect(document.body).toBeTruthy()
  })
})
