import type { CollectionConfig } from 'payload'
import { authenticated } from '@/access/authenticated'

export interface WixCollectionDefinition {
  sourceCollectionId: string
  slug: string
  label: string
}

interface WixCollectionAdminOverride {
  defaultColumns?: string[]
  derivedTextFields?: string[]
  includeTitleField?: boolean
  useAsTitle?: string
}

function formatAdminFieldLabel(fieldName: string): string {
  const noSuffix = fieldName.replace(/_fld$/u, '')
  return noSuffix
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export const wixCollectionDefinitions: WixCollectionDefinition[] = [
  { sourceCollectionId: 'AboutUsList', slug: 'about-us-list', label: 'About Us List' },
  { sourceCollectionId: 'ContactUs', slug: 'contact-us', label: 'Contact Us' },
  {
    sourceCollectionId: 'CountrySelection',
    slug: 'country-selection',
    label: 'Country Selection',
  },
  { sourceCollectionId: 'FundAttributes', slug: 'fund-attributes', label: 'Fund Attributes' },
  { sourceCollectionId: 'FundDetails', slug: 'fund-details', label: 'Fund Details' },
  {
    sourceCollectionId: 'GeographicAllocations',
    slug: 'geographic-allocations',
    label: 'Geographic Allocations',
  },
  { sourceCollectionId: 'Homepagelinks', slug: 'homepage-links', label: 'Homepage Links' },
  { sourceCollectionId: 'Import1', slug: 'import-usd', label: 'Import USD' },
  { sourceCollectionId: 'ImportCHF', slug: 'import-chf', label: 'Import CHF' },
  {
    sourceCollectionId: 'InvestmentProcess',
    slug: 'investment-process',
    label: 'Investment Process',
  },
  {
    sourceCollectionId: 'LegalInformmation',
    slug: 'legal-information',
    label: 'Legal Information',
  },
  {
    sourceCollectionId: 'MegatrendDataset',
    slug: 'megatrend-dataset',
    label: 'Megatrend Dataset',
  },
  {
    sourceCollectionId: 'MegatrendsAllocations',
    slug: 'megatrends-allocations',
    label: 'Megatrends Allocations',
  },
  {
    sourceCollectionId: 'MegatrendsDetail',
    slug: 'megatrends-detail',
    label: 'Megatrends Detail',
  },
  { sourceCollectionId: 'Members/Badges', slug: 'members-badges', label: 'Members Badges' },
  {
    sourceCollectionId: 'Members/FullData',
    slug: 'members-full-data',
    label: 'Members Full Data',
  },
  {
    sourceCollectionId: 'Members/PrivateMembersData',
    slug: 'members-private-data',
    label: 'Members Private Data',
  },
  {
    sourceCollectionId: 'Members/PublicData',
    slug: 'members-public-data',
    label: 'Members Public Data',
  },
  { sourceCollectionId: 'MenuList', slug: 'menu-list', label: 'Menu List' },
  {
    sourceCollectionId: 'PortfolioStrategyProcess',
    slug: 'portfolio-strategy-process',
    label: 'Portfolio Strategy Process',
  },
  { sourceCollectionId: 'PrivacyPolicy', slug: 'privacy-policy', label: 'Privacy Policy' },
  {
    sourceCollectionId: 'SectorAllocations',
    slug: 'sector-allocations',
    label: 'Sector Allocations',
  },
  { sourceCollectionId: 'TopHoldings', slug: 'top-holdings', label: 'Top Holdings' },
  { sourceCollectionId: 'TrustList', slug: 'trust-list', label: 'Trust List' },
]

const wixCollectionAdminOverrides: Record<string, WixCollectionAdminOverride> = {
  'fund-attributes': {
    defaultColumns: ['title_fld', 'description_fld', 'icon_fld', 'sourceItemId', 'updatedAt'],
    derivedTextFields: ['description_fld', 'icon_fld'],
    includeTitleField: true,
    useAsTitle: 'description_fld',
  },
}

function getTextFieldValue(
  fields: unknown,
  key: string,
): string | null {
  if (!Array.isArray(fields)) return null
  const match = fields.find((entry) => {
    const entryRecord = entry as { key?: unknown; value?: unknown }
    return entryRecord?.key === key && typeof entryRecord.value === 'string' && entryRecord.value.trim().length > 0
  }) as { value?: unknown } | undefined

  return typeof match?.value === 'string' ? match.value.trim() : null
}

function resolveWixDocTitle(data: unknown, fallback?: string): string {
  if (!data || typeof data !== 'object') return fallback || ''

  const record = data as {
    title_fld?: unknown
    data?: unknown
    textFields?: unknown
  }

  if (typeof record.title_fld === 'string' && record.title_fld.trim().length > 0) {
    return record.title_fld.trim()
  }

  const nestedData = record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : null
  const fromData = nestedData?.title_fld
  if (typeof fromData === 'string' && fromData.trim().length > 0) {
    return fromData.trim()
  }

  const fromTextFields = getTextFieldValue(record.textFields, 'title_fld')
  if (fromTextFields) return fromTextFields

  return fallback || ''
}

function resolveWixFieldValue(data: unknown, key: string, fallback?: string): string {
  if (!data || typeof data !== 'object') return fallback || ''

  const record = data as {
    [key: string]: unknown
    data?: unknown
    textFields?: unknown
  }

  const rootValue = record[key]
  if (typeof rootValue === 'string' && rootValue.trim().length > 0) {
    return rootValue.trim()
  }

  const nestedData = record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : null
  const nestedValue = nestedData?.[key]
  if (typeof nestedValue === 'string' && nestedValue.trim().length > 0) {
    return nestedValue.trim()
  }

  const fromTextFields = getTextFieldValue(record.textFields, key)
  if (fromTextFields) return fromTextFields

  return fallback || ''
}

function buildWixCollection(def: WixCollectionDefinition): CollectionConfig {
  const adminOverride = wixCollectionAdminOverrides[def.slug]
  const derivedTextFields = adminOverride?.derivedTextFields ?? []
  const includeTitleField = adminOverride?.includeTitleField ?? true
  const useAsTitle = adminOverride?.useAsTitle ?? (includeTitleField ? 'title_fld' : 'sourceItemId')

  return {
    slug: def.slug,
    labels: {
      singular: def.label,
      plural: def.label,
    },
    access: {
      create: authenticated,
      delete: authenticated,
      read: authenticated,
      update: authenticated,
    },
    admin: {
      useAsTitle,
      defaultColumns: adminOverride?.defaultColumns ?? ['title_fld', 'sourceItemId', 'updatedAt'],
      group: 'Wix',
    },
    fields: [
      {
        name: 'sourceCollectionId',
        type: 'text',
        required: true,
        defaultValue: def.sourceCollectionId,
        index: true,
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'sourceItemId',
        type: 'text',
        required: true,
        index: true,
      },
      ...(includeTitleField
        ? [
            {
              name: 'title_fld',
              type: 'text' as const,
              index: true,
              admin: {
                readOnly: true,
                description: 'Derived from source data for easier admin list browsing.',
              },
            },
          ]
        : []),
      ...derivedTextFields.map((fieldName) => ({
        name: fieldName,
        label: formatAdminFieldLabel(fieldName),
        type: 'text' as const,
        index: true,
        admin: {
          readOnly: true,
          description: `Derived from source text field "${fieldName}" for easier table browsing.`,
        },
      })),
      {
        name: 'sourceUpdatedAt',
        type: 'date',
      },
      {
        name: 'textFields',
        type: 'array',
        admin: {
          initCollapsed: true,
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'value', type: 'text', required: true },
        ],
      },
      {
        name: 'numberFields',
        type: 'array',
        admin: {
          initCollapsed: true,
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'value', type: 'number', required: true },
        ],
      },
      {
        name: 'booleanFields',
        type: 'array',
        admin: {
          initCollapsed: true,
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'value', type: 'checkbox', required: true },
        ],
      },
      {
        name: 'dateFields',
        type: 'array',
        admin: {
          initCollapsed: true,
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'value', type: 'date', required: true },
        ],
      },
      {
        name: 'objectFields',
        type: 'array',
        admin: {
          initCollapsed: true,
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          { name: 'value', type: 'json', required: true },
        ],
      },
      {
        name: 'mediaFields',
        type: 'array',
        admin: {
          initCollapsed: true,
          description: 'Optional media links keyed by source field name.',
        },
        fields: [
          { name: 'key', type: 'text', required: true },
          {
            name: 'value',
            type: 'upload',
            relationTo: 'media',
            required: true,
          },
        ],
      },
      {
        name: 'data',
        type: 'json',
        required: true,
        admin: {
          description: 'Raw Wix payload retained for traceability.',
        },
      },
    ],
    indexes: [
      {
        fields: ['sourceItemId'],
        unique: true,
      },
    ],
    hooks: {
      afterRead: [
        ({ doc }) => {
          if (!doc || typeof doc !== 'object' || derivedTextFields.length === 0) {
            return doc
          }

          const nextDoc = { ...(doc as Record<string, unknown>) }
          for (const fieldName of derivedTextFields) {
            const existingValue = typeof nextDoc[fieldName] === 'string' ? String(nextDoc[fieldName] ?? '') : ''
            const derivedValue = resolveWixFieldValue(nextDoc, fieldName, existingValue)
            if (derivedValue) {
              nextDoc[fieldName] = derivedValue
            }
          }

          if (!includeTitleField && 'title_fld' in nextDoc) {
            delete nextDoc.title_fld
          }

          return nextDoc
        },
      ],
      beforeValidate: [
        ({ data, originalDoc }) => {
          const docData = data || {}
          const nextData: Record<string, unknown> = { ...docData }

          if (includeTitleField) {
            const existingTitle =
              typeof (originalDoc as { title_fld?: unknown } | undefined)?.title_fld === 'string'
                ? ((originalDoc as { title_fld?: string }).title_fld ?? '')
                : ''
            const resolvedTitle = resolveWixDocTitle(docData, existingTitle)

            if (resolvedTitle) {
              nextData.title_fld = resolvedTitle
            }
          } else if ('title_fld' in nextData) {
            delete nextData.title_fld
          }

          for (const fieldName of derivedTextFields) {
            const existingValue =
              typeof (originalDoc as Record<string, unknown> | undefined)?.[fieldName] === 'string'
                ? String((originalDoc as Record<string, unknown>)[fieldName] ?? '')
                : ''
            const derivedValue = resolveWixFieldValue(docData, fieldName, existingValue)
            if (derivedValue) {
              nextData[fieldName] = derivedValue
            }
          }

          return nextData
        },
      ],
    },
  }
}

export const wixCollectionSlugById = Object.fromEntries(
  wixCollectionDefinitions.map((def) => [def.sourceCollectionId, def.slug]),
) as Record<string, string>

export const WixCollections: CollectionConfig[] = wixCollectionDefinitions.map(buildWixCollection)
