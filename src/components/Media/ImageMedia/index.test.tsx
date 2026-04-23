jest.mock('@/utilities/getMediaUrl', () => ({ getMediaUrl: () => '/m' }))
import { ImageMedia } from './index'
import { render, screen } from '@testing-library/react'
describe('ImageMedia', () => {
  it('wraps a resource in an image', () => {
    render(
      <ImageMedia
        className="x"
        resource={{ id: 1, filename: 'f' } as never}
      />,
    )
    expect(document.querySelector('img')).toBeInTheDocument()
  })
})
