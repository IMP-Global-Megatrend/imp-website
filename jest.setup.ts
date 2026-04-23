import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'
import React from 'react'

process.env.TZ = 'UTC'

class IntersectionObserverMock {
  observe = () => undefined
  unobserve = () => undefined
  disconnect = () => undefined
  takeRecords = () => []
}
Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

class ResizeObserverMock {
  observe = () => undefined
  unobserve = () => undefined
  disconnect = () => undefined
  takeRecords = () => []
}
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
})

if (typeof globalThis.matchMedia === 'undefined') {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
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
}

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

// lucide-animated + useLucideIdleRef triggers framer-motion in queueMicrotask before mount in Jest
jest.mock('@/hooks/useLucideIdleRef', () => ({
  useLucideIdleRef: () => () => undefined,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(props: Record<string, unknown>) {
    const { src, alt, ...rest } = props
    return React.createElement('img', { src, alt, ...rest })
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode
    href: string
  }) {
    return React.createElement('a', { href, ...rest }, children)
  },
}))

// ESM-only in node_modules; avoid Jest parse errors when any import graph touches Lexical
jest.mock('@payloadcms/richtext-lexical/react', () => {
  return {
    __esModule: true,
    LinkJSXConverter: () => ({}),
    RichText: function MockRichText(
      props: { className?: string; 'data-testid'?: string } & Record<string, unknown>,
    ) {
      return React.createElement('div', {
        'data-testid': props['data-testid'] ?? 'lexical-rich-text',
        className: props.className,
      })
    },
  }
})
