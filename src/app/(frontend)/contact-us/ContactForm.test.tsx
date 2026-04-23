jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
import { ContactForm } from './ContactForm'
import { render, screen } from '@testing-library/react'
describe('ContactForm', () => {
  it('renders contact fields', () => {
    render(<ContactForm consentText="I agree to the privacy policy." />)
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})
