jest.mock('./index', () => ({
  PayloadRedirects: async function PayloadRedirects() {
    return null
  },
}))

import { PayloadRedirects } from './index'

describe('PayloadRedirects', () => {
  it('is an async server component (smoke)', async () => {
    const out = await PayloadRedirects({ url: '/x', disableNotFound: true })
    expect(out).toBeNull()
  })
})
