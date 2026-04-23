import BeforeLogin from './index'
import { render, screen } from '@testing-library/react'

describe('BeforeLogin', () => {
  it('greets the admin', () => {
    render(<BeforeLogin />)
    expect(screen.getByText(/Welcome to your dashboard/)).toBeInTheDocument()
  })
})
