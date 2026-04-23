import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { Textarea } from './index'

function W() {
  const m = useForm({ defaultValues: { f: '' } })
  return (
    <FormProvider {...m}>
      <Textarea
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
        
      />
    </FormProvider>
  )
}

describe('Form Textarea', () => {
  it('mounts', () => {
    render(<W />)
    expect(screen.getByText('L')).toBeInTheDocument()
  })
})
