import type { Metadata } from 'next'
import { canonicalPathForPage } from '@/app/(frontend)/_lib/archivePagination'
import { ogImagePathForRoute } from '@/utilities/ogImage'

type BuildPaginatedArchiveMetadataArgs = {
  basePath: string
  pageNumber: string
  titleTemplate: string
  descriptionTemplate: string
}

export const buildPaginatedArchiveMetadata = ({
  basePath,
  pageNumber,
  titleTemplate,
  descriptionTemplate,
}: BuildPaginatedArchiveMetadataArgs): Metadata => {
  const numericPage = Number(pageNumber)
  const canonicalPath = canonicalPathForPage(basePath, numericPage)
  const openGraphImageUrl = ogImagePathForRoute(canonicalPath)
  const resolvedTitle = titleTemplate.replace('{pageNumber}', pageNumber || '')
  const resolvedDescription = descriptionTemplate.replace('{pageNumber}', pageNumber || '')

  return {
    alternates: {
      canonical: canonicalPath,
    },
    title: resolvedTitle,
    description: resolvedDescription,
    openGraph: {
      images: [{ url: openGraphImageUrl }],
      url: canonicalPath,
    },
    twitter: {
      card: 'summary_large_image',
      description: resolvedDescription,
      images: [openGraphImageUrl],
      title: resolvedTitle,
    },
  }
}
