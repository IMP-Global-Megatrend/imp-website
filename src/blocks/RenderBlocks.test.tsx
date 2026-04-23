jest.mock('@/blocks/ArchiveBlock/Component', () => ({
  ArchiveBlock: () => <div data-testid="archive">archive</div>,
}))

jest.mock('@/blocks/CallToAction/Component', () => ({
  CallToActionBlock: () => <div data-testid="cta">cta</div>,
}))

jest.mock('@/blocks/Content/Component', () => ({
  ContentBlock: () => <div data-testid="content">content</div>,
}))

jest.mock('@/blocks/Form/Component', () => ({
  FormBlock: () => <div data-testid="form">form</div>,
}))

jest.mock('@/blocks/MediaBlock/Component', () => ({
  MediaBlock: () => <div data-testid="media">media</div>,
}))

import { RenderBlocks } from './RenderBlocks'
import { render, screen } from '@testing-library/react'

describe('RenderBlocks', () => {
  it('returns null when there are no blocks', () => {
    const { container } = render(<RenderBlocks blocks={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders known block types', () => {
    render(
      <RenderBlocks
        blocks={[
          { blockType: 'content', blockName: null } as never,
          { blockType: 'cta', blockName: null } as never,
        ]}
      />,
    )

    expect(screen.getByTestId('content')).toBeInTheDocument()
    expect(screen.getByTestId('cta')).toBeInTheDocument()
  })
})
