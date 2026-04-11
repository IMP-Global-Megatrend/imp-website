jest.mock('@/components/Card', () => ({
  Card: ({
    hrefPrefix,
    doc,
    className,
  }: {
    hrefPrefix?: string
    doc?: { slug?: string }
    className?: string
  }) => (
    <div
      data-testid="card"
      data-href-prefix={hrefPrefix}
      data-slug={doc?.slug}
      data-class={className}
    />
  ),
}))

import { CollectionArchive } from '@/components/CollectionArchive'
import { render, screen } from '@testing-library/react'

describe('CollectionArchive', () => {
  it('renders a Card per post with hrefPrefix based on basePath and slug', () => {
    render(
      <CollectionArchive
        basePath="/articles"
        posts={[
          {
            slug: 'first-post',
            title: 'First',
            categories: [],
            meta: {},
          },
          {
            slug: 'second-post',
            title: 'Second',
            categories: [],
            meta: {},
          },
        ]}
      />,
    )

    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveAttribute('data-href-prefix', '/articles/first-post')
    expect(cards[0]).toHaveAttribute('data-slug', 'first-post')
    expect(cards[1]).toHaveAttribute('data-href-prefix', '/articles/second-post')
    expect(cards[0]).toHaveAttribute('data-class', 'h-full')
  })

  it('defaults basePath to /posts', () => {
    render(
      <CollectionArchive
        posts={[
          {
            slug: 'x',
            title: 'X',
            categories: [],
            meta: {},
          },
        ]}
      />,
    )
    expect(screen.getByTestId('card')).toHaveAttribute('data-href-prefix', '/posts/x')
  })

  it('skips non-object entries', () => {
    render(
      <CollectionArchive
        posts={[null, { slug: 'ok', title: 'OK', categories: [], meta: {} }] as never}
      />,
    )
    expect(screen.getAllByTestId('card')).toHaveLength(1)
  })
})
