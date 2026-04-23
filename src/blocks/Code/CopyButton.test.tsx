jest.mock('@payloadcms/ui/icons/Copy', () => ({
  CopyIcon: () => <span data-testid="copy-icon" />,
}))

import { CopyButton } from './CopyButton'
import { fireEvent, render, screen } from '@testing-library/react'

describe('CopyButton', () => {
  it('copies code to the clipboard when clicked', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    render(<CopyButton code="hello" />)

    fireEvent.click(screen.getByRole('button'))

    expect(writeText).toHaveBeenCalledWith('hello')
  })
})
