import LightHeaderPageClient from './LightHeaderPageClient'
import { render, screen } from '@testing-library/react'
describe('LightHeaderPageClient', () => {
  it('is empty', () => {
    const { container } = render(<LightHeaderPageClient />)
    expect(container).toBeEmptyDOMElement()
  })
})
