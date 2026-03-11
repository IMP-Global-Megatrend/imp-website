import { getPayload } from 'payload'
import config from '@payload-config'
import { wixImport } from '@/endpoints/wix-import/index'
import type { WixImportOptions } from '@/endpoints/wix-import/types'

function parseOptionsFromArg(): WixImportOptions {
  const raw = process.argv[2]
  if (!raw) {
    return {
      dryRun: true,
      upsertByWixId: true,
      skipExisting: true,
      publishOnImport: false,
      categories: true,
      posts: true,
      pages: true,
      dataCollections: [],
      limit: 10,
    }
  }

  try {
    return JSON.parse(raw) as WixImportOptions
  } catch (error) {
    throw new Error(`Invalid JSON options argument: ${String(error)}`)
  }
}

async function run(): Promise<void> {
  const options = parseOptionsFromArg()
  const payload = await getPayload({ config })
  const result = await wixImport({ payload, options })
  console.log(JSON.stringify({ success: true, options, result }, null, 2))
  payload.logger.info(`Wix import script finished: ${JSON.stringify(result, null, 2)}`)
}

try {
  await run()
} catch (error) {
  console.error('Wix import script failed:', error)
  process.exit(1)
}
