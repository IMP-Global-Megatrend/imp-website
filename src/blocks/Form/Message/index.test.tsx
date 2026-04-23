jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <div>rt</div> }))
import { Message } from './index'
import { render, screen } from '@testing-library/react'
const doc = { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } as never
describe('Form Message', () => {
  it('renders rich text when message is set', () => {
    render(<Message message={doc} />)
    expect(screen.getByText('rt')).toBeInTheDocument()
  })
})
