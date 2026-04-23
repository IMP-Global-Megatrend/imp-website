jest.mock('@/app/(frontend)/_components/ActionLinkButton', () => ({
  ActionLinkButton: () => <span>btn</span>,
}))

import { RelatedLinksStrip } from './RelatedLinksStrip'
import { render, screen } from '@testing-library/react'

describe('RelatedLinksStrip', () => {
  it('renders items and heading', () => {
    render(
      <RelatedLinksStrip
        heading="More"
        items={[
          { href: '/a', label: 'A', icon: 'arrowUpRight' as const },
        ]}
      />,
    )
    expect(screen.getByText('More')).toBeInTheDocument()
  })
})
