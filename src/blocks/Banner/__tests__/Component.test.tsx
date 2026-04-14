jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="rich-text">rich</div>,
}))

import { BannerBlock } from '../Component'
import { render, screen } from '@testing-library/react'

describe('BannerBlock', () => {
  it('renders rich text inside a styled container', () => {
    render(
      <BannerBlock
        blockName={null}
        blockType="banner"
        content={{} as never}
        style="info"
      />,
    )

    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
  })
})
