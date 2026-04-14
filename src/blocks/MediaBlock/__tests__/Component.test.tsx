jest.mock('@/components/Media', () => ({
  Media: ({ resource }: { resource?: { caption?: unknown } }) => (
    <div data-testid="media">{resource ? 'has-resource' : 'no-resource'}</div>
  ),
}))

jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="caption-rt">caption</div>,
}))

import { MediaBlock } from '../Component'
import { render, screen } from '@testing-library/react'

describe('MediaBlock', () => {
  it('renders Media when media object is provided', () => {
    render(
      <MediaBlock
        blockName={null}
        blockType="mediaBlock"
        media={
          {
            id: 1,
            caption: {},
          } as never
        }
      />,
    )

    expect(screen.getByTestId('media')).toHaveTextContent('has-resource')
    expect(screen.getByTestId('caption-rt')).toBeInTheDocument()
  })
})
