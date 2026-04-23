jest.mock('react-hook-form', () => {
  const actual = jest.requireActual<typeof import('react-hook-form')>('react-hook-form')
  return {
    ...actual,
    useFormContext: () => ({
      formState: { errors: { a: { message: 'Nope' } } },
    }),
  }
})

import { Error } from './index'
import { render, screen } from '@testing-library/react'

describe('Form Error', () => {
  it('shows a message for the named field from form context', () => {
    render(<Error name="a" />)
    expect(screen.getByText('Nope')).toBeInTheDocument()
  })
})
