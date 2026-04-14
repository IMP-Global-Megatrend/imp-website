/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('next/headers', () => ({
  headers: jest.fn(async () => new Headers({ 'user-agent': 'jest' })),
}))

jest.mock('@/utilities/emails/sendFormEmails', () => ({
  sendContactSubmissionEmails: jest.fn(),
}))

jest.mock('@/utilities/emails/syncContactToResend', () => ({
  syncContactToResend: jest.fn(),
}))

import { getPayload } from 'payload'

import { createPayloadMock, jsonRequest } from '@/test-utils'

describe('POST /api/contact-us', () => {
  beforeEach(() => {
    jest.mocked(getPayload).mockReset()
  })

  it('returns 400 when required fields are missing', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/contact-us', {
        firstName: 'A',
        lastName: '',
        email: 'a@b.com',
        message: 'Hello',
        consentAccepted: true,
        inquiryTypes: ['General'],
      }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })

  it('returns 400 when phone is invalid', async () => {
    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/contact-us', {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.com',
        phone: 'bad',
        message: 'Hello there',
        consentAccepted: true,
        inquiryTypes: ['General'],
      }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })

  it('returns 429 when a recent submission exists for the same email', async () => {
    const payload = createPayloadMock({
      find: jest.fn().mockResolvedValue({
        docs: [{ id: '1' }],
      }),
    })
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/contact-us', {
        firstName: 'A',
        lastName: 'B',
        email: 'dup@example.com',
        message: 'Hello there',
        consentAccepted: true,
        inquiryTypes: ['General'],
      }),
    )

    expect(res.status).toBe(429)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('returns 200 and creates a submission when valid', async () => {
    const payload = createPayloadMock({
      find: jest.fn().mockResolvedValue({ docs: [] }),
      create: jest.fn().mockResolvedValue({}),
    })
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')

    const res = await POST(
      jsonRequest('http://localhost/api/contact-us', {
        firstName: 'A',
        lastName: 'B',
        email: 'ok@example.com',
        message: 'Hello there',
        consentAccepted: true,
        inquiryTypes: ['General'],
      }),
    )

    expect(res.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'contact-submissions',
        overrideAccess: true,
      }),
    )
  })
})
