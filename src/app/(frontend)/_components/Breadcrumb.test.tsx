import { Breadcrumb } from './Breadcrumb'
import { render, screen } from '@testing-library/react'

describe('Breadcrumb', () => {
  it('renders items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'A', href: '/a' },
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
