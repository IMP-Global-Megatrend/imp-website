import canUseDOM from '../canUseDOM'

describe('canUseDOM', () => {
  it('is true under jsdom', () => {
    expect(canUseDOM).toBe(true)
  })
})
