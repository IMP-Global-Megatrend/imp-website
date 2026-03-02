import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import Script from 'next/script'
import React from 'react'

import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { PageTransition } from './_components/PageTransition'
import { SiteShell } from './_components/SiteShell'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link
          rel="preload"
          href="/fonts/safiro/safiro-regular-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/safiro/safiro-medium-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/safiro/safiro-semibold-webfont.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/manuale/manuale-variable.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {process.env.NODE_ENV === 'development' && (
          <Script id="strip-cursor-hydration-attrs" strategy="beforeInteractive">
            {`(() => {
  const strip = () => {
    document
      .querySelectorAll('[data-cursor-ref],[data-cursor-element-id]')
      .forEach((el) => {
        el.removeAttribute('data-cursor-ref')
        el.removeAttribute('data-cursor-element-id')
      })
  }

  strip()
  const observer = new MutationObserver(strip)
  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: ['data-cursor-ref', 'data-cursor-element-id'],
  })
  setTimeout(() => observer.disconnect(), 3000)
})()`}
          </Script>
        )}
        <link rel="icon" sizes="192x192" href="/original-favicon-192.png" type="image/png" />
        <link rel="shortcut icon" href="/original-favicon-32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/original-apple-touch-icon.png" type="image/png" />
      </head>
      <body>
        <Providers>
          <SiteShell>
            <PageTransition>{children}</PageTransition>
          </SiteShell>
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
