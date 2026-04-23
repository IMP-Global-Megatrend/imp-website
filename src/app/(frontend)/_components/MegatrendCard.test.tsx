jest.mock('@/app/(frontend)/_components/AnimatedIcon', () => ({
  AnimatedIcon: () => <span data-testid="ico" />,
}))

import { MegatrendCard } from './MegatrendCard'
import { render, screen } from '@testing-library/react'

describe('MegatrendCard', () => {
  it('renders title and body', () => {
    render(
      <MegatrendCard
        title="AI"
        body="Body"
        imageUrl="/a.jpg"
        tickers={[
          ['AAPL', 'Apple Inc.'],
          ['MSFT', 'Microsoft'],
        ]}
      />,
    )
    expect(screen.getByRole('heading', { name: 'AI', level: 2 })).toBeInTheDocument()
  })
})
