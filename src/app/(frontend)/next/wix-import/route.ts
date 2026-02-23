import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { wixImport } from '@/endpoints/wix-import'
import type { WixImportOptions } from '@/endpoints/wix-import/types'

export const maxDuration = 300

export async function POST(req: Request): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    let options: WixImportOptions = {}
    try {
      const body = await req.json()
      options = body as WixImportOptions
    } catch {
      // No body or invalid JSON — use defaults
    }

    const result = await wixImport({ payload, options })

    return Response.json({ success: true, result })
  } catch (error) {
    payload.logger.error({ err: error, message: 'Wix import failed' })
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 },
    )
  }
}
