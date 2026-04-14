/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers()),
}))

jest.mock('@/utilities/emails/sendFormEmails', () => ({
  sendNewsletterSubscriptionEmails: jest.fn(),
}))

jest.mock('@/utilities/emails/syncContactToResend', () => ({
  syncNewsletterSubscriberToResend: jest.fn(),
}))

import { getPayload } from 'payload'

import { jsonRequest } from '@/test-utils'

describe('POST /api/newsletter-subscription', () => {
  it('returns 400 and does not touch Payload when validation fails', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/newsletter-subscription', {
        firstName: '',
        lastName: 'Doe',
        email: 'not-an-email',
        consentAccepted: true,
      }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })
})
