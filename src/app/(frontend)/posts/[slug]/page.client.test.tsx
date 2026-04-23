import PageClient from './page.client'
import { render, screen } from '@testing-library/react'
jest.mock('@/app/(frontend)/_components/CMSPageContent', () => () => <div>p</div>)
describe('page.client post slug', () => {
  it('renders', () => { render(<PageClient />); expect(document.body).toBeTruthy() })
})
