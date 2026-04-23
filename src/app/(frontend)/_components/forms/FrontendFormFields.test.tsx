import { useForm, FormProvider } from 'react-hook-form'
import { TextField, TextareaField, ConsentField, FieldError } from './FrontendFormFields'
import { render, screen } from '@testing-library/react'
function T() {
  const m = useForm({ defaultValues: { t: 'v' } })
  return (
    <FormProvider {...m}>
      <TextField name="t" label="L" register={m.register} control={m.control} errors={m.formState.errors} />
    </FormProvider>
  )
}
function Ta() {
  const m = useForm({ defaultValues: { t: 'v' } })
  return (
    <FormProvider {...m}>
      <TextareaField name="t" label="A" register={m.register} control={m.control} errors={m.formState.errors} />
    </FormProvider>
  )
}
function C() {
  const m = useForm({ defaultValues: { c: false } })
  return (
    <FormProvider {...m}>
      <ConsentField
        name="c"
        label="Agree"
        required={true}
        register={m.register}
        control={m.control}
        errors={m.formState.errors}
        consentType="x"
        consentTypeLabel="x"
        consentTypeDescription="d"
        consentTypeHelperText="h"
      />
    </FormProvider>
  )
}
describe('FrontendFormFields', () => {
  it('renders TextField', () => { render(<T />); expect(screen.getByText('L')).toBeInTheDocument() })
  it('renders TextareaField', () => { render(<Ta />); expect(screen.getByText('A')).toBeInTheDocument() })
  it('renders ConsentField', () => {
    render(<C />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })
  it('FieldError with message', () => { render(<FieldError id="a" message="E" />); expect(screen.getByText('E')).toBeInTheDocument() })
})
