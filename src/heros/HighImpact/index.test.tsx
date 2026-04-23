jest.mock('@/providers/HeaderTheme', () => ({ useHeaderTheme: () => ({ setHeaderTheme: jest.fn() }) }))

jest.mock('@/components/Media', () => ({ Media: () => <div data-testid="m" /> }))

jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => <div>rt</div> }))

import { HighImpactHero } from './index'
import { render, screen } from '@testing-library/react'

const doc = { root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 } } as never

describe('HighImpactHero', () => {
  it('renders rich text and links', () => {
    render(
      <HighImpactHero
        type="highImpact"
        links={[]}
        media={null as never}
        richText={doc}
      />,
    )
    expect(document.querySelector('[data-theme="dark"]')).toBeInTheDocument()
  })
})
