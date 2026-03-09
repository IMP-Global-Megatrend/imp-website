import { Resend } from 'resend'

type SyncContactToResendArgs = {
  firstName: string
  lastName: string
  email: string
  inquiryTypes: string[]
}

type SyncNewsletterSubscriberToResendArgs = {
  firstName: string
  lastName: string
  email: string
}

const TOPIC_TO_AUDIENCE_ENV: Record<string, string> = {
  'General Inquiry': 'RESEND_AUDIENCE_ID_GENERAL_INQUIRY',
  'Investment Request': 'RESEND_AUDIENCE_ID_INVESTMENT_REQUEST',
  'Request Factsheet': 'RESEND_AUDIENCE_ID_REQUEST_FACTSHEET',
}

function resolveAudienceIds(inquiryTypes: string[]): string[] {
  const topicAudienceIds = inquiryTypes
    .map((topic) => TOPIC_TO_AUDIENCE_ENV[topic])
    .map((envName) => (envName ? process.env[envName] : undefined))
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.trim())

  if (topicAudienceIds.length > 0) {
    return [...new Set(topicAudienceIds)]
  }

  const fallbackAudienceId = process.env.RESEND_CONTACTS_AUDIENCE_ID?.trim()
  if (!fallbackAudienceId) return []
  return [fallbackAudienceId]
}

function isAlreadyExistsError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const message =
    'message' in error && typeof error.message === 'string' ? error.message.toLowerCase() : ''
  return message.includes('already exists') || message.includes('duplicate')
}

export async function syncContactToResend(args: SyncContactToResendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return

  const audienceIds = resolveAudienceIds(args.inquiryTypes)
  if (audienceIds.length === 0) return

  const resend = new Resend(apiKey)
  await Promise.all(
    audienceIds.map(async (audienceId) => {
      try {
        await resend.contacts.create({
          audienceId,
          email: args.email,
          firstName: args.firstName,
          lastName: args.lastName,
          unsubscribed: false,
        })
      } catch (error) {
        if (isAlreadyExistsError(error)) return
        throw error
      }
    }),
  )
}

export async function syncNewsletterSubscriberToResend(
  args: SyncNewsletterSubscriberToResendArgs,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const audienceId = process.env.RESEND_AUDIENCE_ID_NEWSLETTER_GENERAL?.trim()
  if (!apiKey || !audienceId) return

  const resend = new Resend(apiKey)
  try {
    await resend.contacts.create({
      audienceId,
      email: args.email,
      firstName: args.firstName,
      lastName: args.lastName,
      unsubscribed: false,
    })
  } catch (error) {
    if (isAlreadyExistsError(error)) return
    throw error
  }
}
