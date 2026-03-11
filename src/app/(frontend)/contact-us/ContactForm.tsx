'use client'

import React, { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ConsentField,
  FieldError,
  TextareaField,
  TextField,
} from '@/app/(frontend)/_components/forms/FrontendFormFields'
import contactUsContent from '@/constants/contact-us-content.json'

type ContactFormProps = {
  consentText: string
}

type FieldName = 'firstName' | 'lastName' | 'phone' | 'email' | 'message'

type FieldValues = Record<FieldName, string>
type FieldErrors = Partial<Record<FieldName | 'inquiryType' | 'consent', string>>

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[0-9()\-\s]{7,}$/

const defaultInquiryState = contactUsContent.form.inquiryType.options.map(
  (option) => option === contactUsContent.form.inquiryType.defaultChecked,
)

const initialValues: FieldValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  message: '',
}

export function ContactForm({ consentText }: ContactFormProps) {
  const [values, setValues] = useState<FieldValues>(initialValues)
  const [consent, setConsent] = useState(false)
  const [inquiryState, setInquiryState] = useState<boolean[]>(defaultInquiryState)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName | 'consent' | 'inquiryType', boolean>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const hasInquirySelection = useMemo(() => inquiryState.some(Boolean), [inquiryState])

  const validateField = (field: FieldName, value: string): string | undefined => {
    const trimmed = value.trim()

    if ((field === 'firstName' || field === 'lastName' || field === 'message') && !trimmed) {
      return 'This field is required.'
    }

    if (field === 'email') {
      if (!trimmed) return 'Email is required.'
      if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address.'
    }

    if (field === 'phone' && trimmed && !PHONE_REGEX.test(trimmed)) {
      return 'Please enter a valid phone number.'
    }

    return undefined
  }

  const validateAll = (): FieldErrors => {
    const nextErrors: FieldErrors = {}

    ;(Object.keys(values) as FieldName[]).forEach((field) => {
      const error = validateField(field, values[field])
      if (error) nextErrors[field] = error
    })

    if (!hasInquirySelection) nextErrors.inquiryType = 'Please select at least one inquiry type.'
    if (!consent) nextErrors.consent = 'Please accept this checkbox to continue.'

    return nextErrors
  }

  const setFieldValue = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const handleFieldBlur = (field: FieldName) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    setErrors((prev) => ({ ...prev, [field]: validateField(field, values[field]) }))
  }

  const toggleInquiry = (index: number, checked: boolean | 'indeterminate') => {
    const next = [...inquiryState]
    next[index] = checked === true
    setInquiryState(next)
    if (touched.inquiryType) {
      setErrors((prev) => ({
        ...prev,
        inquiryType: next.some(Boolean) ? undefined : 'Please select at least one inquiry type.',
      }))
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      message: true,
      consent: true,
      inquiryType: true,
    })

    const nextErrors = validateAll()
    setErrors(nextErrors)

    setSubmitError(null)
    setSubmitSuccess(false)

    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const inquiryTypes = contactUsContent.form.inquiryType.options.filter((_, index) => inquiryState[index])

      const response = await fetch('/api/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          inquiryTypes,
          consentAccepted: consent,
          path: '/contact-us',
        }),
      })

      const data = (await response.json().catch(() => ({}))) as { error?: string }
      if (!response.ok) {
        setSubmitError(data.error || 'Unable to submit your message right now. Please try again.')
        return
      }

      setSubmitSuccess(true)
      setValues(initialValues)
      setConsent(false)
      setInquiryState(defaultInquiryState)
      setErrors({})
      setTouched({})
    } catch {
      setSubmitError('Unable to submit your message right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField
          id="contact-first-name"
          label={contactUsContent.form.fields.firstName.label}
          placeholder={contactUsContent.form.fields.firstName.placeholder}
          value={values.firstName}
          onChange={(value) => setFieldValue('firstName', value)}
          onBlur={() => handleFieldBlur('firstName')}
          error={errors.firstName}
        />
        <TextField
          id="contact-last-name"
          label={contactUsContent.form.fields.lastName.label}
          placeholder={contactUsContent.form.fields.lastName.placeholder}
          value={values.lastName}
          onChange={(value) => setFieldValue('lastName', value)}
          onBlur={() => handleFieldBlur('lastName')}
          error={errors.lastName}
        />
      </div>

      <TextField
        id="contact-phone"
        label={contactUsContent.form.fields.phone.label}
        placeholder={contactUsContent.form.fields.phone.placeholder}
        value={values.phone}
        onChange={(value) => setFieldValue('phone', value)}
        onBlur={() => handleFieldBlur('phone')}
        error={errors.phone}
      />

      <TextField
        id="contact-email"
        type="email"
        label={contactUsContent.form.fields.email.label}
        requiredSuffix={contactUsContent.form.fields.email.requiredSuffix}
        placeholder={contactUsContent.form.fields.email.placeholder}
        value={values.email}
        onChange={(value) => setFieldValue('email', value)}
        onBlur={() => handleFieldBlur('email')}
        error={errors.email}
      />

      <fieldset>
        <legend className="mb-3 font-display text-[15px] leading-[1.3] text-[#4f566f]">
          {contactUsContent.form.inquiryType.legend}
        </legend>
        <div className="flex flex-wrap gap-4">
          {contactUsContent.form.inquiryType.options.map((opt, idx) => (
            <label key={opt} htmlFor={`inquiry-${idx}`} className="flex items-center gap-2 text-[14px] text-[#2b3045]">
              <Checkbox
                id={`inquiry-${idx}`}
                className="size-5 rounded-none border-[#d9def0] data-[state=checked]:border-[#0040ff] data-[state=checked]:bg-[#0040ff] cursor-pointer"
                checked={inquiryState[idx]}
                onCheckedChange={(checked) => toggleInquiry(idx, checked)}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, inquiryType: true }))
                  setErrors((prev) => ({
                    ...prev,
                    inquiryType: hasInquirySelection ? undefined : 'Please select at least one inquiry type.',
                  }))
                }}
                aria-invalid={Boolean(errors.inquiryType)}
                aria-describedby={errors.inquiryType ? 'contact-inquiry-error' : undefined}
              />
              {opt}
            </label>
          ))}
        </div>
        <FieldError id="contact-inquiry-error" message={errors.inquiryType} />
      </fieldset>

      <TextareaField
        id="contact-message"
        label={contactUsContent.form.fields.message.label}
        placeholder={contactUsContent.form.fields.message.placeholder}
        value={values.message}
        onChange={(value) => setFieldValue('message', value)}
        onBlur={() => handleFieldBlur('message')}
        error={errors.message}
      />

      <ConsentField
        id="contact-consent"
        heading={contactUsContent.form.consent.heading}
        description={consentText}
        checkboxLabel={contactUsContent.form.consent.checkboxLabel}
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
        error={errors.consent}
      />

      {submitError ? <p className="text-[14px] text-red-600">{submitError}</p> : null}
      {submitSuccess ? (
        <p className="text-[14px] text-green-700">Thanks for your message. Your details were saved successfully.</p>
      ) : null}

      <Button
        type="submit"
        variant="default"
        size="clear"
        disabled={isSubmitting}
        className="rounded-none bg-[#0040ff] px-8 py-3 font-display text-[14px] text-white hover:bg-[#0035d9] cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? 'Submitting...' : contactUsContent.form.submitLabel}
      </Button>
    </form>
  )
}
