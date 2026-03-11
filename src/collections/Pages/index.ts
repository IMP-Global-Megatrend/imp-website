import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '@/hooks/populatePublishedAt'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from '@/collections/Pages/hooks/revalidatePage'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  OrderedListFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

const requireHomeDownload =
  (label: string) =>
  (value: unknown, { data }: { data?: { slug?: unknown } }): true | string => {
    if (data?.slug !== 'home') return true
    if (value) return true
    return `${label} is required when editing the Home page.`
  }

const slugsWithoutLayoutConsumption = new Set([
  'about-us',
  'contact-us',
  'fund',
  'home',
  'megatrends',
  'newsletter-subscription',
  'performance-analysis',
  'portfolio-strategy',
])

const shouldShowLayoutField = (slug: unknown): boolean =>
  typeof slug !== 'string' || !slugsWithoutLayoutConsumption.has(slug)

const requireConsumedLayout = (
  value: unknown,
  { data }: { data?: { slug?: unknown } },
): true | string => {
  if (!shouldShowLayoutField(data?.slug)) return true
  if (Array.isArray(value) && value.length > 0) return true
  return 'Content layout is required for pages that render layout blocks.'
}

const stripUnusedLayoutBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  const next = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>
  if (!shouldShowLayoutField(next.slug)) {
    return {
      ...next,
      layout: [],
    }
  }

  return data
}

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock],
              validate: requireConsumedLayout,
              admin: {
                initCollapsed: true,
                condition: (data) => shouldShowLayoutField(data?.slug),
              },
            },
          ],
          label: 'Content',
          admin: {
            condition: (data) => shouldShowLayoutField(data?.slug),
          },
        },
        {
          fields: [
            {
              name: 'aboutUsVideo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional video file from Media Library for /about-us.',
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsHeroTitle',
              type: 'text',
              admin: {
                description: 'Hero title on /about-us.',
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsVideoAriaLabel',
              type: 'text',
              admin: {
                description: 'Video accessibility label on /about-us.',
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsQuoteText',
              type: 'textarea',
              admin: {
                description: 'Main quote text displayed below the hero.',
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsQuoteAttributionPrimary',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsQuoteAttributionSecondary',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsProfiles',
              type: 'array',
              admin: {
                description: 'Profile blocks shown in the About Us team section.',
                condition: (data) => data?.slug === 'about-us',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'paragraphs',
                  type: 'array',
                  required: true,
                  fields: [
                    {
                      name: 'text',
                      type: 'textarea',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'certifications',
                  type: 'array',
                  required: true,
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                    },
                    {
                      name: 'institution',
                      type: 'text',
                      required: true,
                    },
                  ],
                },
              ],
            },
            {
              name: 'aboutUsHighlights',
              type: 'array',
              admin: {
                description: 'Bottom highlight strip items on /about-us.',
                condition: (data) => data?.slug === 'about-us',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'id',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'text',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'line1',
                  type: 'text',
                },
                {
                  name: 'line2',
                  type: 'text',
                },
              ],
            },
            {
              name: 'aboutUsRequestCallLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsRequestCallHref',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsLinkedinLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsLinkedinHref',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
            {
              name: 'aboutUsLinkedinAriaLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'about-us',
              },
            },
          ],
          label: 'About Us',
          admin: {
            condition: (data) => data?.slug === 'about-us',
          },
        },
        {
          fields: [
            {
              name: 'heroCtaLabel',
              type: 'text',
              admin: {
                description: 'Homepage CTA label used in the hero section.',
                condition: (data) => data?.slug === 'home',
              },
            },
            {
              name: 'heroCtaHref',
              type: 'text',
              admin: {
                description: 'Homepage CTA URL used in the hero section.',
                condition: (data) => data?.slug === 'home',
              },
            },
            {
              name: 'homeDownloads',
              type: 'group',
              fields: [
                {
                  name: 'factsheetUsd',
                  type: 'upload',
                  relationTo: 'media',
                  validate: requireHomeDownload('Factsheet USD'),
                  admin: {
                    description: 'Homepage download: Factsheet USD (PDF media asset).',
                  },
                },
                {
                  name: 'factsheetChfHedged',
                  type: 'upload',
                  relationTo: 'media',
                  validate: requireHomeDownload('Factsheet CHF Hedged'),
                  admin: {
                    description: 'Homepage download: Factsheet CHF Hedged (PDF media asset).',
                  },
                },
                {
                  name: 'fundCommentary',
                  type: 'upload',
                  relationTo: 'media',
                  validate: requireHomeDownload('Fund Commentary'),
                  admin: {
                    description: 'Homepage download: Fund Commentary (PDF media asset).',
                  },
                },
                {
                  name: 'presentation',
                  type: 'upload',
                  relationTo: 'media',
                  validate: requireHomeDownload('Presentation'),
                  admin: {
                    description: 'Homepage download: Presentation (PDF media asset).',
                  },
                },
              ],
              admin: {
                condition: (data) => data?.slug === 'home',
              },
            },
            {
              name: 'homeMegatrendCards',
              type: 'relationship',
              relationTo: 'home-megatrend-cards',
              hasMany: true,
              admin: {
                description:
                  'Optional explicit ordering/source for homepage megatrend cards. Kept separate from /megatrends detail blocks.',
                condition: (data) => data?.slug === 'home',
              },
            },
          ],
          label: 'Home',
          admin: {
            condition: (data) => data?.slug === 'home',
          },
        },
        {
          fields: [
            {
              name: 'contactCompanyName',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
            {
              name: 'contactAddress',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
            {
              name: 'contactPhone',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
            {
              name: 'contactEmail',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
            {
              name: 'contactWebsite',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
            {
              name: 'contactConsentText',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'contact-us',
              },
            },
          ],
          label: 'Contact',
          admin: {
            condition: (data) => data?.slug === 'contact-us',
          },
        },
        {
          fields: [
            {
              name: 'newsletterIntroTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'newsletter-subscription',
              },
            },
            {
              name: 'newsletterIntroBody',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'newsletter-subscription',
              },
            },
            {
              name: 'newsletterConsentText',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'newsletter-subscription',
              },
            },
            {
              name: 'newsletterSubmitLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'newsletter-subscription',
              },
            },
          ],
          label: 'Newsletter',
          admin: {
            condition: (data) => data?.slug === 'newsletter-subscription',
          },
        },
        {
          fields: [
            {
              name: 'fundIntroPrimaryQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundIntroSecondaryQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundInvestmentObjectiveHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundInvestmentObjectiveBody',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedLinksHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedPrimaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedPrimaryHref',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedPrimaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedSecondaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedSecondaryHref',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedSecondaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedTertiaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedTertiaryHref',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundRelatedTertiaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (data) => data?.slug === 'fund',
              },
            },
            {
              name: 'fundAttributes',
              type: 'relationship',
              relationTo: 'fund-attributes',
              hasMany: true,
              admin: {
                description:
                  'Optional explicit ordering/source for fund details and share-class metadata on /fund.',
                condition: (data) => data?.slug === 'fund',
              },
            },
          ],
          label: 'Fund',
          admin: {
            condition: (data) => data?.slug === 'fund',
          },
        },
        {
          fields: [
            {
              name: 'megatrendsHeroTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsHeroSubtitle',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsIntroHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsIntroLeftQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsIntroRightQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendDetailBlocks',
              type: 'relationship',
              relationTo: 'megatrend-detail-blocks',
              hasMany: true,
              admin: {
                description: 'Megatrend detail sections shown on /megatrends.',
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedLinksHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedPrimaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedPrimaryHref',
              type: 'text',
              admin: {
                description: 'Optional URL for primary related link button.',
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedPrimaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional file asset linked to primary related link button.',
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedSecondaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedSecondaryHref',
              type: 'text',
              admin: {
                description: 'Optional URL for secondary related link button.',
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsRelatedSecondaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Optional file asset linked to secondary related link button.',
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsThematicFrameworkHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsThematicFrameworkLeftQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
            {
              name: 'megatrendsThematicFrameworkRightQuote',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'megatrends',
              },
            },
          ],
          label: 'Megatrends',
          admin: {
            condition: (data) => data?.slug === 'megatrends',
          },
        },
        {
          fields: [
            {
              name: 'portfolioStrategyIntro',
              type: 'textarea',
              admin: {
                description: 'Intro quote text shown below hero on /portfolio-strategy.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioStrategySteps',
              type: 'relationship',
              relationTo: 'portfolio-strategy-steps',
              hasMany: true,
              admin: {
                description:
                  'Optional explicit ordering of step sections for /portfolio-strategy. If empty, steps are loaded from the collection by sortOrder.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioInvestmentProcessItems',
              type: 'relationship',
              relationTo: 'portfolio-investment-process-items',
              hasMany: true,
              admin: {
                description:
                  'Optional explicit ordering for Investment Process items on /portfolio-strategy.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioMegatrendAllocations',
              type: 'relationship',
              relationTo: 'portfolio-megatrend-allocations',
              hasMany: true,
              admin: {
                description: 'Optional explicit ordering for Megatrend Allocations chart rows.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioGeographicAllocations',
              type: 'relationship',
              relationTo: 'portfolio-geographic-allocations',
              hasMany: true,
              admin: {
                description: 'Optional explicit ordering for Geographic Allocations chart rows.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioSectorAllocations',
              type: 'relationship',
              relationTo: 'portfolio-sector-allocations',
              hasMany: true,
              admin: {
                description: 'Optional explicit ordering for Sector Allocations chart rows.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
            {
              name: 'portfolioTopHoldings',
              type: 'relationship',
              relationTo: 'portfolio-top-holdings',
              hasMany: true,
              admin: {
                description: 'Optional explicit ordering for Top Holdings chart rows.',
                condition: (data) => data?.slug === 'portfolio-strategy',
              },
            },
          ],
          label: 'Portfolio Strategy',
          admin: {
            condition: (data) => data?.slug === 'portfolio-strategy',
          },
        },
        {
          fields: [
            {
              name: 'performanceHeroTitle',
              type: 'text',
              admin: {
                description: 'Hero title for /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceAnnualTitle',
              type: 'text',
              admin: {
                description: 'Main chart heading on /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceUsdLabel',
              type: 'text',
              admin: {
                description: 'USD share class label on /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceChfLabel',
              type: 'text',
              admin: {
                description: 'CHF share class label on /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceExportSvgTooltip',
              type: 'text',
              admin: {
                description: 'Tooltip text for chart SVG export action.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceExportCsvTooltip',
              type: 'text',
              admin: {
                description: 'Tooltip text for chart CSV export action.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceNavPoints',
              type: 'relationship',
              relationTo: 'performance-nav-points',
              hasMany: true,
              admin: {
                description: 'Optional explicit ordering/source for performance NAV points.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceUsdShareClassData',
              type: 'relationship',
              relationTo: 'performance-usd-share-class-data',
              admin: {
                description: 'Primary USD share class card dataset for /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceChfShareClassData',
              type: 'relationship',
              relationTo: 'performance-chf-share-class-data',
              admin: {
                description: 'Primary CHF share class card dataset for /performance-analysis.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceChartYearBadge',
              type: 'text',
              admin: {
                description: 'Year badge text above the chart.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsNavUpdatesTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsNavPerShareLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsPerformanceMetricsTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsAsOfPrefix',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsPerformanceYtdLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsRiskMetricsTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsSharpeRatioLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsVolatilityLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsSortinoRatioLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsDownsideRiskLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceCardsFundDetailsTitle',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFootnoteSingleAsterisk',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFootnoteDoubleAsterisk',
              type: 'textarea',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceRelatedLinksHeading',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFullHistoryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFullHistoryHref',
              type: 'text',
              admin: {
                description: 'URL for the Full Performance History button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetUsdLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetUsdAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Media asset linked to Factsheet USD button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetUsdHref',
              type: 'text',
              admin: {
                description: 'Optional explicit URL override for Factsheet USD button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetChfLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetChfAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Media asset linked to Factsheet CHF Hedged button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFactsheetChfHref',
              type: 'text',
              admin: {
                description: 'Optional explicit URL override for Factsheet CHF Hedged button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFundCommentaryLabel',
              type: 'text',
              admin: {
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFundCommentaryAsset',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Media asset linked to Latest Fund Commentary button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
            {
              name: 'performanceFundCommentaryHref',
              type: 'text',
              admin: {
                description: 'Optional explicit URL override for Latest Fund Commentary button.',
                condition: (data) => data?.slug === 'performance-analysis',
              },
            },
          ],
          label: 'Performance Analysis',
          admin: {
            condition: (data) => data?.slug === 'performance-analysis',
          },
        },
        {
          fields: [
            {
              name: 'legalInformationContent',
              type: 'richText',
              label: 'Legal Information Content',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  OrderedListFeature(),
                  UnorderedListFeature(),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
              admin: {
                condition: (data) => data?.slug === 'legal-information',
                description: 'Single source rich text for /legal-information content and table of contents.',
              },
            },
          ],
          label: 'Legal Information',
          admin: {
            condition: (data) => data?.slug === 'legal-information',
          },
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'sourceId',
      type: 'text',
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'sourceUpdatedAt',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage],
    beforeChange: [stripUnusedLayoutBeforeChange, populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  indexes: [
    {
      fields: ['sourceId'],
      unique: true,
    },
  ],
}
