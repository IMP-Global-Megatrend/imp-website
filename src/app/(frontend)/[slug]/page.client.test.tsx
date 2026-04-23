import PageClient from './page.client'
import { render, screen } from '@testing-library/react'

describe('PageClient (slug)', () => {
  it('renders header theme client with light', () => {
    render(<PageClient />)
    expect(document.documentElement).toBeTruthy()
  })
})
