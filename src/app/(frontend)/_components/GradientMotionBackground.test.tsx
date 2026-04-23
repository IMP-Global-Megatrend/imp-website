jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { GradientMotionBackground } from './GradientMotionBackground'
import { render } from '@testing-library/react'
describe('GradientMotionBackground', () => {
  it('mounts a decorative layer', () => {
    const { container } = render(<GradientMotionBackground />)
    expect(container.querySelector('div')).toBeInTheDocument()
  })
})
