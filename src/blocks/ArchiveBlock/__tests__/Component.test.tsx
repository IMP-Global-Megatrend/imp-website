jest.mock('@payload-config', () => ({ __esModule: true, default: Promise.resolve({}) }))

jest.mock('../../../payload.config', () => ({ __esModule: true, default: Promise.resolve({}) }))

jest.mock('payload', () => ({
  getPayload: jest.fn(),
}))

jest.mock('@/components/RichText', () => ({
  __esModule: true,
  default: () => <div data-testid="intro">intro</div>,
}))

jest.mock('@/components/CollectionArchive', () => ({
  CollectionArchive: ({ posts }: { posts: { length: number } }) => (
    <div data-testid="collection-archive">{posts.length}</div>
  ),
}))

import { ArchiveBlock } from '../Component'
import { render, screen } from '@testing-library/react'

describe('ArchiveBlock', () => {
  it('renders selected posts without calling Payload', async () => {
    const ui = await ArchiveBlock({
      id: 'block-1',
      blockType: 'archive',
      populateBy: 'selection',
      selectedDocs: [
        {
          relationTo: 'posts',
          value: { id: 1, slug: 'hello', title: 'Hello' },
        },
      ],
      introContent: {} as never,
    } as never)

    render(ui)

    expect(screen.getByTestId('intro')).toBeInTheDocument()
    expect(screen.getByTestId('collection-archive')).toHaveTextContent('1')
  })
})
