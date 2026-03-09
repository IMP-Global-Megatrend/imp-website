import type { Payload } from 'payload'

import {
  createContactAdminTemplate,
  createContactSenderTemplate,
  createNewsletterAdminTemplate,
  createNewsletterSubscriberTemplate,
} from './templates'

const ADMIN_RECIPIENTS = ['sw@mrbpartner.ch', 'kbw@mrbpartner.ch', 'sylvestre.lucia@gmail.com'] as const

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

export async function sendContactSubmissionEmails({
  payload,
  data,
}: SendEmailsArgs<ContactEmailPayload>): Promise<void> {
  const adminTemplate = createContactAdminTemplate(data)
  const senderTemplate = createContactSenderTemplate(data)

  await Promise.all([
    payload.sendEmail({
      to: [...ADMIN_RECIPIENTS],
      subject: adminTemplate.subject,
      text: adminTemplate.text,
      html: adminTemplate.html,
    }),
    payload.sendEmail({
      to: data.email,
      subject: senderTemplate.subject,
      text: senderTemplate.text,
      html: senderTemplate.html,
    }),
  ])
}

export async function sendNewsletterSubscriptionEmails({
  payload,
  data,
}: SendEmailsArgs<NewsletterEmailPayload>): Promise<void> {
  const adminTemplate = createNewsletterAdminTemplate(data)
  const subscriberTemplate = createNewsletterSubscriberTemplate(data)

  await Promise.all([
    payload.sendEmail({
      to: [...ADMIN_RECIPIENTS],
      subject: adminTemplate.subject,
      text: adminTemplate.text,
      html: adminTemplate.html,
    }),
    payload.sendEmail({
      to: data.email,
      subject: subscriberTemplate.subject,
      text: subscriberTemplate.text,
      html: subscriberTemplate.html,
    }),
  ])
}
