import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export interface WixCollectionDefinition {
  wixCollectionId: string
  slug: string
  label: string
}

export const wixCollectionDefinitions: WixCollectionDefinition[] = [
  { wixCollectionId: 'AboutUsList', slug: 'wix-about-us-list', label: 'Wix About Us List' },
  { wixCollectionId: 'ContactUs', slug: 'wix-contact-us', label: 'Wix Contact Us' },
  {
    wixCollectionId: 'CountrySelection',
    slug: 'wix-country-selection',
    label: 'Wix Country Selection',
  },
  { wixCollectionId: 'FundAttributes', slug: 'wix-fund-attributes', label: 'Wix Fund Attributes' },
  { wixCollectionId: 'FundDetails', slug: 'wix-fund-details', label: 'Wix Fund Details' },
  {
    wixCollectionId: 'GeographicAllocations',
    slug: 'wix-geographic-allocations',
    label: 'Wix Geographic Allocations',
  },
  { wixCollectionId: 'Homepagelinks', slug: 'wix-homepage-links', label: 'Wix Homepage Links' },
  { wixCollectionId: 'Import1', slug: 'wix-import-usd', label: 'Wix Import USD' },
  { wixCollectionId: 'ImportCHF', slug: 'wix-import-chf', label: 'Wix Import CHF' },
  {
    wixCollectionId: 'InvestmentProcess',
    slug: 'wix-investment-process',
    label: 'Wix Investment Process',
  },
  {
    wixCollectionId: 'LegalInformmation',
    slug: 'wix-legal-information',
    label: 'Wix Legal Information',
  },
  {
    wixCollectionId: 'MegatrendDataset',
    slug: 'wix-megatrend-dataset',
    label: 'Wix Megatrend Dataset',
  },
  {
    wixCollectionId: 'MegatrendsAllocations',
    slug: 'wix-megatrends-allocations',
    label: 'Wix Megatrends Allocations',
  },
  {
    wixCollectionId: 'MegatrendsDetail',
    slug: 'wix-megatrends-detail',
    label: 'Wix Megatrends Detail',
  },
  { wixCollectionId: 'Members/Badges', slug: 'wix-members-badges', label: 'Wix Members Badges' },
  {
    wixCollectionId: 'Members/FullData',
    slug: 'wix-members-full-data',
    label: 'Wix Members Full Data',
  },
  {
    wixCollectionId: 'Members/PrivateMembersData',
    slug: 'wix-members-private-data',
    label: 'Wix Members Private Data',
  },
  {
    wixCollectionId: 'Members/PublicData',
    slug: 'wix-members-public-data',
    label: 'Wix Members Public Data',
  },
  { wixCollectionId: 'MenuList', slug: 'wix-menu-list', label: 'Wix Menu List' },
  {
    wixCollectionId: 'PortfolioStrategyProcess',
    slug: 'wix-portfolio-strategy-process',
    label: 'Wix Portfolio Strategy Process',
  },
  { wixCollectionId: 'PrivacyPolicy', slug: 'wix-privacy-policy', label: 'Wix Privacy Policy' },
  {
    wixCollectionId: 'SectorAllocations',
    slug: 'wix-sector-allocations',
    label: 'Wix Sector Allocations',
  },
  { wixCollectionId: 'TopHoldings', slug: 'wix-top-holdings', label: 'Wix Top Holdings' },
  { wixCollectionId: 'TrustList', slug: 'wix-trust-list', label: 'Wix Trust List' },
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
      useAsTitle: 'wixItemId',
      defaultColumns: ['wixItemId', 'updatedAt'],
      group: 'Wix',
    },
    fields: [
      {
        name: 'wixCollectionId',
        type: 'text',
        required: true,
        defaultValue: def.wixCollectionId,
        index: true,
        admin: {
          readOnly: true,
        },
      },
      {
        name: 'wixItemId',
        type: 'text',
        required: true,
        index: true,
      },
      {
        name: 'wixUpdatedAt',
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
        fields: ['wixItemId'],
        unique: true,
      },
    ],
  }
}

export const wixCollectionSlugById = Object.fromEntries(
  wixCollectionDefinitions.map((def) => [def.wixCollectionId, def.slug]),
) as Record<string, string>

export const WixCollections: CollectionConfig[] = wixCollectionDefinitions.map(buildWixCollection)
