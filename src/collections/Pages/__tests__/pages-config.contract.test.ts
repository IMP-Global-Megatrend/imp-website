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
    FixedToolbarFeature: feature,
    HeadingFeature: feature,
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

jest.mock('@/blocks/ArchiveBlock/config', () => ({ Archive: {} }))
jest.mock('@/blocks/CallToAction/config', () => ({ CallToAction: {} }))
jest.mock('@/blocks/Content/config', () => ({ Content: {} }))
jest.mock('@/blocks/Form/config', () => ({ FormBlock: {} }))
jest.mock('@/blocks/MediaBlock/config', () => ({ MediaBlock: {} }))
jest.mock('@/heros/config', () => ({ hero: {} }))
jest.mock('@/hooks/populatePublishedAt', () => ({
  populatePublishedAt: jest.fn(),
}))
jest.mock('@/utilities/generatePreviewPath', () => ({
  generatePreviewPath: jest.fn(() => '/preview'),
}))

import { Pages } from '../index'

describe('Pages collection config', () => {
  it('exposes expected slug and access', () => {
    expect(Pages.slug).toBe('pages')
    expect(Pages.access?.create).toBeDefined()
    expect(Pages.access?.read).toBeDefined()
    expect(Pages.fields?.length).toBeGreaterThan(0)
  })
})
