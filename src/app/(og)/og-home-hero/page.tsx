import { getHomeCMSContent } from '@/app/(frontend)/_components/getHomeCMSContent'
import type { Metadata } from 'next'

export const revalidate = 300
export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false,
  },
}

export default async function OgHomeHeroPage() {
  const cms = await getHomeCMSContent()

  return (
    <main
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'radial-gradient(130% 120% at 0% 0%, #4153ff 0%, #2f42ef 38%, #2b3dea 68%, #2634cb 100%)',
        color: '#fff',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        fontFamily: 'Manuale, serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          padding: '56px 64px 40px',
          boxSizing: 'border-box',
        }}
      >
        <svg
          viewBox="0 0 28 28"
          role="img"
          aria-label="IMP logo mark"
          style={{ width: '64px', height: '64px', marginBottom: '26px' }}
        >
          <path
            fill="#ffffff"
            d="M16.091 28C22.668 28 28 22.668 28 16.091c0-6.576-5.332-11.908-11.909-11.908-6.576 0-11.908 5.332-11.908 11.908C4.183 22.668 9.515 28 16.09 28"
          />
          <path
            fill="#ffffff"
            d="M4.708 27.474c-6.274-6.274-6.274-16.48 0-22.765A15.97 15.97 0 0 1 16.091 0c4.309 0 8.343 1.669 11.383 4.709L25.863 6.32C20.468.949 11.703.949 6.32 6.331s-5.383 14.149 0 19.532z"
          />
        </svg>
        <h1
          style={{
            margin: 0,
            maxWidth: '820px',
            fontFamily: 'Safiro, Manuale, serif',
            fontSize: '62px',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}
        >
          {cms.hero.heading}
        </h1>
        <p
          style={{
            margin: '24px 0 0',
            maxWidth: '620px',
            fontSize: '28px',
            lineHeight: 1.5,
            fontWeight: 300,
            whiteSpace: 'pre-line',
          }}
        >
          {cms.hero.subtitle.replace('megatrends ', 'megatrends\n')}
        </p>
        <div
          style={{
            marginTop: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 18px',
            background: '#fff',
            color: '#0b1035',
            fontFamily: 'Safiro, Manuale, serif',
            fontSize: '22px',
            fontWeight: 500,
          }}
        >
          {cms.hero.ctaLabel}
        </div>
      </div>
    </main>
  )
}
