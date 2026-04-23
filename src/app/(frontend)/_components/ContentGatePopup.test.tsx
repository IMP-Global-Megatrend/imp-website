jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { ContentGatePopup } from './ContentGatePopup'
import { render } from '@testing-library/react'
describe('ContentGatePopup', () => {
  it('mounts', () => {
    const { container } = render(<ContentGatePopup />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
