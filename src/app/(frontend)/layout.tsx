import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link rel="icon" sizes="192x192" href="/original-favicon-192.png" type="image/png" />
        <link rel="shortcut icon" href="/original-favicon-32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/original-apple-touch-icon.png" type="image/png" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'IMP Global Megatrend Umbrella Fund',
    template: '%s | IMP Global Megatrend',
  },
  description:
    'Investing in the structural forces that shape tomorrow. A high-conviction thematic portfolio capturing multi-decade growth opportunities across six transformational megatrends.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
