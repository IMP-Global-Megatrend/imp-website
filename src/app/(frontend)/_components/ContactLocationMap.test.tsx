jest.mock('maplibre-gl', () => ({
  Map: class {
    on() {
      return this
    }
    remove() {}
  },
}))

import { ContactLocationMap } from './ContactLocationMap'
import { render } from '@testing-library/react'

describe('ContactLocationMap', () => {
  it('mounts', () => {
    const { container } = render(<ContactLocationMap />)
    expect(container.firstChild).toBeInTheDocument()
  })
})
