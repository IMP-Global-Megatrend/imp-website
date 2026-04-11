import { authenticated } from '../authenticated'
import { anyone } from '../anyone'

describe('anyone', () => {
  it('always allows access', () => {
    expect(anyone({ req: {} } as never)).toBe(true)
  })
})

describe('authenticated', () => {
  it('returns false when there is no user', () => {
    expect(authenticated({ req: { user: null } } as never)).toBe(false)
    expect(authenticated({ req: {} } as never)).toBe(false)
  })

  it('returns true when a user is present', () => {
    expect(authenticated({ req: { user: { id: '1' } } } as never)).toBe(true)
  })
})
