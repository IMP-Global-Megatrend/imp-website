jest.mock('@/components/Media/ImageMedia', () => ({
  ImageMedia: () => <div data-testid="image-media" />,
}))

jest.mock('@/components/Media/VideoMedia', () => ({
  VideoMedia: () => <div data-testid="video-media" />,
}))

import { Media } from './index'
import { render, screen } from '@testing-library/react'

describe('Media', () => {
  it('renders ImageMedia when resource is not a video', () => {
    render(
      <Media
        className="wrapper"
        resource={{ mimeType: 'image/jpeg' } as never}
      />,
    )
    expect(screen.getByTestId('image-media')).toBeInTheDocument()
    expect(screen.queryByTestId('video-media')).not.toBeInTheDocument()
    const wrapper = screen.getByTestId('image-media').parentElement
    expect(wrapper).toHaveClass('wrapper')
  })

  it('renders VideoMedia when mime type is video', () => {
    render(<Media resource={{ mimeType: 'video/mp4' } as never} />)
    expect(screen.getByTestId('video-media')).toBeInTheDocument()
    expect(screen.queryByTestId('image-media')).not.toBeInTheDocument()
  })

  it('uses a custom wrapper element when htmlElement is provided', () => {
    render(
      <Media
        htmlElement="section"
        className="media-section"
        resource={{ mimeType: 'image/png' } as never}
      />,
    )
    const section = screen.getByTestId('image-media').closest('section')
    expect(section).toHaveClass('media-section')
  })
})
