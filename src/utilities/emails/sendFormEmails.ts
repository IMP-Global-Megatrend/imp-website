import type { Payload } from 'payload'

import {
  createContactAdminTemplate,
  createContactSenderTemplate,
  createNewsletterAdminTemplate,
  createNewsletterSubscriberTemplate,
} from './templates'

const ADMIN_RECIPIENTS = ['sw@mrbpartner.ch', 'kbw@mrbpartner.ch', 'sylvestre.lucia@gmail.com'] as const
const EMAIL_RETRY_COUNT = 3
const EMAIL_RETRY_BASE_DELAY_MS = 650

type ContactEmailPayload = {
  firstName: string
  lastName: string
  phone?: string
  email: string
  message: string
  inquiryTypes: string[]
  submittedAt: string
  path: string
}

type NewsletterEmailPayload = {
  firstName: string
  lastName: string
  email: string
  submittedAt: string
  path: string
}

type SendEmailsArgs<TData> = {
  payload: Payload
  data: TData
}

type SendEmailInput = Parameters<Payload['sendEmail']>[0]

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const maybeStatus = (error as { status?: unknown }).status
  const maybeMessage = (error as { message?: unknown }).message

  if (maybeStatus === 429) return true
  if (typeof maybeMessage !== 'string') return false

  return maybeMessage.includes('rate_limit_exceeded') || maybeMessage.includes('Too many requests')
}

async function sendEmailWithRetry({
  payload,
  email,
  context,
}: {
  payload: Payload
  email: SendEmailInput
  context: string
}): Promise<void> {
  let attempt = 0

  while (true) {
    try {
      await payload.sendEmail(email)
      return
    } catch (error) {
      if (!isRateLimitError(error) || attempt >= EMAIL_RETRY_COUNT) {
        throw error
      }

      const delayMs = EMAIL_RETRY_BASE_DELAY_MS * (attempt + 1)
      payload.logger.warn({ attempt: attempt + 1, delayMs, context }, 'Email rate limit reached, retrying')
      await sleep(delayMs)
      attempt += 1
    }
  }
}

export async function sendContactSubmissionEmails({
  payload,
  data,
}: SendEmailsArgs<ContactEmailPayload>): Promise<void> {
  const adminTemplate = createContactAdminTemplate(data)
  const senderTemplate = createContactSenderTemplate(data)

  await sendEmailWithRetry({
    payload,
    context: 'contact-sender',
    email: {
      to: data.email,
      subject: senderTemplate.subject,
      text: senderTemplate.text,
      html: senderTemplate.html,
    },
  })

  try {
    await sendEmailWithRetry({
      payload,
      context: 'contact-admin',
      email: {
        to: [...ADMIN_RECIPIENTS],
        subject: adminTemplate.subject,
        text: adminTemplate.text,
        html: adminTemplate.html,
      },
    })
  } catch (error) {
    payload.logger.error(
      {
        error,
        recipientCount: ADMIN_RECIPIENTS.length,
      },
      'Failed to send contact admin notification email',
    )
  }
}

export async function sendNewsletterSubscriptionEmails({
  payload,
  data,
}: SendEmailsArgs<NewsletterEmailPayload>): Promise<void> {
  const adminTemplate = createNewsletterAdminTemplate(data)
  const subscriberTemplate = createNewsletterSubscriberTemplate(data)

  await sendEmailWithRetry({
    payload,
    context: 'newsletter-subscriber',
    email: {
      to: data.email,
      subject: subscriberTemplate.subject,
      text: subscriberTemplate.text,
      html: subscriberTemplate.html,
    },
  })

  try {
    await sendEmailWithRetry({
      payload,
      context: 'newsletter-admin',
      email: {
        to: [...ADMIN_RECIPIENTS],
        subject: adminTemplate.subject,
        text: adminTemplate.text,
        html: adminTemplate.html,
      },
    })
  } catch (error) {
    payload.logger.error(
      {
        error,
        recipientCount: ADMIN_RECIPIENTS.length,
      },
      'Failed to send newsletter admin notification email',
    )
  }
}
