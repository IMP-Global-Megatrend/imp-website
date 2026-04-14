/**
 * @jest-environment node
 */

jest.mock('@payloadcms/richtext-lexical', () => {
  const lexicalEditor = () => ({})
  const feature = () => ({})
  return {
    lexicalEditor,
    FixedToolbarFeature: feature,
    InlineToolbarFeature: feature,
    OrderedListFeature: feature,
    UnorderedListFeature: feature,
  }
})

import { Media } from '../Media'

describe('Media collection', () => {
  it('defines slug, access, and fields', () => {
    expect(Media.slug).toBe('media')
    expect(Media.access).toBeDefined()
    expect(Media.fields?.length).toBeGreaterThan(0)
  })
})
