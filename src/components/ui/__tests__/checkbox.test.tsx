jest.mock('lucide-animated', () => ({
  CheckIcon: () => <span data-testid="check-icon" aria-hidden />,
}))

import { Checkbox } from '@/components/ui/checkbox'
import { fireEvent, render, screen } from '@testing-library/react'

describe('Checkbox', () => {
  it('renders with checkbox role and data-slot', () => {
    render(<Checkbox aria-label="Accept terms" />)
    const box = screen.getByRole('checkbox', { name: 'Accept terms' })
    expect(box).toHaveAttribute('data-slot', 'checkbox')
    expect(box).toHaveAttribute('data-state', 'unchecked')
  })

  it('toggles state and shows the indicator when checked', () => {
    render(<Checkbox defaultChecked={false} aria-label="Toggle" />)
    const box = screen.getByRole('checkbox')
    expect(box).toHaveAttribute('data-state', 'unchecked')
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()

    fireEvent.click(box)
    expect(box).toHaveAttribute('data-state', 'checked')
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()

    fireEvent.click(box)
    expect(box).toHaveAttribute('data-state', 'unchecked')
  })
})
