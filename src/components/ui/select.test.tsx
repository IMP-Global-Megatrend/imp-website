import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { render, screen } from '@testing-library/react'
describe('ui Select', () => {
  it('renders a combobox', () => {
    render(
      <Select onValueChange={() => undefined} value="a">
        <SelectTrigger aria-label="S">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>,
    )
    expect(screen.getByLabelText('S')).toBeInTheDocument()
  })
})
