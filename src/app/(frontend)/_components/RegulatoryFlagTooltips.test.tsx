import { RegulatoryFlagTooltips } from './RegulatoryFlagTooltips'
import { render, screen } from '@testing-library/react'
describe('RegulatoryFlagTooltips', () => {
  it('renders flag images for CH and LI', () => {
    render(<RegulatoryFlagTooltips />)
    expect(screen.getByAltText('Swiss flag')).toBeInTheDocument()
    expect(screen.getByAltText('Liechtenstein flag')).toBeInTheDocument()
  })
})
