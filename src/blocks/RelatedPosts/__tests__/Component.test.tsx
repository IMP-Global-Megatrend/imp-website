jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="rich-text">intro</div>,
}))

jest.mock('@/components/Card', () => ({
  Card: ({ doc }: { doc: { title?: string } }) => <div data-testid="card">{doc.title}</div>,
}))

import { RelatedPosts } from '../Component'
import { render, screen } from '@testing-library/react'

describe('RelatedPosts', () => {
  it('renders intro and cards for post docs', () => {
    render(
      <RelatedPosts
        introContent={{} as never}
        docs={[{ id: 1, title: 'Post A' } as never]}
      />,
    )

    expect(screen.getByTestId('rich-text')).toBeInTheDocument()
    expect(screen.getByTestId('card')).toHaveTextContent('Post A')
  })
})
