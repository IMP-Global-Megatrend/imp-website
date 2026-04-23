jest.mock('@/utilities/getMediaUrl', () => ({ getMediaUrl: (p: string) => p }))

import { VideoMedia } from './index'
import { render, screen } from '@testing-library/react'

describe('VideoMedia', () => {
  it('renders a video element for a file resource', () => {
    render(
      <VideoMedia
        resource={{ id: 1, filename: 'clip.mp4', alt: 'C' } as never}
      />,
    )
    const v = document.querySelector('video')
    expect(v).toBeInTheDocument()
  })
})
