'use client'

import Grainient from '@/components/Grainient'

type OgPreviewFrameProps = {
  title: string
  palette?: {
    color1: string
    color2: string
    color3: string
  }
}

const DEFAULT_PALETTE = {
  color1: '#2b3dea',
  color2: '#3f4ef4',
  color3: '#1f2ca9',
}

export function OgPreviewFrame({ title, palette = DEFAULT_PALETTE }: OgPreviewFrameProps) {
  const safeTitle = title.trim() || 'IMP Global Megatrend Umbrella Fund'

  return (
    <main
      style={{
        width: '1200px',
        height: '630px',
        position: 'relative',
        overflow: 'hidden',
        background: '#2b3dea',
        color: '#ffffff',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <Grainient
          color1={palette.color1}
          color2={palette.color2}
          color3={palette.color3}
          timeSpeed={0.6}
          colorBalance={0.28}
          warpStrength={2.4}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.02}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1}
          gamma={1}
          saturation={0.68}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          padding: '46px 72px 56px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
          <svg viewBox="0 0 28 28" role="img" aria-label="IMP logo mark" style={{ width: '42px', height: '42px' }}>
            <path
              fill="#ffffff"
              d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28"
            />
            <path
              fill="#ffffff"
              d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z"
            />
          </svg>
          <div
            style={{
              fontFamily: '"Safiro", "Manuale", serif',
              fontWeight: 600,
              fontSize: '36px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
            }}
          >
            IMP Global Megatrend <span style={{ fontWeight: 400 }}>Umbrella Fund</span>
          </div>
        </div>

        <div style={{ maxWidth: '900px' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: '"Safiro", "Manuale", serif',
              fontWeight: 600,
              fontSize: '76px',
              lineHeight: 1.08,
              letterSpacing: '-0.02em',
              textWrap: 'balance',
            }}
          >
            {safeTitle}
          </h1>
        </div>
      </div>
    </main>
  )
}
