import { getArticleCategoryMeta } from '../getArticleCategoryLinks'

describe('getArticleCategoryMeta', () => {
  it('returns an empty array for missing or non-array input', () => {
    expect(getArticleCategoryMeta(undefined)).toEqual([])
    expect(getArticleCategoryMeta(null as unknown as undefined)).toEqual([])
    expect(getArticleCategoryMeta('x' as unknown as [])).toEqual([])
  })

  it('maps populated category objects to title and slug', () => {
    expect(
      getArticleCategoryMeta([
        { title: '  Climate  ', slug: 'climate' },
        { title: 'Tech', slug: '  tech  ' },
      ] as never),
    ).toEqual([
      { title: 'Climate', slug: 'climate' },
      { title: 'Tech', slug: 'tech' },
    ])
  })

  it('derives slug from title with toKebabCase when slug is empty', () => {
    expect(getArticleCategoryMeta([{ title: 'Green Energy', slug: '' }] as never)).toEqual([
      { title: 'Green Energy', slug: 'green-energy' },
    ])
  })

  it('drops entries without a usable title', () => {
    expect(
      getArticleCategoryMeta([
        { title: '', slug: 'x' },
        { title: '  ', slug: 'y' },
        { title: 'Ok', slug: 'ok' },
      ] as never),
    ).toEqual([{ title: 'Ok', slug: 'ok' }])
  })
})
