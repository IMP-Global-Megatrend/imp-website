import {
  normalizeFilenameForSupabaseObjectKey,
  normalizeSupabasePublicObjectUrl,
  resolveSupabasePublicMediaUrl,
} from '../resolveSupabasePublicMediaUrl'

describe('normalizeFilenameForSupabaseObjectKey', () => {
  it('returns empty string for blank input', () => {
    expect(normalizeFilenameForSupabaseObjectKey('')).toBe('')
    expect(normalizeFilenameForSupabaseObjectKey('  ')).toBe('')
  })

  it('returns stable output when no percent-encoding remains', () => {
    expect(normalizeFilenameForSupabaseObjectKey('folder/file.jpg')).toBe('folder/file.jpg')
  })

  it('iteratively decodes percent-encoded segments', () => {
    expect(normalizeFilenameForSupabaseObjectKey('a%2520b')).toBe('a b')
  })
})

describe('resolveSupabasePublicMediaUrl', () => {
  const snapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...snapshot } as NodeJS.ProcessEnv
  })

  it('returns null for empty filename or missing env', () => {
    expect(resolveSupabasePublicMediaUrl('')).toBeNull()

    process.env = { ...snapshot } as NodeJS.ProcessEnv
    Reflect.deleteProperty(process.env, 'S3_ENDPOINT')
    Reflect.deleteProperty(process.env, 'S3_BUCKET')
    expect(resolveSupabasePublicMediaUrl('x.png')).toBeNull()
  })

  it('builds a storage URL from endpoint origin and bucket', () => {
    process.env = {
      ...snapshot,
      S3_ENDPOINT: 'https://project.supabase.co/',
      S3_BUCKET: 'media-bucket',
    } as NodeJS.ProcessEnv

    expect(resolveSupabasePublicMediaUrl('sub/key.png')).toBe(
      'https://project.supabase.co/storage/v1/object/public/media-bucket/sub/key.png',
    )
  })
})

describe('normalizeSupabasePublicObjectUrl', () => {
  const snapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...snapshot } as NodeJS.ProcessEnv
  })

  it('returns the URL unchanged when it is not a Supabase public object URL', () => {
    expect(normalizeSupabasePublicObjectUrl('https://example.com/file.png')).toBe(
      'https://example.com/file.png',
    )
  })

  it('returns unchanged when bucket env does not match path', () => {
    process.env = { ...snapshot, S3_BUCKET: 'my-bucket' } as NodeJS.ProcessEnv
    const url = 'https://x.supabase.co/storage/v1/object/public/other-bucket/a.png'
    expect(normalizeSupabasePublicObjectUrl(url)).toBe(url)
  })

  it('re-encodes the object key segment after the bucket when possible', () => {
    process.env = { ...snapshot, S3_BUCKET: 'my-bucket' } as NodeJS.ProcessEnv
    const url =
      'https://x.supabase.co/storage/v1/object/public/my-bucket/folder%252Ffile.png'
    const out = normalizeSupabasePublicObjectUrl(url)
    expect(out).toContain('/storage/v1/object/public/my-bucket/')
    expect(out.startsWith('https://x.supabase.co')).toBe(true)
  })
})
