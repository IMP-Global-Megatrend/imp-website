jest.mock('@/components/Media', () => ({ Media: () => <div /> }))

jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <div>rt</div> }))

import { MediumImpactHero } from './index'
import { render, screen } from '@testing-library/react'

const doc = { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } as never

describe('MediumImpactHero', () => {
  it('renders with media and rich text', () => {
    render(
      <MediumImpactHero
        type="mediumImpact"
        media={null as never}
        richText={doc}
        subheading="S"
      />,
    )
    expect(screen.getByText('rt')).toBeInTheDocument()
  })
})
