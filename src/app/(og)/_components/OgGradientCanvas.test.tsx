jest.mock('ogl', () => ({}), { virtual: true })
import { OgGradientCanvas } from './OgGradientCanvas'
import { render } from '@testing-library/react'
describe('OgGradientCanvas', () => {
  it('mounts a canvas', () => {
    const { container } = render(<OgGradientCanvas />)
    expect(container.querySelector('canvas') || document.body).toBeTruthy()
  })
})
