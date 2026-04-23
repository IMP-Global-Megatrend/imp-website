import { ThemeProvider, useTheme } from '@/providers/Theme'
import { render, screen } from '@testing-library/react'

function Consumer() {
  const { theme } = useTheme()
  return <span data-testid="theme">{theme ?? 'none'}</span>
}

describe('ThemeProvider', () => {
  it('provides a theme to descendants', () => {
    const store: Record<string, string> = {}
    const localStorageMock = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v
      },
      removeItem: (k: string) => {
        delete store[k]
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k]
      },
    }
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true })

    render(
      <ThemeProvider>
        <Consumer />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme').textContent).not.toBe('none')
  })
})
