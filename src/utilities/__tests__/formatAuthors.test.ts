import type { Post } from '@/payload-types'
import { formatAuthors } from '../formatAuthors'

type Author = NonNullable<NonNullable<Post['populatedAuthors']>[number]>

const author = (name: string): Author => ({ name } as Author)

describe('formatAuthors', () => {
  it('returns empty string when no usable names', () => {
    expect(formatAuthors([])).toBe('')
    expect(formatAuthors([author('')])).toBe('')
  })

  it('formats one, two, and many authors', () => {
    expect(formatAuthors([author('Ada')])).toBe('Ada')
    expect(formatAuthors([author('Ada'), author('Grace')])).toBe('Ada and Grace')
    expect(formatAuthors([author('Ada'), author('Grace'), author('Alan')])).toBe('Ada, Grace and Alan')
  })
})
