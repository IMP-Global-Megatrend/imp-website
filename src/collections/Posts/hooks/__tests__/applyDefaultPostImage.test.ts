/**
 * @jest-environment node
 */

import { applyDefaultPostImage } from '../applyDefaultPostImage'

describe('applyDefaultPostImage', () => {
  it('returns data unchanged when hero and meta image already set', async () => {
    const data = {
      heroImage: 1,
      meta: { image: 2 },
    }
    const payload = { find: jest.fn() }

    const result = await applyDefaultPostImage({
      data,
      originalDoc: {},
      req: { payload } as never,
    } as never)

    expect(result).toEqual(data)
    expect(payload.find).not.toHaveBeenCalled()
  })

  it('fills missing hero/meta from latest published post', async () => {
    const payload = {
      find: jest.fn().mockResolvedValue({
        docs: [
          { id: 99, heroImage: 42, meta: {} },
        ],
      }),
    }

    const data = { title: 'New' }
    const result = (await applyDefaultPostImage({
      data,
      originalDoc: { id: 1 },
      req: { payload } as never,
    } as never)) as { heroImage?: number; meta?: { image?: number } }

    expect(payload.find).toHaveBeenCalled()
    expect(result.heroImage).toBe(42)
    expect(result.meta?.image).toBeDefined()
  })
})
