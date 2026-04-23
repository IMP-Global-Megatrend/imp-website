jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { TrackingConsentManager } from './TrackingConsentManager'
import { render } from '@testing-library/react'
describe('TrackingConsentManager', () => {
  it('mounts without visible UI (consent and GTM run as effects)', () => {
    const { container } = render(<TrackingConsentManager />)
    expect(container).toBeEmptyDOMElement()
  })
})
