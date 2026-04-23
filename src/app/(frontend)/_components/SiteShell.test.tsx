jest.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => () => Promise.resolve({ navItems: [] } as never),
}))

jest.mock('@/app/(frontend)/_components/RegulatoryNotice', () => ({
  RegulatoryNotice: function MockReg() {
    return <div data-testid="reg" />
  },
}))

jest.mock('@/app/(frontend)/_components/ContentGatePopup', () => ({
  ContentGatePopup: () => null,
}))

jest.mock('@/app/(frontend)/_components/SiteHeader', () => ({
  SiteHeader: () => <div data-testid="sh">sh</div>,
}))

jest.mock('@/app/(frontend)/_components/TrackingConsentManager', () => ({
  TrackingConsentManager: () => null,
}))

import { SiteShell } from './SiteShell'
import { render, screen } from '@testing-library/react'

describe('SiteShell', () => {
  it('wraps main content', async () => {
    const el = await SiteShell({ children: <main>M</main> })
    const { getByText } = render(el)
    expect(getByText('M')).toBeInTheDocument()
  })
})
