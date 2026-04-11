import { resolvePageHeroCopy } from '../resolvePageHeroCopy'

describe('resolvePageHeroCopy', () => {
  it('uses fallback title when page has no legacy fields', () => {
    expect(resolvePageHeroCopy({ page: {}, fallbackTitle: '  Default  ' })).toEqual({
      title: 'Default',
      subtitle: undefined,
    })
  })

  it('prefers legacy title keys over fallback', () => {
    expect(
      resolvePageHeroCopy({
        page: { legacyTitle: '  From page  ', other: 'x' },
        fallbackTitle: 'Ignored',
        legacyTitleKeys: ['missing', 'legacyTitle'],
      }),
    ).toEqual({ title: 'From page', subtitle: undefined })
  })

  it('resolves subtitle from legacy keys or fallback', () => {
    expect(
      resolvePageHeroCopy({
        page: { sub: '  Line  ' },
        fallbackTitle: 'T',
        fallbackSubtitle: 'ignored',
        legacySubtitleKeys: ['sub'],
      }),
    ).toEqual({ title: 'T', subtitle: 'Line' })

    expect(
      resolvePageHeroCopy({
        page: {},
        fallbackTitle: 'T',
        fallbackSubtitle: '  Sub  ',
      }),
    ).toEqual({ title: 'T', subtitle: 'Sub' })
  })

  it('returns empty title when nothing valid is provided', () => {
    expect(resolvePageHeroCopy({ page: null, fallbackTitle: '   ' })).toEqual({
      title: '',
      subtitle: undefined,
    })
  })
})
