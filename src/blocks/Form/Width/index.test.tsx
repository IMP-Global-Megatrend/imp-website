import { Width } from './index'
import { render, screen } from '@testing-library/react'
describe('Width', () => {
  it('renders children', () => {
    render(<Width width="100">c</Width>)
    expect(screen.getByText('c')).toBeInTheDocument()
  })
})