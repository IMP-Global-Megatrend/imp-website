jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="rich-text">cta</div>,
}))

jest.mock('@/components/Link', () => ({
  CMSLink: ({ label }: { label?: string }) => <a data-testid="cms-link">{label}</a>,
}))

import { CallToActionBlock } from './Component'
import { render, screen } from '@testing-library/react'

describe('CallToActionBlock', () => {
  it('renders rich text and links', () => {
    render(
      <CallToActionBlock
        blockName={null}
        blockType="cta"
        richText={{} as never}
        links={[{ link: { type: 'custom', label: 'Go', url: '/x' } } as never]}
      />,
    )

    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
    expect(screen.getByTestId('cms-link')).toHaveTextContent('Go')
  })
})
