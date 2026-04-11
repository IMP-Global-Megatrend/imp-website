describe('mergeOpenGraph', () => {
  const snapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...snapshot } as NodeJS.ProcessEnv
    jest.resetModules()
  })

  it('merges caller fields into defaults and keeps default images when og has no images', async () => {
    process.env = {
      ...snapshot,
      NODE_ENV: 'test',
      NEXT_PUBLIC_SERVER_URL: 'https://merge-test.example',
    } as NodeJS.ProcessEnv
    jest.resetModules()
    const { mergeOpenGraph } = await import('../mergeOpenGraph')
    const merged = mergeOpenGraph({ title: 'Page title' })
    expect(merged?.title).toBe('Page title')
    const images = merged?.images
    const first = Array.isArray(images) ? images[0] : images
    expect(first && typeof first === 'object' && 'url' in first && String(first.url)).toContain(
      'https://merge-test.example',
    )
  })

  it('replaces images when caller provides images', async () => {
    process.env = {
      ...snapshot,
      NODE_ENV: 'test',
      NEXT_PUBLIC_SERVER_URL: 'https://merge-test.example',
    } as NodeJS.ProcessEnv
    jest.resetModules()
    const { mergeOpenGraph } = await import('../mergeOpenGraph')
    const merged = mergeOpenGraph({
      images: [{ url: 'https://cdn.example/og.png' }],
    })
    const images = merged?.images
    const list = Array.isArray(images) ? images : images != null ? [images] : []
    expect(list.some((img) => typeof img === 'object' && img && 'url' in img && img.url === 'https://cdn.example/og.png')).toBe(
      true,
    )
  })
})
