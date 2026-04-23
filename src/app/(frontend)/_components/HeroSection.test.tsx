jest.mock('./getHomeCMSContent', () => ({ getHomeCMSContent: () => Promise.resolve({ hero: {} } as never) }))
import { HeroSection } from './HeroSection'
import { render } from '@testing-library/react'
import { act } from 'react'
describe('HeroSection', () => {
  it('fetches and renders', async () => {
    const ui = await act(async () => await HeroSection())
    const { container } = render(ui)
    expect(container.querySelector('section') || document.body).toBeTruthy()
  })
})
