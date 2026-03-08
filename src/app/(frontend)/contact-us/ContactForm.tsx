'use client'

import React, { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
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
  }

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="contact-first-name" className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
            {contactUsContent.form.fields.firstName.label}
          </label>
          <input
            id="contact-first-name"
            className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors aria-[invalid=true]:border-red-500"
            placeholder={contactUsContent.form.fields.firstName.placeholder}
            value={values.firstName}
            onChange={(event) => setFieldValue('firstName', event.target.value)}
            onBlur={() => handleFieldBlur('firstName')}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'contact-first-name-error' : undefined}
          />
          {errors.firstName ? (
            <p id="contact-first-name-error" className="mt-1 text-[13px] text-red-600">
              {errors.firstName}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="contact-last-name" className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
            {contactUsContent.form.fields.lastName.label}
          </label>
          <input
            id="contact-last-name"
            className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors aria-[invalid=true]:border-red-500"
            placeholder={contactUsContent.form.fields.lastName.placeholder}
            value={values.lastName}
            onChange={(event) => setFieldValue('lastName', event.target.value)}
            onBlur={() => handleFieldBlur('lastName')}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'contact-last-name-error' : undefined}
          />
          {errors.lastName ? (
            <p id="contact-last-name-error" className="mt-1 text-[13px] text-red-600">
              {errors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="contact-phone" className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
          {contactUsContent.form.fields.phone.label}
        </label>
        <input
          id="contact-phone"
          className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors aria-[invalid=true]:border-red-500"
          placeholder={contactUsContent.form.fields.phone.placeholder}
          value={values.phone}
          onChange={(event) => setFieldValue('phone', event.target.value)}
          onBlur={() => handleFieldBlur('phone')}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
        />
        {errors.phone ? (
          <p id="contact-phone-error" className="mt-1 text-[13px] text-red-600">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
          {contactUsContent.form.fields.email.label}{' '}
          <span className="text-red-500">{contactUsContent.form.fields.email.requiredSuffix}</span>
        </label>
        <input
          id="contact-email"
          type="email"
          className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors aria-[invalid=true]:border-red-500"
          placeholder={contactUsContent.form.fields.email.placeholder}
          value={values.email}
          onChange={(event) => setFieldValue('email', event.target.value)}
          onBlur={() => handleFieldBlur('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
        />
        {errors.email ? (
          <p id="contact-email-error" className="mt-1 text-[13px] text-red-600">
            {errors.email}
          </p>
        ) : null}
      </div>

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
        {errors.inquiryType ? (
          <p id="contact-inquiry-error" className="mt-2 text-[13px] text-red-600">
            {errors.inquiryType}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
          {contactUsContent.form.fields.message.label}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors resize-none aria-[invalid=true]:border-red-500"
          placeholder={contactUsContent.form.fields.message.placeholder}
          value={values.message}
          onChange={(event) => setFieldValue('message', event.target.value)}
          onBlur={() => handleFieldBlur('message')}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
        />
        {errors.message ? (
          <p id="contact-message-error" className="mt-1 text-[13px] text-red-600">
            {errors.message}
          </p>
        ) : null}
      </div>

      <div className="border-t border-[#d9def0] pt-5">
        <h3 className="text-[15px] font-medium text-[#0b1035] mb-2">{contactUsContent.form.consent.heading}</h3>
        {consentText ? <p className="mb-3 text-[14px] leading-relaxed text-[#5f6477]">{consentText}</p> : null}
        <label htmlFor="contact-consent" className="flex items-start gap-2 text-[14px] text-[#2b3045]">
          <Checkbox
            id="contact-consent"
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
            className="mt-0.5 size-5 rounded-none border-[#d9def0] data-[state=checked]:border-[#0040ff] data-[state=checked]:bg-[#0040ff] cursor-pointer"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'contact-consent-error' : undefined}
          />
          {contactUsContent.form.consent.checkboxLabel}
        </label>
        {errors.consent ? (
          <p id="contact-consent-error" className="mt-2 text-[13px] text-red-600">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        variant="default"
        size="clear"
        className="rounded-none bg-[#0040ff] px-8 py-3 font-display text-[14px] text-white hover:bg-[#0035d9] cursor-pointer"
      >
        {contactUsContent.form.submitLabel}
      </Button>
    </form>
  )
}
