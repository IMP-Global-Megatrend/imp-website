jest.mock('@/blocks/Banner/Component', () => ({
  BannerBlock: () => null,
}))

jest.mock('@/blocks/Code/Component', () => ({
  CodeBlock: () => null,
}))

jest.mock('@/blocks/CallToAction/Component', () => ({
  CallToActionBlock: () => null,
}))

jest.mock('@/blocks/MediaBlock/Component', () => ({
  MediaBlock: () => null,
}))

jest.mock('@payloadcms/richtext-lexical/react', () => ({
  LinkJSXConverter: () => ({}),
  RichText: ({
    className,
    ...rest
  }: {
    className?: string
    [key: string]: unknown
  }) => (
    <div data-testid="lexical-rich-text" className={className} data-keys={Object.keys(rest).join(',')} />
  ),
}))

import RichText from './index'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { render, screen } from '@testing-library/react'

const minimalDoc = {
  root: {
    type: 'root',
    children: [],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
} as unknown as DefaultTypedEditorState

describe('RichText', () => {
  it('renders the lexical RichText shell with payload-richtext class', () => {
    render(<RichText data={minimalDoc} />)
    const shell = screen.getByTestId('lexical-rich-text')
    expect(shell.className).toContain('payload-richtext')
    expect(shell.className).toContain('container')
    expect(shell.className).toContain('prose')
  })

  it('drops container and prose when gutter and prose are disabled', () => {
    render(<RichText data={minimalDoc} enableGutter={false} enableProse={false} />)
    const shell = screen.getByTestId('lexical-rich-text')
    expect(shell.className).toContain('max-w-none')
    expect(shell.className).not.toContain('container')
    expect(shell.className).not.toContain('prose')
  })

  it('merges an extra className', () => {
    render(<RichText data={minimalDoc} className="extra-class" />)
    expect(screen.getByTestId('lexical-rich-text').className).toContain('extra-class')
  })
})
