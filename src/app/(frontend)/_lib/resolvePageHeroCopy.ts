type HeroPageRecord = unknown

type ResolvePageHeroCopyArgs = {
  page: HeroPageRecord
  fallbackTitle: string
  fallbackSubtitle?: string
  legacyTitleKeys?: string[]
  legacySubtitleKeys?: string[]
}

function asNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function pickFirstNonEmpty(page: HeroPageRecord, keys: string[]): string | undefined {
  if (!page || typeof page !== 'object') return undefined
  const pageRecord = page as Record<string, unknown>
  for (const key of keys) {
    const candidate = asNonEmptyString(pageRecord[key])
    if (candidate) return candidate
  }
  return undefined
}

export function resolvePageHeroCopy({
  page,
  fallbackTitle,
  fallbackSubtitle,
  legacyTitleKeys = [],
  legacySubtitleKeys = [],
}: ResolvePageHeroCopyArgs): { title: string; subtitle?: string } {
  const title = pickFirstNonEmpty(page, legacyTitleKeys) || asNonEmptyString(fallbackTitle) || ''

  const subtitle = pickFirstNonEmpty(page, legacySubtitleKeys) || asNonEmptyString(fallbackSubtitle)

  return {
    title,
    subtitle,
  }
}
