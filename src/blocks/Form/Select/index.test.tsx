import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Select } from './index'

function W() {
  const m = useForm({ defaultValues: { f: '' } })
  return (
    <FormProvider {...m}>
      <Select
        name="f"
        label="L"
        blockName={null}
        blockType="x"
        defaultValue=""
        required={false}
        width="100"
        register={m.register}
        control={m.control}
        errors={m.formState.errors}
        options={[{ label: 'A', value: 'a' }]} as never
defaultValue="a"
      />
    </FormProvider>
  )
}

describe('Form Select', () => {
  it('mounts', () => {
    render(<W />)
    expect(screen.getByRole('combobox', { name: 'L' })).toBeInTheDocument()
  })
})
