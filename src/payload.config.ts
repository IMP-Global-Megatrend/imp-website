import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from '@/collections/Categories'
import { ContactSubmissions } from '@/collections/ContactSubmissions'
import { ContentGateSubmissions } from '@/collections/ContentGateSubmissions'
import { HomeMegatrendCards } from '@/collections/HomeMegatrendCards'
import { MegatrendDetailBlocks } from '@/collections/MegatrendDetailBlocks'
import { Media } from '@/collections/Media'
import { NewsletterSubscriptions } from '@/collections/NewsletterSubscriptions'
import { Pages } from '@/collections/Pages'
import {
  PortfolioGeographicAllocations,
  PortfolioMegatrendAllocations,
  PortfolioSectorAllocations,
  PortfolioTopHoldings,
} from '@/collections/PortfolioStrategyChartCollections'
import { PortfolioInvestmentProcessItems } from '@/collections/PortfolioInvestmentProcessItems'
import { PortfolioStrategySteps } from '@/collections/PortfolioStrategySteps'
import { PerformanceNavPoints } from '@/collections/PerformanceNavPoints'
import {
  PerformanceChfShareClassData,
  PerformanceUsdShareClassData,
} from '@/collections/PerformanceShareClassCollections'
import { ResendWebhookEvents } from '@/collections/ResendWebhookEvents'
import { Posts } from '@/collections/Posts'
import { Users } from '@/collections/Users'
import { WixCollections } from '@/collections/SourceCollections'
import { Footer } from '@/Footer/config'
import { Header } from '@/Header/config'
import { plugins } from '@/plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from '@/utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    // Avoid interactive schema push prompts during app startup/dev.
    // Run explicit migrations/schema updates in controlled steps instead.
    push: false,
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    ContentGateSubmissions,
    ContactSubmissions,
    NewsletterSubscriptions,
    ResendWebhookEvents,
    HomeMegatrendCards,
    MegatrendDetailBlocks,
    PerformanceNavPoints,
    PerformanceUsdShareClassData,
    PerformanceChfShareClassData,
    PortfolioMegatrendAllocations,
    PortfolioGeographicAllocations,
    PortfolioSectorAllocations,
    PortfolioTopHoldings,
    PortfolioInvestmentProcessItems,
    PortfolioStrategySteps,
    ...WixCollections,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
    defaultFromName: process.env.RESEND_FROM_NAME || 'IMP Website',
  }),
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
