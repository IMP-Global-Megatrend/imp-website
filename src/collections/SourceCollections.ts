import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export interface WixCollectionDefinition {
  sourceCollectionId: string
  slug: string
  label: string
}

export const wixCollectionDefinitions: WixCollectionDefinition[] = [
  { sourceCollectionId: 'AboutUsList', slug: 'wix-about-us-list', label: 'Wix About Us List' },
  { sourceCollectionId: 'ContactUs', slug: 'wix-contact-us', label: 'Wix Contact Us' },
  {
    sourceCollectionId: 'CountrySelection',
    slug: 'wix-country-selection',
    label: 'Wix Country Selection',
  },
  { sourceCollectionId: 'FundAttributes', slug: 'wix-fund-attributes', label: 'Wix Fund Attributes' },
  { sourceCollectionId: 'FundDetails', slug: 'wix-fund-details', label: 'Wix Fund Details' },
  {
    sourceCollectionId: 'GeographicAllocations',
    slug: 'wix-geographic-allocations',
    label: 'Wix Geographic Allocations',
  },
  { sourceCollectionId: 'Homepagelinks', slug: 'wix-homepage-links', label: 'Wix Homepage Links' },
  { sourceCollectionId: 'Import1', slug: 'wix-import-usd', label: 'Wix Import USD' },
  { sourceCollectionId: 'ImportCHF', slug: 'wix-import-chf', label: 'Wix Import CHF' },
  {
    sourceCollectionId: 'InvestmentProcess',
    slug: 'wix-investment-process',
    label: 'Wix Investment Process',
  },
  {
    sourceCollectionId: 'LegalInformmation',
    slug: 'wix-legal-information',
    label: 'Wix Legal Information',
  },
  {
    sourceCollectionId: 'MegatrendDataset',
    slug: 'wix-megatrend-dataset',
    label: 'Wix Megatrend Dataset',
  },
  {
    sourceCollectionId: 'MegatrendsAllocations',
    slug: 'wix-megatrends-allocations',
    label: 'Wix Megatrends Allocations',
  },
  {
    sourceCollectionId: 'MegatrendsDetail',
    slug: 'wix-megatrends-detail',
    label: 'Wix Megatrends Detail',
  },
  { sourceCollectionId: 'Members/Badges', slug: 'wix-members-badges', label: 'Wix Members Badges' },
  {
    sourceCollectionId: 'Members/FullData',
    slug: 'wix-members-full-data',
    label: 'Wix Members Full Data',
  },
  {
    sourceCollectionId: 'Members/PrivateMembersData',
    slug: 'wix-members-private-data',
    label: 'Wix Members Private Data',
  },
  {
    sourceCollectionId: 'Members/PublicData',
    slug: 'wix-members-public-data',
    label: 'Wix Members Public Data',
  },
  { sourceCollectionId: 'MenuList', slug: 'wix-menu-list', label: 'Wix Menu List' },
  {
    sourceCollectionId: 'PortfolioStrategyProcess',
    slug: 'wix-portfolio-strategy-process',
    label: 'Wix Portfolio Strategy Process',
  },
  { sourceCollectionId: 'PrivacyPolicy', slug: 'wix-privacy-policy', label: 'Wix Privacy Policy' },
  {
    sourceCollectionId: 'SectorAllocations',
    slug: 'wix-sector-allocations',
    label: 'Wix Sector Allocations',
  },
  { sourceCollectionId: 'TopHoldings', slug: 'wix-top-holdings', label: 'Wix Top Holdings' },
  { sourceCollectionId: 'TrustList', slug: 'wix-trust-list', label: 'Wix Trust List' },
]

function buildWixCollection(def: WixCollectionDefinition): CollectionConfig {
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
      useAsTitle: 'sourceItemId',
      defaultColumns: ['sourceItemId', 'updatedAt'],
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
  }
}

export const wixCollectionSlugById = Object.fromEntries(
  wixCollectionDefinitions.map((def) => [def.sourceCollectionId, def.slug]),
) as Record<string, string>

export const WixCollections: CollectionConfig[] = wixCollectionDefinitions.map(buildWixCollection)
