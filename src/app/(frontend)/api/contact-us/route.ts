import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { sendContactSubmissionEmails } from '@/utilities/emails/sendFormEmails'

type SubmissionBody = {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  message?: string
  inquiryTypes?: string[]
  consentAccepted?: boolean
  path?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,}$/

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
  return ip.replace(/^::ffff:/, '')
}

function isPrivateOrLocalIP(ip: string): boolean {
  const value = normalizeIP(ip)
  if (!value) return true

  if (value === '::1' || value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) {
    return true
  }

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

  return candidates.find((ip) => !isPrivateOrLocalIP(ip)) || candidates[0] || 'unknown'
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as SubmissionBody
    const firstName = body.firstName?.trim() || ''
    const lastName = body.lastName?.trim() || ''
    const phone = body.phone?.trim() || ''
    const email = body.email?.trim().toLowerCase() || ''
    const message = body.message?.trim() || ''
    const inquiryTypes = Array.isArray(body.inquiryTypes)
      ? body.inquiryTypes.map((value) => value.trim()).filter(Boolean)
      : []
    const consentAccepted = body.consentAccepted === true
    const path = body.path?.trim() || '/contact-us'

    if (
      !firstName ||
      !lastName ||
      !email ||
      !EMAIL_REGEX.test(email) ||
      !message ||
      !consentAccepted ||
      inquiryTypes.length === 0
    ) {
      return Response.json({ error: 'Missing or invalid required fields' }, { status: 400 })
    }

    if (phone && !PHONE_REGEX.test(phone)) {
      return Response.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const requestHeaders = await headers()
    const userAgent = requestHeaders.get('user-agent') || 'unknown'
    const ipAddress = getClientIP(requestHeaders)
    const submittedAt = new Date().toISOString()

    const payload = await getPayload({ config })
    await payload.create({
      collection: 'contact-submissions',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        phone,
        email,
        message,
        inquiryTypes: inquiryTypes.map((label) => ({ label })),
        consentAccepted,
        ipAddress,
        userAgent,
        path,
        submittedAt,
      },
    } as unknown as Parameters<typeof payload.create>[0])

    try {
      await sendContactSubmissionEmails({
        payload,
        data: {
          firstName,
          lastName,
          phone,
          email,
          message,
          inquiryTypes,
          submittedAt,
          path,
        },
      })
    } catch (error) {
      console.error('Failed to send contact submission emails', error)
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Unable to store submission' }, { status: 500 })
  }
}
