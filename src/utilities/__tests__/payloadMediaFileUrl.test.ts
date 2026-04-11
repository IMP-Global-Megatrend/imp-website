import {
  buildPayloadMediaFileHrefFromFilename,
  resolveApiMediaFileOrSupabasePath,
} from '../payloadMediaFileUrl'

describe('buildPayloadMediaFileHrefFromFilename', () => {
  it('returns empty string for blank input', () => {
    expect(buildPayloadMediaFileHrefFromFilename('')).toBe('')
    expect(buildPayloadMediaFileHrefFromFilename('   ')).toBe('')
  })

  it('builds a single-segment path', () => {
    expect(buildPayloadMediaFileHrefFromFilename('photo.jpg')).toBe('/api/media/file/photo.jpg')
  })

  it('encodes each path segment', () => {
    expect(buildPayloadMediaFileHrefFromFilename('folder/my file.png')).toBe(
      '/api/media/file/folder/my%20file.png',
    )
  })
})

describe('resolveApiMediaFileOrSupabasePath', () => {
  const snapshot = { ...process.env }

  afterEach(() => {
    process.env = { ...snapshot } as NodeJS.ProcessEnv
  })

  it('returns empty string when path is not a Payload media file URL', () => {
    expect(resolveApiMediaFileOrSupabasePath('/some/other')).toBe('')
  })

  it('returns the original path when Supabase env is not configured', () => {
    process.env = { ...snapshot } as NodeJS.ProcessEnv
    Reflect.deleteProperty(process.env, 'S3_ENDPOINT')
    Reflect.deleteProperty(process.env, 'S3_BUCKET')

    const path = '/api/media/file/hero.jpg'
    expect(resolveApiMediaFileOrSupabasePath(path)).toBe(path)
  })

  it('returns a public Supabase object URL when S3 env vars are set', () => {
    process.env = {
      ...snapshot,
      S3_ENDPOINT: 'https://abcdefgh.supabase.co',
      S3_BUCKET: 'site-media',
    } as NodeJS.ProcessEnv

    const resolved = resolveApiMediaFileOrSupabasePath('/api/media/file/folder%2Ffile.jpg')
    expect(resolved).toBe(
      'https://abcdefgh.supabase.co/storage/v1/object/public/site-media/folder/file.jpg',
    )
  })

  it('strips query and hash before resolving', () => {
    process.env = {
      ...snapshot,
      S3_ENDPOINT: 'https://abcdefgh.supabase.co',
      S3_BUCKET: 'site-media',
    } as NodeJS.ProcessEnv

    const resolved = resolveApiMediaFileOrSupabasePath('/api/media/file/a.png?v=1#frag')
    expect(resolved).toContain('/storage/v1/object/public/site-media/')
    expect(resolved).toContain('a.png')
    expect(resolved).not.toContain('?v=1')
  })
})
