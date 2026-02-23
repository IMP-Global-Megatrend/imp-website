import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { migrateFrontendPagesToCMS } from '@/endpoints/migrate-frontend-pages'

export const maxDuration = 120

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const result = await migrateFrontendPagesToCMS(payload)
    return Response.json({ success: true, result })
  } catch (error) {
    payload.logger.error({ err: error, message: 'Frontend page migration failed' })
    return Response.json({ success: false, error: String(error) }, { status: 500 })
  }
}
