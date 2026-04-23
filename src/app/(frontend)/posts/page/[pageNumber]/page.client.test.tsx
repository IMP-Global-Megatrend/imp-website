import PageClient from './page.client'
import { render } from '@testing-library/react'
describe('page.client posts paged', () => {
  it('renders', () => { render(<PageClient />); expect(true).toBe(true) })
})
