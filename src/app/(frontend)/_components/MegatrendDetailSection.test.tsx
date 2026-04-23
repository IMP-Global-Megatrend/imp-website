import { MegatrendDetailSection } from './MegatrendDetailSection'
import { render, screen } from '@testing-library/react'

const trend = {
  icon: '/i.svg',
  title: 'T',
  subtitle: 'S',
  description: ['D1'],
  conclusion: 'C',
}

describe('MegatrendDetailSection', () => {
  it('renders trend copy', () => {
    render(<MegatrendDetailSection id="1" index={0} trend={trend} />)
    expect(screen.getByRole('heading', { name: 'T', level: 2 })).toBeInTheDocument()
  })
})
