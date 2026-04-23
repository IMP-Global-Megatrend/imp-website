import { ThemeSelector } from './index'
import { ThemeProvider } from '@/providers/Theme'
import { render, screen } from '@testing-library/react'

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

describe('ThemeSelector', () => {
  it('renders a theme control', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText('Select a theme')).toBeInTheDocument()
  })
})
