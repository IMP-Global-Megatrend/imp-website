jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))
import { NewsletterSubscriptionForm } from './NewsletterSubscriptionForm'
import { render, screen } from '@testing-library/react'
describe('NewsletterSubscriptionForm', () => {
  it('mounts a form', () => {
    render(<NewsletterSubscriptionForm />)
    expect(document.querySelector('form')).toBeInTheDocument()
  })
})
