import { Textarea } from '@/components/ui/textarea'
import { render, screen } from '@testing-library/react'

describe('Textarea', () => {
  it('renders with data-slot and forwards attributes', () => {
    render(<Textarea name="message" placeholder="Your message" rows={4} aria-label="Message" />)
    const el = screen.getByRole('textbox', { name: 'Message' })
    expect(el).toHaveAttribute('data-slot', 'textarea')
    expect(el).toHaveAttribute('name', 'message')
    expect(el).toHaveAttribute('placeholder', 'Your message')
    expect(el).toHaveAttribute('rows', '4')
  })
})
