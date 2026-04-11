import { getMediaUrl } from '../getMediaUrl'

describe('getMediaUrl', () => {
  it('returns empty string for nullish URLs', () => {
    expect(getMediaUrl(null)).toBe('')
    expect(getMediaUrl(undefined)).toBe('')
    expect(getMediaUrl('')).toBe('')
  })

  it('returns relative paths unchanged even with a cache tag', () => {
    expect(getMediaUrl('/media/foo.jpg', 'v1')).toBe('/media/foo.jpg')
  })

  it('returns absolute URLs unchanged when no cache tag', () => {
    expect(getMediaUrl('https://cdn.example.com/a.png')).toBe('https://cdn.example.com/a.png')
  })

  it('appends cache tag as first query param', () => {
    expect(getMediaUrl('https://cdn.example.com/a.png', 'tag a')).toBe(
      'https://cdn.example.com/a.png?tag%20a',
    )
  })

  it('appends cache tag with & when URL already has query', () => {
    expect(getMediaUrl('https://cdn.example.com/a.png?w=100', 'v2')).toBe(
      'https://cdn.example.com/a.png?w=100&v2',
    )
  })
})
