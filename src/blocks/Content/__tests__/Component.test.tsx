jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="rich-text">col</div>,
}))

jest.mock('@/components/Link', () => ({
  CMSLink: () => <a data-testid="cms-link">link</a>,
}))

import { ContentBlock } from '../Component'
import { render, screen } from '@testing-library/react'

describe('ContentBlock', () => {
  it('renders columns with rich text', () => {
    render(
      <ContentBlock
        blockName={null}
        blockType="content"
        columns={[
          {
            size: 'full',
            richText: {} as never,
            enableLink: false,
            link: {} as never,
          },
        ]}
      />,
    )

    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })
})
