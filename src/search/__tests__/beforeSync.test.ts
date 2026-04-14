import { beforeSyncWithSearch } from '../beforeSync'

describe('beforeSyncWithSearch', () => {
  it('merges meta title from original doc', async () => {
    const result = await beforeSyncWithSearch({
      payload: {} as never,
      req: { payload: { findByID: jest.fn() } } as never,
      originalDoc: {
        id: 1,
        slug: 'hello',
        title: 'Hello',
        meta: { description: 'd' },
        categories: [],
      },
      searchDoc: {
        doc: { relationTo: 'posts', value: '1' },
        title: '',
      } as never,
    })

    expect(result.slug).toBe('hello')
    expect(result.meta?.title).toBe('Hello')
  })

  it('loads category titles when categories are ids', async () => {
    const findByID = jest.fn().mockResolvedValue({ id: 'c1', title: 'Tech' })

    const result = await beforeSyncWithSearch({
      payload: {} as never,
      req: { payload: { findByID } } as never,
      originalDoc: {
        id: 1,
        slug: 'p',
        title: 'Post',
        categories: ['c1'],
      },
      searchDoc: {
        doc: { relationTo: 'posts', value: '1' },
        title: '',
      } as never,
    })

    expect(findByID).toHaveBeenCalled()
    expect(result.categories?.[0]).toEqual(
      expect.objectContaining({ title: 'Tech', categoryID: 'c1' }),
    )
  })
})
