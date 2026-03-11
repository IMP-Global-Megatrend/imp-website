import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { ARTICLE_ARCHIVE_PAGE_SIZE } from '@/app/(frontend)/articles/_lib/constants'

type ArchiveRangeAndPaginationProps = {
  basePath: string
  currentPage: number
  totalPages: number
  totalDocs: number
}

export function ArchiveRangeAndPagination({
  basePath,
  currentPage,
  totalPages,
  totalDocs,
}: ArchiveRangeAndPaginationProps) {
  return (
    <div className="container pt-6 md:pt-8 pb-14 md:pb-16">
      <div className="mb-8">
        <PageRange
          collectionLabels={{ plural: 'Articles', singular: 'Article' }}
          currentPage={currentPage}
          limit={ARTICLE_ARCHIVE_PAGE_SIZE}
          totalDocs={totalDocs}
        />
      </div>
      {totalPages > 1 && currentPage && (
        <Pagination basePath={basePath} page={currentPage} totalPages={totalPages} />
      )}
    </div>
  )
}
