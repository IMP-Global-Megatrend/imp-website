jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <div>rt</div> }))

import { LowImpactHero } from './index'
import { render, screen } from '@testing-library/react'

const doc = { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } as never

describe('LowImpactHero', () => {
  it('renders', () => {
    render(
      <LowImpactHero
        type="lowImpact"
        richText={doc}
      />,
    )
    expect(document.body).toBeTruthy()
  })
})
