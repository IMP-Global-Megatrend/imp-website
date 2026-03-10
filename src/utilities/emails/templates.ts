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
const EMAIL_TITLE = 'IMP Global Megatrend Umbrella Fund'
const REGULATORY_NOTICE_HEADING = 'Regulatory Notice'
const REGULATORY_NOTICE_BODY =
  'Portfolio management of the IMP Global Megatrend Umbrella Fund is entrusted to MRB Fund Partners AG. In this document and all related marketing materials, the pronouns "we," "us," and "our" refer exclusively to MRB Fund Partners AG in relation to any investment decisions and regulated portfolio-management activities.'
const COPYRIGHT_NOTICE = '© 2026 IMP Global Megatrend Umbrella Fund. All rights reserved.'
const EMAIL_LOGO_FALLBACK_PATH = '/email-logo.png'
const SUPABASE_EMAIL_LOGO_URL =
  'https://yinjxgtldfrsyhrhqfjv.supabase.co/storage/v1/object/public/media/email-logo.png'
const EMAIL_COLOR_PAGE_BG = '#ffffff'
const EMAIL_COLOR_CARD_BG = '#ffffff'
const EMAIL_COLOR_HEADER_BG = '#2b3dea'
const EMAIL_COLOR_HEADER_BORDER = '#4b67ea'
const EMAIL_COLOR_TEXT_PRIMARY = '#0d1026'
const EMAIL_COLOR_TEXT_MUTED = '#5f6477'
const EMAIL_COLOR_BORDER = '#d9def0'
const EMAIL_COLOR_TABLE_LABEL_BG = '#f6f7fb'

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function getLogoUrl(): string {
  const configuredEmailLogoUrl = process.env.EMAIL_LOGO_URL?.trim()
  if (configuredEmailLogoUrl) return configuredEmailLogoUrl

  if (SUPABASE_EMAIL_LOGO_URL) return SUPABASE_EMAIL_LOGO_URL

  const configuredServerUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (!configuredServerUrl) return EMAIL_LOGO_FALLBACK_PATH

  return `${trimTrailingSlash(configuredServerUrl)}${EMAIL_LOGO_FALLBACK_PATH}`
}

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
  const logoUrl = getLogoUrl()

  return `
  <div style="margin:0;padding:0;background-color:${EMAIL_COLOR_PAGE_BG};font-family:Arial,sans-serif;color:${EMAIL_COLOR_TEXT_PRIMARY};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background-color:${EMAIL_COLOR_CARD_BG};border-radius:12px;overflow:hidden;border:1px solid ${EMAIL_COLOR_BORDER};">
            <tr>
              <td style="background-color:${EMAIL_COLOR_HEADER_BG};padding:24px 28px;border-bottom:2px solid ${EMAIL_COLOR_HEADER_BORDER};">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(EMAIL_TITLE)} logo" width="280" style="display:block;max-width:280px;width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
                    </td>
                  </tr>
                </table>
                <h1 style="margin:16px 0 0;font-size:24px;line-height:1.3;color:#ffffff;font-weight:300;">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 12px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 24px;border-top:1px solid ${EMAIL_COLOR_BORDER};background-color:${EMAIL_COLOR_TABLE_LABEL_BG};">
                <p style="margin:0 0 10px;font-size:12px;line-height:1.5;color:${EMAIL_COLOR_TEXT_MUTED};font-weight:400;">${REGULATORY_NOTICE_HEADING}</p>
                <p style="margin:0 0 10px;font-size:12px;line-height:1.65;color:${EMAIL_COLOR_TEXT_MUTED};">${escapeHtml(REGULATORY_NOTICE_BODY)}</p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:${EMAIL_COLOR_TEXT_MUTED};">${escapeHtml(COPYRIGHT_NOTICE)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `.trim()
}

