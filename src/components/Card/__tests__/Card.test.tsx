jest.mock('@/utilities/useClickableCard', () => ({
  __esModule: true,
  default: () => ({
    card: { ref: jest.fn() },
    link: { href: '/posts/hello', newTab: false },
  }),
}))

jest.mock('@/components/Media', () => ({
  Media: () => <div data-testid="card-media" />,
}))

import { Card } from '../index'
import { render, screen } from '@testing-library/react'

describe('Card', () => {
  it('renders title and placeholder when there is no meta image', () => {
    render(
      <Card
        doc={{
          slug: 'hello',
          title: 'Hello world',
          categories: [],
          meta: {},
        }}
        relationTo="posts"
      />,
    )

    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('No image')).toBeInTheDocument()
  })
})
