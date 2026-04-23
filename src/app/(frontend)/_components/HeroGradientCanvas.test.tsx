jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { HeroGradientCanvas } from './HeroGradientCanvas'
import { render } from '@testing-library/react'
describe('HeroGradientCanvas', () => {
  it('mounts a canvas', () => {
    const { container } = render(<HeroGradientCanvas />)
    expect(container.querySelector('canvas')).toBeInTheDocument()
  })
})
