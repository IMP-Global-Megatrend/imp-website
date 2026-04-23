import { AlternatingFeatureLayout } from './AlternatingFeatureLayout'
import { render, screen } from '@testing-library/react'

describe('AlternatingFeatureLayout', () => {
  it('renders content and media slots', () => {
    render(
      <AlternatingFeatureLayout content={<p>c</p>} media={<span data-testid="m">m</span>} />,
    )
    expect(screen.getByText('c')).toBeInTheDocument()
    expect(screen.getByTestId('m')).toBeInTheDocument()
  })
})
