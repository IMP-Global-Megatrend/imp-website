import { Button } from '@/components/ui/button'
import { render, screen } from '@testing-library/react'

describe('Button', () => {
  it('renders a native button with default slot marker', () => {
    render(<Button type="button">Save</Button>)
    const btn = screen.getByRole('button', { name: 'Save' })
    expect(btn).toHaveAttribute('data-slot', 'button')
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('applies variant classes for destructive', () => {
    render(
      <Button variant="destructive" type="button">
        Delete
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-destructive')
  })

  it('renders asChild by forwarding props to the child element', () => {
    render(
      <Button asChild variant="outline">
        <a href="/docs">Docs</a>
      </Button>,
    )
    const link = screen.getByRole('link', { name: 'Docs' })
    expect(link).toHaveAttribute('href', '/docs')
    expect(link).toHaveAttribute('data-slot', 'button')
  })
})
