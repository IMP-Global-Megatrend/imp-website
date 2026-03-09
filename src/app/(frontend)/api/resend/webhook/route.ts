import { Webhook } from 'svix'

type ResendWebhookEvent = {
  type?: string
  created_at?: string
  data?: {
    created_at?: string
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

function getRequiredHeader(req: Request, name: string): string {
  const value = req.headers.get(name)
  if (!value) {
    throw new Error(`Missing header: ${name}`)
  }
  return value
}

export async function POST(req: Request): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SIGNING_SECRET

  if (!secret) {
    console.error('RESEND_WEBHOOK_SIGNING_SECRET is not configured')
    return Response.json({ error: 'Webhook secret is not configured' }, { status: 500 })
  }

  const payload = await req.text()

  try {
    const webhook = new Webhook(secret)
    const event = webhook.verify(payload, {
      'svix-id': getRequiredHeader(req, 'svix-id'),
      'svix-timestamp': getRequiredHeader(req, 'svix-timestamp'),
      'svix-signature': getRequiredHeader(req, 'svix-signature'),
    }) as ResendWebhookEvent

    // Keep this log concise: useful for tracing delivery failures and bounces.
    console.log('Resend webhook event received', {
      type: event.type ?? 'unknown',
      createdAt: event.created_at ?? event.data?.created_at ?? null,
      emailId: event.data?.email_id ?? null,
      to: event.data?.to ?? [],
      subject: event.data?.subject ?? null,
    })

    return Response.json({ ok: true })
  } catch (error) {
    console.error('Invalid Resend webhook signature or payload', error)
    return Response.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }
}
