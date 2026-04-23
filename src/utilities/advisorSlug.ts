/**
 * URL slugs for `/advisors/[slug]`. Aligned with `key` in `scripts/seed-advisory-board.ts`
 * for known names so backfill and seed stay consistent.
 */
const KNOWN_NAME_TO_SLUG: Readonly<Record<string, string>> = {
  'Alois J. Wiederkehr': 'alois-j-wiederkehr',
  'Karl Bieri': 'karl-bieri',
  'Dominik Burkart': 'dominik-burkart',
  'Julius Hargitai': 'julius-hargitai',
  'Jens Kruse': 'jens-kruse',
  'Dr. med. univ. Bianca Sacherer': 'bianca-sacherer',
}

function slugFromLabel(label: string): string {
  const t = label
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  return t
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

/** Deterministic public slug from display name. Use `id` to break ties when de-duplicating. */
/** Public URL slug for a display name (no DB id suffix). */
export function advisorPublicSlugFromName(name: string): string {
  const trimmed = name.trim()
  if (KNOWN_NAME_TO_SLUG[trimmed]) return KNOWN_NAME_TO_SLUG[trimmed]
  return slugFromLabel(trimmed) || 'advisor'
}

/**
 * For bulk backfill: same as `advisorPublicSlugFromName` for known names; else generic slug
 * (no id suffix) so we can de-dupe in a second pass.
 */
export function advisorSlugCandidateFromName(name: string): string {
  const trimmed = name.trim()
  if (KNOWN_NAME_TO_SLUG[trimmed]) return KNOWN_NAME_TO_SLUG[trimmed]
  return slugFromLabel(trimmed) || 'advisor'
}

/** De-duplicate slugs: second occurrence of a base gets `-{id}`. */
export function uniqueAdvisorSlugs(
  rows: Array<{ id: string | number; name: string }>,
): Map<string | number, string> {
  const used = new Set<string>()
  const out = new Map<string | number, string>()

  for (const { id, name } of rows) {
    const base = advisorSlugCandidateFromName(name)
    let s = base
    if (used.has(s)) s = `${base}-${String(id)}`
    used.add(s)
    out.set(id, s)
  }

  return out
}
