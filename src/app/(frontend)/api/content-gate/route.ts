import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

type SubmissionBody = {
  selectedCountry?: string
  path?: string
}

function firstHeaderValue(value: string | null): string {
  if (!value) return ''
  return value.split(',')[0]?.trim() || ''
}

function parseForwardedIPs(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function normalizeIP(ip: string): string {
  if (!ip) return ''
  // Handle IPv6-mapped IPv4 addresses like ::ffff:1.2.3.4
  return ip.replace(/^::ffff:/, '')
}

function isPrivateOrLocalIP(ip: string): boolean {
  const value = normalizeIP(ip)
  if (!value) return true

  // IPv6 localhost / link-local / unique local
  if (value === '::1' || value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) {
    return true
  }

  // IPv4 private / localhost
  return (
    value === '127.0.0.1' ||
    value.startsWith('10.') ||
    value.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(value)
  )
}

function getClientIP(requestHeaders: Headers): string {
  const candidates = [
    ...parseForwardedIPs(requestHeaders.get('x-forwarded-for')),
    ...parseForwardedIPs(requestHeaders.get('x-vercel-forwarded-for')),
    firstHeaderValue(requestHeaders.get('x-real-ip')),
    firstHeaderValue(requestHeaders.get('cf-connecting-ip')),
    firstHeaderValue(requestHeaders.get('x-vercel-ip')),
  ]
    .map(normalizeIP)
    .filter(Boolean)

  // Prefer first public IP; fallback to first candidate.
  return candidates.find((ip) => !isPrivateOrLocalIP(ip)) || candidates[0] || 'unknown'
}

function getCountryFromHeaders(requestHeaders: Headers): string {
  return (
    requestHeaders.get('x-vercel-ip-country') ||
    requestHeaders.get('cf-ipcountry') ||
    requestHeaders.get('x-country-code') ||
    'unknown'
  )
}

async function lookupCountryFromIP(ipAddress: string): Promise<string> {
  if (!ipAddress || ipAddress === 'unknown' || isPrivateOrLocalIP(ipAddress)) {
    return 'unknown'
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ipAddress)}`, {
      cache: 'no-store',
    })
    if (!response.ok) return 'unknown'

    const data = (await response.json()) as {
      success?: boolean
      country?: string
      country_code?: string
    }

    if (!data.success || !data.country) return 'unknown'
    return data.country_code ? `${data.country} (${data.country_code})` : data.country
  } catch {
    return 'unknown'
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as SubmissionBody
    const selectedCountry = body.selectedCountry?.trim()
    const path = body.path?.trim() || '/'

    if (!selectedCountry) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const requestHeaders = await headers()
    const userAgent = requestHeaders.get('user-agent') || 'unknown'
    const ipAddress = getClientIP(requestHeaders)
    const headerCountry = getCountryFromHeaders(requestHeaders)
    const ipCountry =
      headerCountry !== 'unknown' ? headerCountry : await lookupCountryFromIP(ipAddress)

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'content-gate-submissions',
      overrideAccess: true,
      data: {
        selectedCountry,
        ipCountry,
        ipAddress,
        userAgent,
        path,
        submittedAt: new Date().toISOString(),
      },
    })

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Unable to store submission' }, { status: 500 })
  }
}
