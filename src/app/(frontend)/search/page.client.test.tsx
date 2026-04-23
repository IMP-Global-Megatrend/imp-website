import PageClient from './page.client'
import { render, screen } from '@testing-library/react'
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
describe('search page client', () => {
  it('mounts', () => { render(<PageClient />); expect(document.body).toBeTruthy() })
})
