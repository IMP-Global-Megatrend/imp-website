jest.mock('@/blocks/Code/CopyButton', () => ({
  CopyButton: () => <button type="button">Copy</button>,
}))

import { Code } from './Component.client'
import { render, screen } from '@testing-library/react'

describe('Code (client)', () => {
  it('renders highlighted code when code is set', () => {
    render(<Code code="a = 1" language="javascript" />)
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument()
    expect(document.querySelector('pre')).toHaveTextContent('a = 1')
  })

  it('returns null when code is empty', () => {
    const { container } = render(<Code code="" />)
    expect(container.firstChild).toBeNull()
  })
})
