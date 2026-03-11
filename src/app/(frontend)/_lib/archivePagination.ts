import { notFound } from 'next/navigation'

export const DEFAULT_ARCHIVE_PAGE_SIZE = 12

export const parsePositivePageOr404 = (pageNumber: string): number => {
  const parsedPageNumber = Number(pageNumber)

  if (!Number.isInteger(parsedPageNumber) || parsedPageNumber < 1) {
    notFound()
  }

  return parsedPageNumber
}

export const canonicalPathForPage = (basePath: string, pageNumber: number): string => {
  return Number.isInteger(pageNumber) && pageNumber > 1 ? `${basePath}/page/${pageNumber}` : basePath
}

export const buildStaticPageParams = (
  totalDocs: number,
  pageSize: number = DEFAULT_ARCHIVE_PAGE_SIZE,
): Array<{ pageNumber: string }> => {
  const totalPages = Math.ceil(totalDocs / pageSize)
  const pageParams: Array<{ pageNumber: string }> = []

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber++) {
    pageParams.push({ pageNumber: String(pageNumber) })
  }

  return pageParams
}
