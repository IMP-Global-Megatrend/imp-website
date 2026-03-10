# Wix Document Sync

This project includes an automated Wix-to-Payload sync for downloadable documents.

## What it updates

- `media` collection (PDF upload upsert by `sourceUrl`)
- `footer.downloads.*`
- `pages(home).homeDownloads.*`
- `pages(performance-analysis)` document asset + href fields
- matching related-link fields on `pages(fund)` and `pages(megatrends)` when labels map to known document types
- latest `homepage-links` row (`data` + `textFields`) for persisted document URLs

## Source of truth

The sync reads Wix Data collection `Homepagelinks` by default (override with `WIX_DOCUMENTS_COLLECTION_ID`).
It fetches latest items sorted by `_updatedDate` and maps these document keys:

- `factsheetUsd`
- `factsheetChfHedged`
- `fundCommentary`
- `presentation`

## Run

```bash
pnpm sync:wix-documents
```

## Required environment variables

- `WIX_API_KEY`
- `WIX_SITE_ID`
- `WIX_ACCOUNT_ID`
- `DATABASE_URL`
- `PAYLOAD_SECRET`

## Optional environment variables

- `WIX_DOCUMENTS_COLLECTION_ID` (default: `Homepagelinks`)
- `WIX_DOCUMENTS_LOOKBACK` (default: `10`)
