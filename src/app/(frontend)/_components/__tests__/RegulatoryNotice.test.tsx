jest.mock('../getHomeCMSContent', () => ({
  getHomeCMSContent: jest.fn().mockResolvedValue({
    regulatoryNotice: {
      title: 'Important',
      body: 'Read this carefully.',
    },
  }),
}))

import { RegulatoryNotice } from '../RegulatoryNotice'
import { render, screen } from '@testing-library/react'

describe('RegulatoryNotice', () => {
  it('renders CMS regulatory copy', async () => {
    const ui = await RegulatoryNotice()
    render(ui)

    expect(screen.getByText('Important')).toBeInTheDocument()
    expect(screen.getByText('Read this carefully.')).toBeInTheDocument()
  })
})
