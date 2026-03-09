type ContactTemplateData = {
  firstName: string
  lastName: string
  phone?: string
  email: string
  message: string
  inquiryTypes: string[]
  submittedAt: string
  path: string
}

type NewsletterTemplateData = {
  firstName: string
  lastName: string
  email: string
  submittedAt: string
  path: string
}

type EmailTemplate = {
  subject: string
  text: string
  html: string
}

const BRAND_NAME = 'IMP Website'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function renderLayout(title: string, bodyHtml: string): string {
  return `
  <div style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;color:#111827;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:#111827;padding:24px 28px;">
                <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;">${BRAND_NAME}</p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 12px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 24px;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">This is an automated message from ${BRAND_NAME}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `.trim()
}

function detailRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 12px;width:35%;vertical-align:top;border-bottom:1px solid #e5e7eb;font-weight:600;color:#111827;">${escapeHtml(label)}</td>
    <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#374151;">${escapeHtml(value)}</td>
  </tr>
  `.trim()
}

export function createContactAdminTemplate(data: ContactTemplateData): EmailTemplate {
  const inquiryTypes = data.inquiryTypes.length > 0 ? data.inquiryTypes.join(', ') : 'N/A'
  const submittedAt = formatDate(data.submittedAt)
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const phone = data.phone?.trim() || 'N/A'

  const html = renderLayout(
    'New contact form submission',
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">A new contact request has been submitted on the website.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;border-spacing:0;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Phone', phone)}
      ${detailRow('Inquiry Types', inquiryTypes)}
      ${detailRow('Submitted At', submittedAt)}
      ${detailRow('Path', data.path)}
      ${detailRow('Message', data.message)}
    </table>
    `,
  )

  const text = [
    'New contact form submission',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Phone: ${phone}`,
    `Inquiry Types: ${inquiryTypes}`,
    `Submitted At: ${submittedAt}`,
    `Path: ${data.path}`,
    `Message: ${data.message}`,
  ].join('\n')

  return {
    subject: `New contact form submission - ${fullName}`,
    text,
    html,
  }
}

export function createContactSenderTemplate(data: ContactTemplateData): EmailTemplate {
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  const html = renderLayout(
    'We received your message',
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Hi ${escapeHtml(data.firstName)}, thank you for contacting us. This is a copy of your submission.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;border-spacing:0;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Message', data.message)}
    </table>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#374151;">Our team will review your request and get back to you shortly.</p>
    `,
  )

  const text = [
    'We received your message',
    '',
    `Hi ${data.firstName}, thank you for contacting us.`,
    'This is a copy of your submission:',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Message: ${data.message}`,
    '',
    'Our team will review your request and get back to you shortly.',
  ].join('\n')

  return {
    subject: 'We received your contact request',
    text,
    html,
  }
}

export function createNewsletterAdminTemplate(data: NewsletterTemplateData): EmailTemplate {
  const submittedAt = formatDate(data.submittedAt)
  const fullName = `${data.firstName} ${data.lastName}`.trim()

  const html = renderLayout(
    'New newsletter subscription',
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">A new user subscribed to the newsletter.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:8px;border-collapse:separate;border-spacing:0;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Submitted At', submittedAt)}
      ${detailRow('Path', data.path)}
    </table>
    `,
  )

  const text = [
    'New newsletter subscription',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Submitted At: ${submittedAt}`,
    `Path: ${data.path}`,
  ].join('\n')

  return {
    subject: `New newsletter subscription - ${fullName}`,
    text,
    html,
  }
}

export function createNewsletterSubscriberTemplate(data: NewsletterTemplateData): EmailTemplate {
  const html = renderLayout(
    'Subscription confirmed',
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">Hi ${escapeHtml(data.firstName)}, thanks for subscribing to our newsletter.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#374151;">We will keep you informed with the latest updates from ${BRAND_NAME}.</p>
    `,
  )

  const text = [
    'Subscription confirmed',
    '',
    `Hi ${data.firstName}, thanks for subscribing to our newsletter.`,
    `We will keep you informed with the latest updates from ${BRAND_NAME}.`,
  ].join('\n')

  return {
    subject: 'Your newsletter subscription is confirmed',
    text,
    html,
  }
}
