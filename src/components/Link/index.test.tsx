import { CMSLink } from './index'
import { render, screen } from '@testing-library/react'
import type { Page, Post } from '@/payload-types'

describe('CMSLink', () => {
  it('returns nothing when there is no resolvable href', () => {
    const { container } = render(<CMSLink type="custom" url={null} label="Nowhere" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders an inline link for custom URLs', () => {
    render(
      <CMSLink type="custom" url="/contact" label="Contact" appearance="inline" />,
    )
    const link = screen.getByRole('link', { name: 'Contact' })
    expect(link).toHaveAttribute('href', '/contact')
  })

  it('resolves a page reference to a root-relative path', () => {
    const page = { slug: 'about' } as Page
    render(
      <CMSLink
        type="reference"
        reference={{ relationTo: 'pages', value: page }}
        label="About"
        appearance="inline"
      />,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/about')
  })

  it('resolves a post reference under /posts', () => {
    const post = { slug: 'hello' } as Post
    render(
      <CMSLink
        type="reference"
        reference={{ relationTo: 'posts', value: post }}
        label="Hello"
        appearance="inline"
      />,
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/posts/hello')
  })

  it('opens in a new tab when newTab is set', () => {
    render(
      <CMSLink type="custom" url="https://example.com" label="External" appearance="inline" newTab />,
    )
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
