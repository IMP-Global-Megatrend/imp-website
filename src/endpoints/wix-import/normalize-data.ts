export type NormalizedWixFields = {
  textFields: Array<{ key: string; value: string }>
  numberFields: Array<{ key: string; value: number }>
  booleanFields: Array<{ key: string; value: boolean }>
  dateFields: Array<{ key: string; value: string }>
  objectFields: Array<{ key: string; value: unknown }>
}

const EXCLUDED_WIX_KEYS = new Set(['_createdDate', '_updatedDate', '_owner', '_id'])

function isWixDateObject(value: unknown): value is { $date: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$date' in value &&
    typeof (value as { $date?: unknown }).$date === 'string'
  )
}

function isISODate(value: string): boolean {
  if (!value) return false
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return false
  return /^\d{4}-\d{2}-\d{2}T/.test(value)
}

function toJSONSafeValue(value: unknown): unknown {
  if (value === null || value === undefined) return undefined
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return undefined
  }
}

export function normalizeWixDataFields(data: Record<string, unknown>): NormalizedWixFields {
  const normalized: NormalizedWixFields = {
    textFields: [],
    numberFields: [],
    booleanFields: [],
    dateFields: [],
    objectFields: [],
  }

  const entries = Object.entries(data)
  for (const [key, value] of entries) {
    if (EXCLUDED_WIX_KEYS.has(key)) {
      continue
    }

    if (typeof value === 'string') {
      if (value === '') {
        continue
      }

      if (isISODate(value)) {
        normalized.dateFields.push({ key, value })
      } else {
        normalized.textFields.push({ key, value })
      }
      continue
    }

    if (typeof value === 'number') {
      normalized.numberFields.push({ key, value })
      continue
    }

    if (typeof value === 'boolean') {
      normalized.booleanFields.push({ key, value })
      continue
    }

    if (isWixDateObject(value)) {
      normalized.dateFields.push({ key, value: value.$date })
      continue
    }

    const jsonSafeValue = toJSONSafeValue(value)
    if (jsonSafeValue !== undefined) {
      normalized.objectFields.push({ key, value: jsonSafeValue })
    }
  }

  return normalized
}

export function sanitizeWixRawData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (EXCLUDED_WIX_KEYS.has(key)) continue

    const jsonSafeValue = toJSONSafeValue(value)
    if (jsonSafeValue !== undefined) {
      sanitized[key] = jsonSafeValue
    }
  }

  return sanitized
}
