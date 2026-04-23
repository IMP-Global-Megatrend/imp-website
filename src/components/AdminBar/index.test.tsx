jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }), useSelectedLayoutSegments: () => [] }))
jest.mock('@/utilities/getURL', () => ({ getClientSideURL: () => 'http://x' }))
jest.mock('@payloadcms/admin-bar', () => ({ PayloadAdminBar: () => <div>bar</div> }))
import { AdminBar } from './index'
import { render } from '@testing-library/react'
const user = { id: 1, email: 'a@a.com' } as never
describe('AdminBar', () => {
  it('can render the bar shell', () => {
    const { getByText } = render(
      <AdminBar
        collectionLabels={{} as never}
        id={0}
        collection="pages"
        preview={false}
        key={0}
        user={user}
        docLabel="d"
        docID={0}
        modifiedAt=""
        onPreviewExit={jest.fn()}
        className="x"
      />,
    )
    expect(getByText('bar')).toBeInTheDocument()
  })
})
