jest.mock('@payloadcms/ui', () => ({
  useRowLabel: () => ({ data: { link: { label: 'Test' } }, rowNumber: 0 }),
}))

import { RowLabel } from './RowLabel'
import { render, screen } from '@testing-library/react'

describe('Header RowLabel', () => {
  it('shows a label from row data', () => {
    render(<RowLabel />)
    expect(screen.getByText(/Nav item 1: Test/)).toBeInTheDocument()
  })
})
