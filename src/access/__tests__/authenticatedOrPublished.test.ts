import { authenticatedOrPublished } from '../authenticatedOrPublished'

describe('authenticatedOrPublished', () => {
  it('allows full access when a user is authenticated', () => {
    expect(authenticatedOrPublished({ req: { user: { id: '1' } } } as never)).toBe(true)
  })

  it('restricts to published documents when unauthenticated', () => {
    expect(authenticatedOrPublished({ req: { user: null } } as never)).toEqual({
      _status: {
        equals: 'published',
      },
    })
  })
})
