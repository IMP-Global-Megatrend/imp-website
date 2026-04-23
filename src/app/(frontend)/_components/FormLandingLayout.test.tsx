jest.mock('next/navigation', () => ({ usePathname: () => '/', useRouter: () => ({ push: jest.fn() }) }))
import { FormLandingLayout } from './FormLandingLayout'
import { render, screen } from '@testing-library/react'
const palette = { color1: '#1', color2: '#2', color3: '#3' }
describe('FormLandingLayout', () => {
  it('renders children in a main landmark', () => {
    render(
      <FormLandingLayout heroTitle="T" heroSubtitle="S" palette={palette}>
        <p>c</p>
      </FormLandingLayout>,
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByText('T')).toBeInTheDocument()
  })
})
