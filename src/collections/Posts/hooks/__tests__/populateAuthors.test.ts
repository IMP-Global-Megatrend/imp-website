/**
 * @jest-environment node
 */

import { populateAuthors } from '../populateAuthors'

describe('populateAuthors', () => {
  it('returns doc unchanged when there are no authors', async () => {
    const doc = { slug: 'x' }
    const payload = { findByID: jest.fn() }

    const out = await populateAuthors({
      doc,
      req: { payload } as never,
    } as never)

    expect(out).toBe(doc)
    expect(payload.findByID).not.toHaveBeenCalled()
  })

  it('populates author names from the users collection', async () => {
    const doc = { authors: [7] }
    const payload = {
      findByID: jest.fn().mockResolvedValue({ id: 7, name: 'Ada' }),
    }

    const out = await populateAuthors({
      doc,
      req: { payload } as never,
    } as never)

    expect(payload.findByID).toHaveBeenCalledWith(
      expect.objectContaining({ id: 7, collection: 'users' }),
    )
    expect((out as { populatedAuthors?: Array<{ name: string }> }).populatedAuthors?.[0]?.name).toBe(
      'Ada',
    )
  })
})
