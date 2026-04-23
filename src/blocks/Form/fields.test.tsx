jest.mock('@/components/RichText', () => ({ __esModule: true, default: () => null }))

import { fields } from './fields'

describe('form fields map', () => {
  it('registers all expected field types', () => {
    expect(Object.keys(fields).sort()).toEqual(
      ['checkbox', 'country', 'email', 'message', 'number', 'select', 'state', 'text', 'textarea'].sort(),
    )
  })
})
