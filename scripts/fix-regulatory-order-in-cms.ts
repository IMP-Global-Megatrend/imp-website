// @ts-nocheck
import config from '@payload-config'
import { getPayload } from 'payload'

type CMSDoc = Record<string, unknown>

const DESIRED_ORDER = [
  'regulatory structure',
  'portfolio manager',
  'fund administrator',
  'custodian bank',
  'audit company',
  'liechtenstein',
  'switzerland',
  'tax transparency',
  'sales restrictions',
  'sfdr',
]

function normalizeLabel(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ')
  if (normalized === 'lichtenstein') return 'liechtenstein'
  return normalized
}

function titleCaseLabel(value: string): string {
  const normalized = normalizeLabel(value)
  if (normalized === 'sfdr') return 'SFDR'
  if (normalized === 'liechtenstein') return 'Liechtenstein'
  return normalized
    .split(' ')
    .map((part) => (part ? part[0]!.toUpperCase() + part.slice(1) : part))
    .join(' ')
}

function upsertTextField(
  textFields: Array<{ key?: unknown; value?: unknown }>,
  key: string,
  value: string,
) {
  const idx = textFields.findIndex((entry) => entry?.key === key)
  if (idx >= 0) {
    textFields[idx] = { ...(textFields[idx] as object), key, value }
  } else {
    textFields.push({ key, value })
  }
}

async function main() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'trust-list',
    limit: 200,
    pagination: false,
    depth: 0,
  })

  const docs = (result.docs ?? []) as CMSDoc[]

  for (const doc of docs) {
    const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
    const currentLabel =
      (typeof data.title_fld === 'string' && data.title_fld.trim()) ||
      (Array.isArray(doc.textFields)
        ? String(
            (doc.textFields as Array<{ key?: unknown; value?: unknown }>).find((x) => x?.key === 'title_fld')
              ?.value ?? '',
          ).trim()
        : '')
    if (!currentLabel) continue

    const normalized = normalizeLabel(currentLabel)
    const orderIndex = DESIRED_ORDER.indexOf(normalized)
    if (orderIndex === -1) continue

    const canonicalLabel = titleCaseLabel(currentLabel)
    const manualSort = String(100 - orderIndex).padStart(3, '0')

    const textFields = Array.isArray(doc.textFields)
      ? [...(doc.textFields as Array<{ key?: unknown; value?: unknown }>)]
      : []
    upsertTextField(textFields, 'title_fld', canonicalLabel)
    upsertTextField(textFields, '_manualSort_', manualSort)

    const updatedData = {
      ...data,
      title_fld: canonicalLabel,
      _manualSort: manualSort,
    }

    await payload.update({
      collection: 'trust-list',
      id: doc.id as string,
      depth: 0,
      data: {
        data: updatedData,
        textFields,
      },
    })
  }

  const verify = await payload.find({
    collection: 'trust-list',
    limit: 200,
    pagination: false,
    depth: 0,
  })
  const ordered = (verify.docs as CMSDoc[])
    .map((doc) => {
      const data = (doc.data && typeof doc.data === 'object' ? doc.data : {}) as Record<string, unknown>
      return {
        label: String(data.title_fld ?? ''),
        sort: String(data._manualSort ?? ''),
      }
    })
    .sort((a, b) => b.sort.localeCompare(a.sort))

  console.log(JSON.stringify(ordered, null, 2))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
