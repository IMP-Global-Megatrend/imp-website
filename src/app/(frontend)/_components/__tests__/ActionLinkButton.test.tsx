jest.mock('@/app/(frontend)/_components/AnimatedIcon', () => ({
  AnimatedIcon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

import { ActionLinkButton } from '../ActionLinkButton'
import { render, screen } from '@testing-library/react'

describe('ActionLinkButton', () => {
  it('renders label and icon for an internal link', () => {
    render(<ActionLinkButton href="/x" label="Explore" icon="download" />)

    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByTestId('icon-download')).toBeInTheDocument()
  })
})
