import { CursorAttrSanitizer } from './CursorAttrSanitizer'
import { render } from '@testing-library/react'
describe('CursorAttrSanitizer', () => {
  it('returns null in tests', () => {
    const { container } = render(<CursorAttrSanitizer />)
    expect(container.firstChild).toBeNull()
  })
})
