jest.mock('@/app/(frontend)/_components/LightHeaderPageClient', () => () => null)

import { ArticlesArchiveLayout } from './ArticlesArchiveLayout'
import { render, screen } from '@testing-library/react'

describe('ArticlesArchiveLayout', () => {
  it('renders the hero title and articles list', () => {
    render(
      <ArticlesArchiveLayout
        heroTitle="Articles"
        heroSubtitle="S"
        breadcrumbItems={[{ label: 'Home', href: '/' }, { label: 'Articles', href: '/articles' }]}
        posts={[]}
        currentPage={1}
        totalPages={1}
        totalDocs={0}
        basePath="/articles"
        categoryLinks={[]}
      />,
    )
    expect(screen.getByRole('heading', { level: 1, name: 'Articles' })).toBeInTheDocument()
  })
})
