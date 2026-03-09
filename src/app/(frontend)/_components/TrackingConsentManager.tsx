'use client'

import { useEffect, useState } from 'react'

const TRACKING_CONSENT_KEY = 'imp-tracking-consent-granted'
const TRACKING_CONSENT_EVENT = 'imp:tracking-consent-changed'

declare global {
  interface Window {
    dataLayer?: unknown[]
    __impGtmLoaded?: boolean
  }
}

function hasTrackingConsent(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(TRACKING_CONSENT_KEY) === 'true'
}

function loadGTM(gtmId: string): void {
  if (!gtmId || typeof window === 'undefined') return
  if (window.__impGtmLoaded) return
  if (
    document.querySelector(
      `script[src^="https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}"]`,
    )
  ) {
    window.__impGtmLoaded = true
    return
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
  script.id = 'imp-gtm-script'
  document.head.appendChild(script)

  window.__impGtmLoaded = true
}

export function TrackingConsentManager() {
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    setConsent(hasTrackingConsent())
  }, [])

  useEffect(() => {
    function onConsentChange() {
      setConsent(hasTrackingConsent())
    }

    window.addEventListener(TRACKING_CONSENT_EVENT, onConsentChange)
    window.addEventListener('storage', onConsentChange)

    return () => {
      window.removeEventListener(TRACKING_CONSENT_EVENT, onConsentChange)
      window.removeEventListener('storage', onConsentChange)
    }
  }, [])

  useEffect(() => {
    if (!consent) return
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-TQJGNS8R'
    loadGTM(gtmId)
  }, [consent])

  return null
}
