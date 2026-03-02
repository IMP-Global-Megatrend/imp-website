'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const STORAGE_KEY = 'imp-content-gate-completed'
const TRACKING_CONSENT_KEY = 'imp-tracking-consent-granted'
const TRACKING_CONSENT_EVENT = 'imp:tracking-consent-changed'
const COUNTRIES = [
  {
    value: 'Liechtenstein',
    label: 'Liechtenstein',
    flagSrc: '/images/flags/li.svg',
  },
  {
    value: 'Switzerland',
    label: 'Switzerland',
    flagSrc: '/images/flags/ch.svg',
  },
]

function isIndexingBotUserAgent(userAgent: string): boolean {
  return /(bot|crawler|spider|crawling|googlebot|bingbot|yandex|duckduckbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|mj12bot)/i.test(
    userAgent,
  )
}

export function ContentGatePopup() {
  const [isMounted, setIsMounted] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isBot, setIsBot] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const selectedCountryOption = COUNTRIES.find((country) => country.value === selectedCountry)

  useEffect(() => {
    const userAgent = navigator.userAgent || ''
    const robot = isIndexingBotUserAgent(userAgent)
    const unlocked = window.localStorage.getItem(STORAGE_KEY) === 'true'
    const storedConsent = window.localStorage.getItem(TRACKING_CONSENT_KEY) === 'true'

    setIsBot(robot)
    setIsUnlocked(unlocked)
    setConsentChecked(storedConsent)
    setIsMounted(true)
  }, [])

  const shouldShow = useMemo(() => isMounted && !isBot && !isUnlocked, [isBot, isMounted, isUnlocked])

  useEffect(() => {
    if (!shouldShow) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [shouldShow])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!selectedCountry) {
      setErrorMessage('Please select your country.')
      return
    }

    if (!consentChecked) {
      setErrorMessage('Please consent to proceed.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/content-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCountry,
          path: window.location.pathname,
        }),
      })

      if (!res.ok) {
        setErrorMessage('Unable to submit right now. Please try again.')
        return
      }

      window.localStorage.setItem(STORAGE_KEY, 'true')
      setIsUnlocked(true)
    } catch {
      setErrorMessage('Unable to submit right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!shouldShow) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0b1035]/70 backdrop-blur-[2px]" />

      <div
        className="relative w-[min(92vw,350px)] rounded-[14px] border border-[#d9def0] bg-white p-6 shadow-[0_12px_40px_rgba(11,16,53,0.28)]"
        role="dialog"
        aria-modal="true"
        aria-label="Access form"
      >
        <h2 className="text-[22px] leading-[1.2] text-[#0b1035]">Before you continue</h2>
        <p className="mt-2 text-[18px] text-[#5f6477]">
          Please complete this short form to access the content.
        </p>

        <form className="mt-5 space-y-3.5 font-display" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-[13px] text-[#5f6477] font-display">
              Country
            </label>
            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger
                id="gate-country"
                aria-label="Select your country"
                className="h-[42px] w-full rounded-none border-[#d9def0] bg-white px-3.5 py-2.5 text-[14px] text-[#0b1035] shadow-none focus-visible:ring-[#0040ff]/20 font-display cursor-pointer"
              >
                {selectedCountryOption ? (
                  <div className="inline-flex items-center gap-2 whitespace-nowrap">
                    <img
                      src={selectedCountryOption.flagSrc}
                      alt=""
                      aria-hidden="true"
                      className="h-3.5 w-[21px] rounded-none object-cover"
                    />
                    <span>{selectedCountryOption.label}</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select your country" />
                )}
              </SelectTrigger>
              <SelectContent className="z-[130] font-display rounded-none">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                      <img
                        src={country.flagSrc}
                        alt=""
                        aria-hidden="true"
                        className="h-3.5 w-[21px] rounded-none object-cover"
                      />
                      <span>{country.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="gate-consent"
              checked={consentChecked}
              onCheckedChange={(checked) => {
                const granted = checked === true
                setConsentChecked(granted)
                if (granted) {
                  window.localStorage.setItem(TRACKING_CONSENT_KEY, 'true')
                } else {
                  window.localStorage.removeItem(TRACKING_CONSENT_KEY)
                }
                window.dispatchEvent(new Event(TRACKING_CONSENT_EVENT))
              }}
              className="mt-[2px] size-5 border-[#d9def0] data-[state=checked]:bg-[#0040ff] data-[state=checked]:border-[#0040ff] cursor-pointer"
            />
            <label
              htmlFor="gate-consent"
              className="text-[14px] leading-[1.4] text-[#5f6477] font-sans cursor-pointer"
            >
              I consent to the processing of my personal data for this request.
            </label>
          </div>

          {errorMessage ? <p className="text-[14px] text-[#0040ff]">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-none bg-[#0040ff] px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#0035d9] font-display cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
