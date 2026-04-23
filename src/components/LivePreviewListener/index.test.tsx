jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh: jest.fn() }) }))

jest.mock('@payloadcms/live-preview-react', () => ({
  RefreshRouteOnSave: () => <div data-testid="lp" />,
}))

jest.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://x' }))

import { LivePreviewListener } from './index'
import { render, screen } from '@testing-library/react'

describe('LivePreviewListener', () => {
  it('mounts the live preview control', () => {
    render(<LivePreviewListener />)
    expect(screen.getByTestId('lp')).toBeInTheDocument()
  })
})
