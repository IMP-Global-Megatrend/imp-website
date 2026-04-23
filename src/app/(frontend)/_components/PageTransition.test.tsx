jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: jest.fn() }),
}))

import { PageTransition } from './PageTransition'
import { render, screen } from '@testing-library/react'
describe('PageTransition', () => {
  it('wraps children', () => {
    render(
      <PageTransition>
        <p>k</p>
      </PageTransition>,
    )
    expect(screen.getByText('k')).toBeInTheDocument()
  })
})
