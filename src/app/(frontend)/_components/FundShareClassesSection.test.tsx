import { FundShareClassesSection } from './FundShareClassesSection'
import { render, screen } from '@testing-library/react'
const c = (title: string) => ({
  title,
  feeLabel: 'F',
  feeText: 't',
  isin: 'i',
  wkn: 'w',
  bloomberg: 'b',
} as never)
describe('FundShareClassesSection', () => {
  it('renders share class columns', () => {
    render(
      <FundShareClassesSection
        usdContent={c('USD')}
        chfContent={c('CHF')}
        shareClassMeta={null}
      />,
    )
    expect(screen.getByText('USD', { exact: true })).toBeInTheDocument()
  })
})
