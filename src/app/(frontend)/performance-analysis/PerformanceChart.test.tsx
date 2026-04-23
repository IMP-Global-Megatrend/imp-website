import { PerformanceChart } from './PerformanceChart'
import { render, screen } from '@testing-library/react'
import { act } from 'react'

beforeAll(() => {
  class ResizeObserverStub {
    observe() {
      // leave width 0 so NavPlotChart skips VisxBrushChart
    }
    disconnect() {
      // noop
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.defineProperty(globalThis, 'ResizeObserver', { value: ResizeObserverStub, writable: true, configurable: true } as any)

  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
    }),
  })

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })
})

describe('PerformanceChart', () => {
  it('renders both share class layout sections', () => {
    act(() => {
      render(<PerformanceChart />)
    })
    expect(screen.getByText('USD Share Class', { exact: true })).toBeInTheDocument()
    expect(screen.getByText('CHF Hedged Share Class', { exact: true })).toBeInTheDocument()
  })
})
