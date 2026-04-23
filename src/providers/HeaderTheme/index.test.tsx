import { HeaderThemeProvider, useHeaderTheme } from './index'
import { render, screen } from '@testing-library/react'

jest.mock('@/utilities/canUseDOM', () => ({ __esModule: true, default: true }))

function TestConsumer() {
  const ctx = useHeaderTheme()
  return <span data-testid="h">{ctx.setHeaderTheme ? 'ok' : 'no'}</span>
}

describe('HeaderThemeProvider', () => {
  it('renders children', () => {
    render(
      <HeaderThemeProvider>
        <TestConsumer />
      </HeaderThemeProvider>,
    )
    expect(screen.getByTestId('h')).toHaveTextContent('ok')
  })
})
