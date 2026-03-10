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

type IncomingResendEmailPayload = {
  eventType: string
  from?: string
  to: string[]
  subject?: string
  text?: string
  html?: string
  emailId?: string
  messageId?: string
  receivedAt: string
}

type SendEmailsArgs<TData> = {
  payload: Payload
  data: TData
}

type SendEmailInput = Parameters<Payload['sendEmail']>[0]

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

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

export async function sendIncomingResendEmailToAdmins({
  payload,
  data,
}: SendEmailsArgs<IncomingResendEmailPayload>): Promise<void> {
  const normalizedSubject = data.subject?.trim() || '(no subject)'
  const from = data.from?.trim() || '(unknown sender)'
  const toList = data.to.length > 0 ? data.to.join(', ') : '(unknown recipients)'
  const textContent = data.text?.trim() || ''
  const htmlContent = data.html?.trim() || ''
  const hasBodyContent = Boolean(textContent || htmlContent)

  const subject = `Incoming email received - ${normalizedSubject}`
  const text = [
    'A new incoming email was received via Resend webhook.',
    '',
    `Event Type: ${data.eventType}`,
    `From: ${from}`,
    `To: ${toList}`,
    `Subject: ${normalizedSubject}`,
    `Email ID: ${data.emailId || 'N/A'}`,
    `Message ID: ${data.messageId || 'N/A'}`,
    `Received At: ${data.receivedAt}`,
    '',
    hasBodyContent ? '' : 'Note: This webhook payload did not include email body content (text/html).',
    hasBodyContent ? '' : '',
    'Message (text):',
    textContent || '(No text content provided)',
  ]
    .filter((line, index, array) => !(line === '' && array[index - 1] === ''))
    .join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;color:#111827;line-height:1.5;">
      <p style="margin:0 0 12px;">A new incoming email was received via Resend webhook.</p>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:14px;">
        <tr><td style="padding:4px 0;"><strong>Event Type:</strong> ${escapeHtml(data.eventType)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>From:</strong> ${escapeHtml(from)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>To:</strong> ${escapeHtml(toList)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Subject:</strong> ${escapeHtml(normalizedSubject)}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email ID:</strong> ${escapeHtml(data.emailId || 'N/A')}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Message ID:</strong> ${escapeHtml(data.messageId || 'N/A')}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Received At:</strong> ${escapeHtml(data.receivedAt)}</td></tr>
      </table>
      ${
        hasBodyContent
          ? ''
          : '<p style="margin:0 0 12px;font-size:12px;color:#6b7280;">Note: This webhook payload did not include email body content (text/html).</p>'
      }
      ${
        htmlContent
          ? `<div style="margin:0 0 14px;"><strong>Message (HTML):</strong></div><div>${htmlContent}</div>`
          : ''
      }
      <div style="margin:14px 0 8px;"><strong>Message (text):</strong></div>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#f8fafc;padding:10px;border:1px solid #e5e7eb;border-radius:6px;margin:0;">${escapeHtml(
        textContent || '(No text content provided)',
      )}</pre>
    </div>
  `.trim()

  await sendEmailWithRetry({
    payload,
    context: 'resend-inbound-admin',
    email: {
      to: [...ADMIN_RECIPIENTS],
      subject,
      text,
      html,
    },
  })
}
