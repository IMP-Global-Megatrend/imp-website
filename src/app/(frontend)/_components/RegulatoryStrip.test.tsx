jest.mock('./getHomeCMSContent', () => ({
  getHomeCMSContent: () => Promise.resolve({ regulatoryItems: [] } as never),
}))
import { RegulatoryStrip } from './RegulatoryStrip'
import { render } from '@testing-library/react'
import { act } from 'react'
describe('RegulatoryStrip', () => {
  it('fetches and renders the strip', async () => {
    const ui = await act(async () => await RegulatoryStrip())
    const { container } = render(ui)
    expect(container.firstChild).toBeInTheDocument()
  })
})
