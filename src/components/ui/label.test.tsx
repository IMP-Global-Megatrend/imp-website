import { Label } from '@/components/ui/label'
import { render, screen } from '@testing-library/react'

describe('Label', () => {
  it('associates with a control via htmlFor', () => {
    render(
      <>
        <Label htmlFor="user-email">Email</Label>
        <input id="user-email" type="email" />
      </>,
    )
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'user-email')
  })
})
