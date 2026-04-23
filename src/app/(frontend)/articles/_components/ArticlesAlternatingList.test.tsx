jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { ArticlesAlternatingList } from './ArticlesAlternatingList'
import { render, screen } from '@testing-library/react'
const posts = [{ id: 1, slug: 'a', title: 'T' } as never]
describe('ArticlesAlternatingList', () => {
  it('renders a list of entries', () => {
    render(<ArticlesAlternatingList basePath="/articles" posts={posts} />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
