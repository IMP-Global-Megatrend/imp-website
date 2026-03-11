import { Checkbox } from '@/components/ui/checkbox'

type FieldErrorProps = {
  id: string
  message?: string
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null
  return (
    <p id={id} className="mt-1 text-[13px] text-red-600">
      {message}
    </p>
  )
}

type TextFieldProps = {
  id: string
  name?: string
  label: string
  requiredSuffix?: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  placeholder?: string
  type?: 'text' | 'email'
  requiredSuffixClassName?: string
}

export function TextField({
  id,
  name,
  label,
  requiredSuffix,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  type = 'text',
  requiredSuffixClassName = 'text-red-500',
}: TextFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
        {label}
        {requiredSuffix ? <> <span className={requiredSuffixClassName}>{requiredSuffix}</span></> : null}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors aria-[invalid=true]:border-red-500"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

type TextareaFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  placeholder?: string
  rows?: number
}

export function TextareaField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  rows = 5,
}: TextareaFieldProps) {
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[15px] leading-[1.3] text-[#4f566f]">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="w-full border border-[#d9def0] px-4 py-3 text-[15px] text-[#0b1035] bg-white placeholder:text-[#b0b5c8] focus:outline-none focus:border-[#0040ff] transition-colors resize-none aria-[invalid=true]:border-red-500"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      <FieldError id={errorId} message={error} />
    </div>
  )
}

type ConsentFieldProps = {
  id: string
  heading: string
  checkboxLabel: string
  checked: boolean
  onCheckedChange: (checked: boolean | 'indeterminate') => void
  onBlur: () => void
  error?: string
  description?: string
  showTopBorder?: boolean
  headingClassName?: string
  descriptionClassName?: string
  labelClassName?: string
}

export function ConsentField({
  id,
  heading,
  checkboxLabel,
  checked,
  onCheckedChange,
  onBlur,
  error,
  description,
  showTopBorder = true,
  headingClassName = 'text-[15px] font-medium text-[#0b1035] mb-2',
  descriptionClassName = 'mb-3 text-[14px] leading-relaxed text-[#5f6477]',
  labelClassName = 'flex items-start gap-2 text-[14px] text-[#2b3045]',
}: ConsentFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className={showTopBorder ? 'border-t border-[#d9def0] pt-5' : ''}>
      <h3 className={headingClassName}>{heading}</h3>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
      <label htmlFor={id} className={labelClassName}>
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange}
          onBlur={onBlur}
          className="mt-0.5 size-5 rounded-none border-[#d9def0] data-[state=checked]:border-[#0040ff] data-[state=checked]:bg-[#0040ff] cursor-pointer"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {checkboxLabel}
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  )
}
