import { TypeSwapHeading } from './TypeSwapHeading'
import { render, screen } from '@testing-library/react'
describe('TypeSwapHeading', () => {
  it('splits and renders words', () => {
    const { container } = render(<TypeSwapHeading text="A B" className="x" />)
    expect(container.textContent).toMatch(/A/)
  })
})
