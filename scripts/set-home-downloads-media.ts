// @ts-nocheck
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function main() {
  const [{ default: config }, { getPayload }] = await Promise.all([
    import('@payload-config'),
    import('payload'),
  ])

  const payload = await getPayload({ config })

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
  if (!homePage) {
    throw new Error('Home page not found.')
  }

  const updated = await payload.update({
    collection: 'pages',
    id: homePage.id,
    data: {
      _status: 'published',
      homeDownloads: {
        factsheetUsd: 49,
        factsheetChfHedged: 51,
        fundCommentary: 50,
        presentation: 52,
      },
    },
    depth: 1,
    context: {
      disableRevalidate: true,
    },
  })

  payload.logger.info(
    `[home-downloads] Updated page #${updated.id} (${updated.slug}) with mapped media IDs (49, 51, 50, 52).`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
