import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'node:util'
import React from 'react'

process.env.TZ = 'UTC'

if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder as typeof globalThis.TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

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
