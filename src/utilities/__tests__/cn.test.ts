import { cn } from '../ui'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('resolves conflicting Tailwind utilities later in the list wins', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('drops falsy inputs', () => {
    expect(cn('block', false && 'hidden', 'flex')).toBe('flex')
  })
})
