'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import newsletterContent from '@/constants/newsletter-subscription-content.json'

type NewsletterSubscriptionFormProps = {
  consentText: string
  submitLabel: string
}

type FieldName = 'firstName' | 'lastName' | 'email'
type FieldValues = Record<FieldName, string>
type FieldErrors = Partial<Record<FieldName | 'consent', string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initialValues: FieldValues = {
  firstName: '',
  lastName: '',
  email: '',
}

export function NewsletterSubscriptionForm({ consentText, submitLabel }: NewsletterSubscriptionFormProps) {
  const [values, setValues] = useState<FieldValues>(initialValues)
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName | 'consent', boolean>>>({})

  const validateField = (field: FieldName, value: string): string | undefined => {
    const trimmed = value.trim()

    if ((field === 'firstName' || field === 'lastName') && !trimmed) {
      return 'This field is required.'
    }

    if (field === 'email') {
      if (!trimmed) return 'Email is required.'
      if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.'
    }

    return undefined
  }

  const setFieldValue = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const handleBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }))
  }

  const validateAll = (): FieldErrors => {
    const nextErrors: FieldErrors = {}
    ;(Object.keys(values) as FieldName[]).forEach((field) => {
      const error = validateField(field, values[field])
      if (error) nextErrors[field] = error
    })

    if (!consent) nextErrors.consent = 'Please accept this checkbox to continue.'

    return nextErrors
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      consent: true,
    })

    setErrors(validateAll())
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label
            htmlFor="newsletter-first-name"
            className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
          >
            {newsletterContent.form.fields.firstName.label}
          </label>
          <input
            id="newsletter-first-name"
            name="firstName"
            type="text"
            className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none aria-[invalid=true]:border-red-500"
            value={values.firstName}
            onChange={(event) => setFieldValue('firstName', event.target.value)}
            onBlur={() => handleBlur('firstName')}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'newsletter-first-name-error' : undefined}
          />
          {errors.firstName ? (
            <p id="newsletter-first-name-error" className="mt-1 text-[13px] text-red-600">
              {errors.firstName}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="newsletter-last-name"
            className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
          >
            {newsletterContent.form.fields.lastName.label}
          </label>
          <input
            id="newsletter-last-name"
            name="lastName"
            type="text"
            className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none aria-[invalid=true]:border-red-500"
            value={values.lastName}
            onChange={(event) => setFieldValue('lastName', event.target.value)}
            onBlur={() => handleBlur('lastName')}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'newsletter-last-name-error' : undefined}
          />
          {errors.lastName ? (
            <p id="newsletter-last-name-error" className="mt-1 text-[13px] text-red-600">
              {errors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="newsletter-email"
          className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]"
        >
          {newsletterContent.form.fields.email.label}{' '}
          <span className="text-[#7f879b]">{newsletterContent.form.fields.email.requiredSuffix}</span>
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          className="w-full border border-[#d9def0] bg-white px-4 py-3 text-[15px] text-[#0b1035] placeholder:text-[#b0b5c8] transition-colors focus:border-[#0040ff] focus:outline-none aria-[invalid=true]:border-red-500"
          value={values.email}
          onChange={(event) => setFieldValue('email', event.target.value)}
          onBlur={() => handleBlur('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'newsletter-email-error' : undefined}
        />
        {errors.email ? (
          <p id="newsletter-email-error" className="mt-1 text-[13px] text-red-600">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="text-[16px] font-medium text-[#0b1035]">{newsletterContent.form.consent.heading}</h3>
        {consentText ? <p className="mt-2 text-[14px] leading-relaxed text-[#4f566f]">{consentText}</p> : null}

        <label htmlFor="newsletter-consent" className="mt-3 flex items-start gap-2 text-[14px] text-[#2b3045]">
          <Checkbox
            id="newsletter-consent"
            name="consent"
            checked={consent}
            onCheckedChange={(checked) => {
              const isChecked = checked === true
              setConsent(isChecked)
              if (touched.consent) {
                setErrors((prev) => ({
                  ...prev,
                  consent: isChecked ? undefined : 'Please accept this checkbox to continue.',
                }))
              }
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, consent: true }))
              setErrors((prev) => ({
                ...prev,
                consent: consent ? undefined : 'Please accept this checkbox to continue.',
              }))
            }}
            className="mt-0.5 size-5 cursor-pointer rounded-none border-[#d9def0] data-[state=checked]:border-[#0040ff] data-[state=checked]:bg-[#0040ff]"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'newsletter-consent-error' : undefined}
          />
          {newsletterContent.form.consent.checkboxLabel}
        </label>
        {errors.consent ? (
          <p id="newsletter-consent-error" className="mt-2 text-[13px] text-red-600">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="default"
        size="clear"
        className="cursor-pointer px-5 py-2.5 rounded-none font-display bg-[#0040ff] text-white hover:bg-[#0035d9]"
      >
        {submitLabel}
      </Button>
    </form>
  )
}
