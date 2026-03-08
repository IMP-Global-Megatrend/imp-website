// @ts-nocheck
import config from '@payload-config'
import dotenv from 'dotenv'
import path from 'node:path'
import { getPayload, type File } from 'payload'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type FooterDownloadKey = 'factsheetUsd' | 'factsheetChfHedged' | 'fundCommentary' | 'presentation'

const FOOTER_DOWNLOADS: Array<{
  key: FooterDownloadKey
  label: string
  sourceUrl: string
  filename: string
}> = [
  {
    key: 'factsheetUsd',
    label: 'Factsheet USD PDF',
    sourceUrl: 'https://www.impgmtfund.com/_files/ugd/037a25_e3e73c35d566433fa958a54696b69633.pdf',
    filename: 'factsheet-usd.pdf',
  },
  {
    key: 'factsheetChfHedged',
    label: 'Factsheet CHF Hedged PDF',
    sourceUrl: 'https://www.impgmtfund.com/_files/ugd/037a25_671093d7123f482e9e90bf53264f0f85.pdf',
    filename: 'factsheet-chf-hedged.pdf',
  },
  {
    key: 'fundCommentary',
    label: 'Fund Commentary PDF',
    sourceUrl: 'https://www.impgmtfund.com/_files/ugd/037a25_4f821338d34e4ad082c86d13bd46c757.pdf',
    filename: 'fund-commentary.pdf',
  },
  {
    key: 'presentation',
    label: 'Presentation PDF',
    sourceUrl: 'https://www.impgmtfund.com/_files/ugd/037a25_eb4acc9f30f64bc6a3cb83cd325b4333.pdf',
    filename: 'presentation.pdf',
  },
]

function getContentTypeFromResponse(res: Response, fallback: string): string {
  const fromHeader = res.headers.get('content-type')
  if (fromHeader && fromHeader.trim()) return fromHeader
  return fallback
}

async function fetchFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}. Status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: filename,
    data: Buffer.from(data),
    mimetype: getContentTypeFromResponse(res, 'application/pdf'),
    size: data.byteLength,
  }
}

async function upsertPdfMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  item: (typeof FOOTER_DOWNLOADS)[number],
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: {
      sourceUrl: {
        equals: item.sourceUrl,
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const existingDoc = existing.docs?.[0]
  if (existingDoc) {
    await payload.update({
      collection: 'media',
      id: existingDoc.id,
      data: {
        alt: item.label,
        sourceUrl: item.sourceUrl,
      },
      depth: 0,
    })
    return existingDoc.id
  }

  const file = await fetchFile(item.sourceUrl, item.filename)
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: item.label,
      sourceUrl: item.sourceUrl,
    },
    file,
    depth: 0,
  })

  return created.id
}

async function main() {
  const payload = await getPayload({ config })

  const mediaIdsByKey = {} as Record<FooterDownloadKey, number>
  for (const item of FOOTER_DOWNLOADS) {
    const mediaId = await upsertPdfMedia(payload, item)
    mediaIdsByKey[item.key] = mediaId
    payload.logger.info(`[footer-downloads] linked ${item.key} -> media #${mediaId}`)
  }

  const footer = await payload.findGlobal({
    slug: 'footer',
    depth: 0,
  })

  await payload.updateGlobal({
    slug: 'footer',
    data: {
      ...(Array.isArray(footer.navItems) ? { navItems: footer.navItems } : {}),
      downloads: {
        factsheetUsd: mediaIdsByKey.factsheetUsd,
        factsheetChfHedged: mediaIdsByKey.factsheetChfHedged,
        fundCommentary: mediaIdsByKey.fundCommentary,
        presentation: mediaIdsByKey.presentation,
      },
    },
    depth: 0,
  })

  payload.logger.info('[footer-downloads] Footer global updated with media uploads.')

  const homePageResult = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        equals: 'home',
      },
    },
    limit: 1,
    pagination: false,
    depth: 0,
  })

  const homePage = homePageResult.docs?.[0]
  if (homePage) {
    await payload.update({
      collection: 'pages',
      id: homePage.id,
      data: {
        homeDownloads: {
          factsheetUsd: mediaIdsByKey.factsheetUsd,
          factsheetChfHedged: mediaIdsByKey.factsheetChfHedged,
          fundCommentary: mediaIdsByKey.fundCommentary,
          presentation: mediaIdsByKey.presentation,
        },
      },
      depth: 0,
    })
    payload.logger.info('[footer-downloads] Home page updated with homeDownloads media fields.')
  } else {
    payload.logger.warn('[footer-downloads] Home page not found; skipped homeDownloads update.')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
