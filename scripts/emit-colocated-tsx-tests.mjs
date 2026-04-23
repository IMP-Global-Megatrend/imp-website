/**
 * One-off: emit colocated *.test.tsx files for remaining modules.
 * Run: node scripts/emit-colocated-tsx-tests.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const formWrap = (comp, extraProps = '') => `import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { ${comp} } from './index'

function W() {
  const m = useForm({ defaultValues: { f: '' } })
  return (
    <FormProvider {...m}>
      <${comp}
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
        ${extraProps}
      />
    </FormProvider>
  )
}

describe('Form ${comp}', () => {
  it('mounts', () => {
    render(<W />)
    expect(screen.getByLabelText('L')).toBeInTheDocument()
  })
})
`

const messageTest = `jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <div>rt</div> }))
import { Message } from './index'
import { render, screen } from '@testing-library/react'
const doc = { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } as never
describe('Form Message', () => {
  it('renders rich text when message is set', () => {
    render(<Message message={doc} />)
    expect(screen.getByText('rt')).toBeInTheDocument()
  })
})
`

const many = {
  'src/blocks/Form/Text/index.test.tsx': formWrap('Text'),
  'src/blocks/Form/Textarea/index.test.tsx': formWrap('Textarea'),
  'src/blocks/Form/Email/index.test.tsx': formWrap('Email'),
  'src/blocks/Form/Number/index.test.tsx': formWrap('Number'),
  'src/blocks/Form/Message/index.test.tsx': messageTest,
  'src/blocks/Form/State/index.test.tsx': formWrap('State'),
  'src/blocks/Form/Country/index.test.tsx': formWrap('Country'),
  'src/blocks/Form/Select/index.test.tsx': formWrap(
    'Select',
    `options={[{ label: 'A', value: 'a' }]} as never\ndefaultValue="a"`,
  ),
}

for (const [rel, body] of Object.entries(many)) {
  const p = path.join(root, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, body)
}
console.log('Wrote', Object.keys(many).length, 'form field tests')
