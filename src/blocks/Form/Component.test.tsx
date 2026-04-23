jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }))

jest.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://localhost' }))

jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="intro-rt">intro</div>,
}))

import { FormBlock } from './Component'
import { render, screen } from '@testing-library/react'

const form = {
  id: 'form-1',
  fields: [
    {
      blockType: 'text',
      name: 'name',
      label: 'Name',
      required: false,
      defaultValue: '',
      width: '100',
    },
  ],
  confirmationType: 'message' as const,
  confirmationMessage: { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } },
  submitButtonLabel: 'Submit',
} as never

describe('FormBlock', () => {
  it('renders a submit button and a text field', () => {
    render(
      <FormBlock
        enableIntro={false}
        form={form}
      />,
    )
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })
})
