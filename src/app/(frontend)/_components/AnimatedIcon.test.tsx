import React from 'react'

jest.mock('lucide-animated', () => {
  const I = React.forwardRef<HTMLSpanElement>((p, r) => <span ref={r} data-testid="ico" />)
  I.displayName = 'I'
  return new Proxy(
    {},
    { get: () => I },
  )
})

import { AnimatedIcon } from './AnimatedIcon'
import { render, screen } from '@testing-library/react'

describe('AnimatedIcon', () => {
  it('renders an icon wrapper for a known name', () => {
    render(<AnimatedIcon name="home" />)
    expect(screen.getByTestId('ico')).toBeInTheDocument()
  })
})
