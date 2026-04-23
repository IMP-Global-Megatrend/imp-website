jest.mock('./getHomeCMSContent', () => ({
  getHomeCMSContent: jest.fn().mockResolvedValue({
    exploreMegatrendsCard: { title: 'T', imageUrl: 'https://example.com/x.png' },
    downloads: [{ id: 'facts', label: 'Factsheet', href: 'https://a.com' }],
  } as never),
}))

jest.mock('@/app/(frontend)/_components/ActionLinkButton', () => ({
  ActionLinkButton: () => <span>btn</span>,
}))

import { BottomGrid, ExploreMegatrendsCard } from './BottomGrid'
import { render, screen } from '@testing-library/react'

describe('BottomGrid', () => {
  it('renders ExploreMegatrendsCard with CMS data', async () => {
    const el = await ExploreMegatrendsCard()
    if (el) render(el)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders section titles', async () => {
    const el = await BottomGrid()
    render(el)
    expect(screen.getByText('See Performance')).toBeInTheDocument()
  })
})
