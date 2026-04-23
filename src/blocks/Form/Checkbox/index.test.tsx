import { render, screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { Checkbox } from './index'
function W() {
  const m = useForm({ defaultValues: { ok: false } })
  return (
    <FormProvider {...m}>
      <Checkbox
        name="ok"
        label="OK"
        blockName={null}
        blockType="checkbox"
        defaultValue={false}
        required={false}
        width="100"
        register={m.register}
        control={m.control}
        errors={m.formState.errors}
      />
    </FormProvider>
  )
}
describe('Form Checkbox', () => {
  it('renders', () => {
    render(<W />)
    expect(screen.getByLabelText('OK')).toBeInTheDocument()
  })
})