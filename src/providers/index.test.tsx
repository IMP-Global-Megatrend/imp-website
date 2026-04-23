import { Providers } from './index'
import { render, screen } from '@testing-library/react'

describe('Providers', () => {
  it('wraps children in theme providers', () => {
    render(
      <Providers>
        <span data-testid="child">ok</span>
      </Providers>,
    )
    expect(screen.getByTestId('child')).toHaveTextContent('ok')
  })
})
