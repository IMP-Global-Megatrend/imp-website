'use client'

import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ConsentField, TextField } from '@/app/(frontend)/_components/forms/FrontendFormFields'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      consent: true,
    })

    const nextErrors = validateAll()
    setErrors(nextErrors)
    setSubmitError(null)
    setSubmitSuccess(false)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/newsletter-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          consentAccepted: consent,
          path: '/newsletter-subscription',
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setSubmitError(data.error || 'Unable to submit your subscription right now. Please try again.')
        return
      }

      setSubmitSuccess(true)
      setValues(initialValues)
      setConsent(false)
      setErrors({})
      setTouched({})
    } catch {
      setSubmitError('Unable to submit your subscription right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mt-7 space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TextField
          id="newsletter-first-name"
          name="firstName"
          label={newsletterContent.form.fields.firstName.label}
          value={values.firstName}
          onChange={(value) => setFieldValue('firstName', value)}
          onBlur={() => handleBlur('firstName')}
          error={errors.firstName}
        />

        <TextField
          id="newsletter-last-name"
          name="lastName"
          label={newsletterContent.form.fields.lastName.label}
          value={values.lastName}
          onChange={(value) => setFieldValue('lastName', value)}
          onBlur={() => handleBlur('lastName')}
          error={errors.lastName}
        />
      </div>

      <TextField
        id="newsletter-email"
        name="email"
        type="email"
        label={newsletterContent.form.fields.email.label}
        requiredSuffix={newsletterContent.form.fields.email.requiredSuffix}
        requiredSuffixClassName="text-[#7f879b]"
        value={values.email}
        onChange={(value) => setFieldValue('email', value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
      />

      <ConsentField
        id="newsletter-consent"
        heading={newsletterContent.form.consent.heading}
        headingClassName="text-[16px] font-medium text-[#0b1035]"
        description={consentText}
        descriptionClassName="mt-2 text-[14px] leading-relaxed text-[#4f566f]"
        checkboxLabel={newsletterContent.form.consent.checkboxLabel}
        labelClassName="mt-3 flex items-start gap-2 text-[14px] text-[#2b3045]"
        checked={consent}
        showTopBorder={false}
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
        error={errors.consent}
      />

      {submitError ? <p className="text-[14px] text-red-600">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="text-[14px] text-green-700">
          Thanks for subscribing. Your details were saved successfully.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="default"
        size="clear"
        disabled={isSubmitting}
        className="cursor-pointer px-5 py-2.5 rounded-none font-display bg-[#0040ff] text-white hover:bg-[#0035d9] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </Button>
    </form>
  )
}
