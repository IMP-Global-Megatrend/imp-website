jest.mock('@/components/Media', () => ({ Media: () => <div /> }))

import { PostHero } from './index'
import { render, screen } from '@testing-library/react'
import type { Post } from '@/payload-types'

const post = {
  id: 1,
  title: 'Hello',
  categories: [],
  publishedAt: '2020-01-01',
} as Post

describe('PostHero', () => {
  it('renders the post title', () => {
    render(<PostHero post={post} />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
