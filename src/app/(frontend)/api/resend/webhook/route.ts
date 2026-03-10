import { Webhook } from 'svix'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendIncomingResendEmailToAdmins } from '@/utilities/emails/sendFormEmails'

type ResendWebhookEvent = {
  type?: string
  created_at?: string
  data?: {
    created_at?: string
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
    text?: string
    html?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

type ResendWebhookEventDocData = {
  eventType: string
  webhookCreatedAt?: string
  emailId?: string
  from?: string
  to: Array<{ address: string }>
  subject?: string
  svixId: string
  payload: ResendWebhookEvent
  receivedAt: string
}

function getRequiredHeader(req: Request, name: string): string {
  const value = req.headers.get(name)
  if (!value) {
    throw new Error(`Missing header: ${name}`)
  }
  return value
}

function firstString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function normalizeRecipients(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function shouldForwardInboundEmail(eventType: string): boolean {
  return eventType === 'email.received'
}

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const message =
    'message' in error && typeof error.message === 'string' ? error.message.toLowerCase() : ''

  return message.includes('duplicate') || message.includes('unique') || message.includes('svixid')
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SIGNING_SECRET

  if (!secret) {
    console.error('RESEND_WEBHOOK_SIGNING_SECRET is not configured')
    return Response.json({ error: 'Webhook secret is not configured' }, { status: 500 })
  }

  const payload = await req.text()

  let svixId = ''
  let event: ResendWebhookEvent
  try {
    svixId = getRequiredHeader(req, 'svix-id')
    const webhook = new Webhook(secret)
    event = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': getRequiredHeader(req, 'svix-timestamp'),
      'svix-signature': getRequiredHeader(req, 'svix-signature'),
    }) as ResendWebhookEvent
  } catch (error) {
    console.error('Invalid Resend webhook signature or payload', error)
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  try {
    const payloadClient = await getPayload({ config })

    const existing = await payloadClient.find({
      collection: 'resend-webhook-events',
      where: {
        svixId: {
          equals: svixId,
        },
      },
      limit: 1,
      overrideAccess: true,
      pagination: false,
    } as unknown as Parameters<typeof payloadClient.find>[0])

    if (existing.docs.length > 0) {
      return Response.json({ ok: true, duplicate: true })
    }

    const record: ResendWebhookEventDocData = {
      eventType: firstString(event.type) || 'unknown',
      webhookCreatedAt: firstString(event.created_at) ?? firstString(event.data?.created_at),
      emailId: firstString(event.data?.email_id),
      from: firstString(event.data?.from),
      to: normalizeRecipients(event.data?.to).map((address) => ({ address })),
      subject: firstString(event.data?.subject),
      svixId,
      payload: event,
      receivedAt: new Date().toISOString(),
    }

    await payloadClient.create({
      collection: 'resend-webhook-events',
      overrideAccess: true,
      data: record,
    } as unknown as Parameters<typeof payloadClient.create>[0])

    if (shouldForwardInboundEmail(record.eventType)) {
      try {
        await sendIncomingResendEmailToAdmins({
          payload: payloadClient,
          data: {
            eventType: record.eventType,
            from: record.from,
            to: record.to.map((entry) => entry.address),
            subject: record.subject,
            text: firstString(event.data?.text),
            html: firstString(event.data?.html),
            emailId: record.emailId,
            receivedAt: record.receivedAt,
          },
        })
      } catch (error) {
        console.error('Failed to forward incoming Resend webhook email to admins', error)
      }
    }

    // Keep this log concise: useful for tracing delivery failures and bounces.
    console.log('Resend webhook event stored', {
      type: record.eventType,
      emailId: record.emailId ?? null,
      svixId,
      to: record.to.map((entry) => entry.address),
      subject: record.subject ?? null,
    })

    return Response.json({ ok: true })
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ ok: true, duplicate: true })
    }

    console.error('Unable to store Resend webhook event', error)
    return Response.json({ error: 'Unable to store webhook event' }, { status: 500 })
  }
}