function detailRow(label: string, value: string, options?: { isLast?: boolean }): string {
  const borderBottom = options?.isLast ? 'none' : `1px solid ${EMAIL_COLOR_BORDER}`

  return `
  <tr>
    <td style="padding:10px 12px;width:35%;vertical-align:top;border-bottom:${borderBottom};font-weight:400;color:${EMAIL_COLOR_TEXT_PRIMARY};background-color:transparent;">${escapeHtml(label)}</td>
    <td style="padding:10px 12px;border-bottom:${borderBottom};color:${EMAIL_COLOR_TEXT_MUTED};background-color:transparent;">${escapeHtml(value)}</td>
  </tr>
  `.trim()
}

function appendRegulatoryNotice(text: string): string {
  return [
    text,
    '',
    REGULATORY_NOTICE_HEADING,
    '',
    REGULATORY_NOTICE_BODY,
    '',
    COPYRIGHT_NOTICE,
  ].join('\n')
}

export function createContactAdminTemplate(data: ContactTemplateData): EmailTemplate {
  const inquiryTypes = data.inquiryTypes.length > 0 ? data.inquiryTypes.join(', ') : 'N/A'
  const submittedAt = formatDate(data.submittedAt)
  const fullName = `${data.firstName} ${data.lastName}`.trim()
  const phone = data.phone?.trim() || 'N/A'

  const html = renderLayout(
    'New contact form submission',
    `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">A new contact request has been submitted on the website.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_COLOR_BORDER};border-radius:8px;border-collapse:separate;border-spacing:0;background-color:transparent;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Phone', phone)}
      ${detailRow('Inquiry Types', inquiryTypes)}
      ${detailRow('Submitted At', submittedAt)}
      ${detailRow('Path', data.path)}
      ${detailRow('Message', data.message, { isLast: true })}
    </table>
    `,
  )

  const text = appendRegulatoryNotice([
    'New contact form submission',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Phone: ${phone}`,
    `Inquiry Types: ${inquiryTypes}`,
    `Submitted At: ${submittedAt}`,
    `Path: ${data.path}`,
    `Message: ${data.message}`,
  ].join('\n'))

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
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">Hi ${escapeHtml(data.firstName)}, thank you for contacting us. This is a copy of your submission.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_COLOR_BORDER};border-radius:8px;border-collapse:separate;border-spacing:0;background-color:transparent;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Message', data.message, { isLast: true })}
    </table>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">Our team will review your request and get back to you shortly.</p>
    `,
  )

  const text = appendRegulatoryNotice([
    'We received your message',
    '',
    `Hi ${data.firstName}, thank you for contacting us.`,
    'This is a copy of your submission:',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Message: ${data.message}`,
    '',
    'Our team will review your request and get back to you shortly.',
  ].join('\n'))

  return {
    subject: 'Copy of your contact form submission',
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
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">A new user subscribed to the newsletter.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${EMAIL_COLOR_BORDER};border-radius:8px;border-collapse:separate;border-spacing:0;background-color:transparent;">
      ${detailRow('Name', fullName)}
      ${detailRow('Email', data.email)}
      ${detailRow('Submitted At', submittedAt)}
      ${detailRow('Path', data.path, { isLast: true })}
    </table>
    `,
  )

  const text = appendRegulatoryNotice([
    'New newsletter subscription',
    '',
    `Name: ${fullName}`,
    `Email: ${data.email}`,
    `Submitted At: ${submittedAt}`,
    `Path: ${data.path}`,
  ].join('\n'))

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
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">Hi ${escapeHtml(data.firstName)}, thanks for subscribing to our newsletter.</p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${EMAIL_COLOR_TEXT_MUTED};">We will keep you informed with the latest updates from ${BRAND_NAME}.</p>
    `,
  )

  const text = appendRegulatoryNotice([
    'Subscription confirmed',
    '',
    `Hi ${data.firstName}, thanks for subscribing to our newsletter.`,
    `We will keep you informed with the latest updates from ${BRAND_NAME}.`,
  ].join('\n'))

  return {
    subject: 'Your newsletter subscription is confirmed',
    text,
    html,
  }
}
