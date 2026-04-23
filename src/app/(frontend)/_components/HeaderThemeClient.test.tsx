const mockSetHeaderTheme = jest.fn()
jest.mock('@/providers/HeaderTheme', () => ({
  useHeaderTheme: () => ({ setHeaderTheme: mockSetHeaderTheme }),
}))

import HeaderThemeClient from './HeaderThemeClient'
import { render, waitFor } from '@testing-library/react'
describe('HeaderThemeClient', () => {
  it('sets the document theme from props', async () => {
    render(<HeaderThemeClient theme="light" />)
    await waitFor(() => expect(mockSetHeaderTheme).toHaveBeenCalledWith('light'))
  })
})
