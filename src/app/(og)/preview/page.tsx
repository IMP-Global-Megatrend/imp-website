import type { Metadata } from 'next'

import { OgPreviewFrame } from '@/app/(og)/_components/OgPreviewFrame'

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

type OgPalette = {
  color1: string
  color2: string
  color3: string
}

function decodeParam(value: string | string[] | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? decodeURIComponent(trimmed) : undefined
}

function paletteFromParams(searchParams: Record<string, string | string[] | undefined>): OgPalette | undefined {
  const color1 = decodeParam(searchParams.color1)
  const color2 = decodeParam(searchParams.color2)
  const color3 = decodeParam(searchParams.color3)
  if (!color1 || !color2 || !color3) return undefined
  return { color1, color2, color3 }
}

export default async function OgPreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  return (
    <>
      <style>{`
        @font-face {
          font-family: "Safiro";
          src: url("/fonts/safiro/safiro-semibold-webfont.woff2") format("woff2");
          font-weight: 600;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Safiro";
          src: url("/fonts/safiro/safiro-regular-webfont.woff2") format("woff2");
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: "Manuale";
          src: url("/fonts/manuale/manuale-variable.ttf") format("truetype");
          font-weight: 300 700;
          font-style: normal;
          font-display: swap;
        }
        html, body {
          margin: 0;
          width: 1200px;
          height: 630px;
          overflow: hidden;
          background: transparent;
        }
        nextjs-portal,
        [data-nextjs-toast],
        [data-nextjs-dev-tools-button],
        [data-nextjs-dev-tools],
        [id^="nextjs-"] {
          display: none !important;
        }
      `}</style>
      <OgPreviewFrame
        title={decodeParam(params.title) || 'IMP Global Megatrend Umbrella Fund'}
        palette={paletteFromParams(params)}
      />
    </>
  )
}
