/**
 * @jest-environment node
 */

jest.mock('payload', () => ({
  slugField: () => ({ name: 'slug', type: 'text', admin: {} }),
}))

jest.mock('@payloadcms/richtext-lexical', () => {
  const lexicalEditor = () => ({})
  const feature = () => ({})
  return {
    lexicalEditor,
    BlocksFeature: feature,
    FixedToolbarFeature: feature,
    HeadingFeature: feature,
    HorizontalRuleFeature: feature,
    InlineToolbarFeature: feature,
    OrderedListFeature: feature,
    UnorderedListFeature: feature,
  }
})

jest.mock('@payloadcms/plugin-seo/fields', () => {
  const field = () => ({})
  return {
    MetaDescriptionField: field,
    MetaImageField: field,
    MetaTitleField: field,
    OverviewField: field,
    PreviewField: field,
  }
})

jest.mock('@/blocks/Banner/config', () => ({ Banner: {} }))
jest.mock('@/blocks/Code/config', () => ({ Code: {} }))
jest.mock('@/blocks/MediaBlock/config', () => ({ MediaBlock: {} }))
jest.mock('@/utilities/generatePreviewPath', () => ({
  generatePreviewPath: jest.fn(() => '/preview'),
}))

import { Posts } from '../index'

describe('Posts collection config', () => {
  it('exposes expected slug and access', () => {
    expect(Posts.slug).toBe('posts')
    expect(Posts.access?.create).toBeDefined()
    expect(Posts.access?.read).toBeDefined()
    expect(Posts.fields?.length).toBeGreaterThan(0)
  })
})
