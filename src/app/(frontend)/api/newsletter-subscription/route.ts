import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { sendNewsletterSubscriptionEmails } from '@/utilities/emails/sendFormEmails'
import { syncNewsletterSubscriberToResend } from '@/utilities/emails/syncContactToResend'

type SubmissionBody = {
  firstName?: string
  lastName?: string
  email?: string
  consentAccepted?: boolean
  path?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
    const email = body.email?.trim().toLowerCase() || ''
    const consentAccepted = body.consentAccepted === true
    const path = body.path?.trim() || '/newsletter-subscription'

    if (!firstName || !lastName || !EMAIL_REGEX.test(email) || !consentAccepted) {
      return Response.json({ error: 'Missing or invalid required fields' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const existing = await payload.find({
      collection: 'newsletter-subscriptions',
      where: {
        email: {
          equals: email,
        },
      },
      limit: 1,
      overrideAccess: true,
      pagination: false,
    } as unknown as Parameters<typeof payload.find>[0])

    if (existing.docs.length > 0) {
      return Response.json({ ok: true, alreadySubscribed: true })
    }

    const requestHeaders = await headers()
    const userAgent = requestHeaders.get('user-agent') || 'unknown'
    const ipAddress = getClientIP(requestHeaders)
    const submittedAt = new Date().toISOString()

    await payload.create({
      collection: 'newsletter-subscriptions',
      overrideAccess: true,
      data: {
        firstName,
        lastName,
        email,
        consentAccepted,
        ipAddress,
        userAgent,
        path,
        submittedAt,
      },
    } as unknown as Parameters<typeof payload.create>[0])

    try {
      await syncNewsletterSubscriberToResend({
        firstName,
        lastName,
        email,
      })
    } catch (error) {
      console.error('Failed to sync newsletter subscriber to Resend', error)
    }

    try {
      await sendNewsletterSubscriptionEmails({
        payload,
        data: {
          firstName,
          lastName,
          email,
          submittedAt,
          path,
        },
      })
    } catch (error) {
      console.error('Failed to send newsletter subscription emails', error)
    }

    return Response.json({ ok: true, alreadySubscribed: false })
  } catch {
    return Response.json({ error: 'Unable to store submission' }, { status: 500 })
  }
}
