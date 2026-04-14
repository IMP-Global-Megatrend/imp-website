/**
 * @jest-environment node
 */

const verifyMock = jest.fn()

jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: verifyMock,
  })),
}))

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@payload-config', () => ({ __esModule: true, default: {} }))

jest.mock('@/utilities/emails/sendFormEmails', () => ({
  sendIncomingResendEmailToAdmins: jest.fn(),
}))

import { getPayload } from 'payload'

import { createPayloadMock, snapshotEnv, textRequest } from '@/test-utils'

describe('POST /api/resend/webhook', () => {
  const envSnap = snapshotEnv(['RESEND_WEBHOOK_SIGNING_SECRET'])

  beforeEach(() => {
    verifyMock.mockReset()
    jest.mocked(getPayload).mockReset()
    process.env.RESEND_WEBHOOK_SIGNING_SECRET = 'whsec_test'
  })

  afterEach(() => {
    envSnap.restore()
  })

  it('returns 500 when signing secret is not configured', async () => {
    Reflect.deleteProperty(process.env, 'RESEND_WEBHOOK_SIGNING_SECRET')

    const { POST } = await import('../route')
    const res = await POST(
      textRequest('http://localhost/api/resend/webhook', '{}', {
        'svix-id': 'id',
        'svix-timestamp': '1',
        'svix-signature': 'sig',
      }),
    )

    expect(res.status).toBe(500)
  })

  it('returns 400 when Svix verification fails', async () => {
    verifyMock.mockImplementation(() => {
      throw new Error('bad sig')
    })

    const { POST } = await import('../route')
    const res = await POST(
      textRequest('http://localhost/api/resend/webhook', '{}', {
        'svix-id': 'id',
        'svix-timestamp': '1',
        'svix-signature': 'sig',
      }),
    )

    expect(res.status).toBe(400)
    expect(jest.mocked(getPayload)).not.toHaveBeenCalled()
  })

  it('returns 200 when event is stored', async () => {
    verifyMock.mockReturnValue({
      type: 'email.sent',
      data: { to: ['a@b.com'], email_id: 'e1' },
    })

    const payload = createPayloadMock({
      find: jest.fn().mockResolvedValue({ docs: [] }),
      create: jest.fn().mockResolvedValue({}),
    })
    jest.mocked(getPayload).mockResolvedValue(payload as never)

    const { POST } = await import('../route')
    const res = await POST(
      textRequest('http://localhost/api/resend/webhook', '{}', {
        'svix-id': 'svix-1',
        'svix-timestamp': '1',
        'svix-signature': 'sig',
      }),
    )

    expect(res.status).toBe(200)
    const json = (await res.json()) as { ok: boolean; duplicate: boolean; persisted: boolean }
    expect(json.ok).toBe(true)
    expect(json.persisted).toBe(true)
  })
})
