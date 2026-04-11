import { Input } from '@/components/ui/input'
import { render, screen } from '@testing-library/react'

describe('Input', () => {
  it('renders with data-slot and passes attributes', () => {
    render(<Input placeholder="Email" type="email" name="email" aria-label="Email address" />)
    const field = screen.getByRole('textbox', { name: 'Email address' })
    expect(field).toHaveAttribute('data-slot', 'input')
    expect(field).toHaveAttribute('placeholder', 'Email')
    expect(field).toHaveAttribute('type', 'email')
    expect(field).toHaveAttribute('name', 'email')
  })
})
