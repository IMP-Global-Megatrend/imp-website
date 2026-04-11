import { Logo } from '@/components/Logo/Logo'
import { render, screen } from '@testing-library/react'

describe('Logo', () => {
  it('renders brand image and accessible alt text', () => {
    render(<Logo />)
    const img = screen.getByRole('img', { name: 'IMP logo' })
    expect(img).toHaveAttribute('src', '/original-favicon-32.png')
  })

  it('includes visible brand text', () => {
    render(<Logo />)
    expect(screen.getByText('IMP')).toBeInTheDocument()
    expect(screen.getByText('Global Megatrend')).toBeInTheDocument()
  })
})
