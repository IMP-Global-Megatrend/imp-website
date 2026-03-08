# IMP Website

Built with [Next.js](https://nextjs.org), [Payload CMS](https://payloadcms.com), [Tailwind CSS 4](https://tailwindcss.com), and [React 19](https://react.dev). Deployed on [Vercel](https://vercel.com).

_Deployment smoke test commit for the `develop` preview branch._

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **CMS:** Payload CMS 3
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Database:** Supabase PostgreSQL (via `@payloadcms/db-postgres`)
- **File Storage:** Supabase Storage (via `@payloadcms/storage-s3`)
- **Rich Text:** Lexical editor
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 20.9.0+
- pnpm 9+
- A [Supabase](https://supabase.com) project

### Setup

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

3. Get your Supabase connection string:
   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Navigate to **Project Settings > Database > Connection string > URI**
   - Use the **Transaction pooler** (port `6543`) — this is required for serverless environments like Vercel
   - Paste it as `DATABASE_URL` in `.env`

4. Set up Supabase Storage:
   - In your Supabase Dashboard, create a storage bucket named `media` (set it to public)
   - Go to **Project Settings > Storage > S3 Connection**
   - Copy the endpoint, access key, secret key, and region into your `.env` file

5. Start the development server:

```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) for the frontend and [http://localhost:3000/admin](http://localhost:3000/admin) for the Payload admin panel.

### First Run

On first visit to `/admin`, Payload will run database migrations and prompt you to create an admin user.

You can also seed the database with sample content by visiting `/next/seed` after logging in.

## Project Structure

```
src/
├── app/
│   ├── (frontend)/     # Public-facing pages and layouts
│   └── (payload)/      # Payload CMS admin panel
├── blocks/             # Content blocks (CTA, Banner, Code, etc.)
├── collections/        # Payload collections (Pages, Posts, Media, etc.)
├── components/         # Shared React components + shadcn/ui
├── fields/             # Reusable Payload field configurations
├── heros/              # Hero section variants
├── plugins/            # Payload plugin configurations
├── providers/          # React context providers (theme, etc.)
└── utilities/          # Helper functions
```

## Deployment on Vercel

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add your environment variables in the Vercel dashboard:
   - `DATABASE_URL` — Your Supabase Transaction pooler connection string (port `6543`)
   - `S3_ENDPOINT` — Your Supabase Storage S3 endpoint
   - `S3_ACCESS_KEY_ID` — Your Supabase S3 access key
   - `S3_SECRET_ACCESS_KEY` — Your Supabase S3 secret key
   - `S3_BUCKET` — Your storage bucket name (e.g. `media`)
   - `S3_REGION` — Your Supabase project region
   - `RESEND_API_KEY` — Your Resend API key
   - `RESEND_FROM_EMAIL` — A verified sender address in Resend (e.g. `noreply@yourdomain.com`)
   - `RESEND_FROM_NAME` — Sender name shown in outgoing emails
   - `PAYLOAD_SECRET` — A random secret string
   - `CRON_SECRET` — A random secret for cron job authentication
   - `PREVIEW_SECRET` — A random secret for preview mode
4. Deploy.

## Scripts

| Command                    | Description                          |
| -------------------------- | ------------------------------------ |
| `pnpm dev`                 | Start development server             |
| `pnpm build`               | Build for production                 |
| `pnpm start`               | Start production server              |
| `pnpm lint`                | Run ESLint                           |
| `pnpm generate:types`      | Generate Payload TypeScript types    |
| `pnpm generate:importmap`  | Generate Payload import map          |

## Wix Import Runbook

The Wix importer endpoint is:

- `POST /next/wix-import`
- Requires an authenticated Payload admin session (same browser where you are logged into `/admin`)

Required environment variables:

- `WIX_API_KEY`
- `WIX_SITE_ID`
- `WIX_ACCOUNT_ID`

### Example payloads

Dry run (safe smoke test):

```json
{
  "dryRun": true,
  "upsertByWixId": true,
  "skipExisting": true,
  "publishOnImport": false,
  "categories": true,
  "posts": true,
  "pages": true,
  "dataCollections": [],
  "limit": 10
}
```

Full import (repeatable upsert):

```json
{
  "dryRun": false,
  "upsertByWixId": true,
  "skipExisting": true,
  "publishOnImport": true,
  "categories": true,
  "posts": true,
  "pages": true,
  "dataCollections": ["CollectionA", "CollectionB"]
}
```

Only Wix CMS collections:

```json
{
  "dryRun": false,
  "upsertByWixId": true,
  "skipExisting": true,
  "categories": false,
  "posts": false,
  "pages": false,
  "dataCollections": ["CollectionA", "CollectionB"]
}
```
