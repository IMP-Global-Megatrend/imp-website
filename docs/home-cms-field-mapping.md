# Home CMS Field Mapping

This matrix maps fields on the `pages` document where `slug = "home"` to runtime usage on `http://localhost:3000/`.

## Home document fields (`pages`)

| Field | Used on `/` | Consumer | Asset type | Strict requirement |
| --- | --- | --- | --- | --- |
| `title` | No | None | Text | Optional |
| `hero.type` | No | None | Enum | Optional |
| `hero.richText` | Yes | `getHomeCMSContent()` -> `HeroSection` | Rich text | Required for authored hero copy |
| `hero.links` | No | None | Group/array | Optional |
| `hero.media` | No | None | Media relation | Optional |
| `layout` | No | None | Blocks | Optional for homepage runtime |
| `heroCtaLabel` | Yes | `getHomeCMSContent()` -> `HeroSection` | Text | Required for complete hero CTA |
| `heroCtaHref` | Yes | `getHomeCMSContent()` -> `HeroSection` | Text | Required for complete hero CTA |
| `homeDownloads.factsheetUsd` | Yes | `getHomeCMSContent()` -> `BottomGrid` and related links | Media relation (PDF) | Required |
| `homeDownloads.factsheetChfHedged` | Yes | `getHomeCMSContent()` -> `BottomGrid` and related links | Media relation (PDF) | Required |
| `homeDownloads.fundCommentary` | Yes | `getHomeCMSContent()` -> `BottomGrid` and related links | Media relation (PDF) | Required |
| `homeDownloads.presentation` | Yes | `getHomeCMSContent()` -> `BottomGrid` and related links | Media relation (PDF) | Required |
| `meta.title` | No (page body) | Next metadata pipeline | Text | Optional |
| `meta.description` | No (page body) | Next metadata pipeline | Text | Optional |
| `meta.image` | No (page body) | Next metadata pipeline | Media relation | Optional |
| `publishedAt` | No | None | Date | Optional |
| `sourceId` | No | None | Text | Optional |
| `sourceUpdatedAt` | No | None | Date | Optional |
| `slug` | Indirect only | Query filter in `getHomeCMSContent()` | Text | Required |

## Non-`pages` dependencies rendered on `/`

Homepage rendering also depends on these collections:

- `trust-list` -> `regulatoryItems`
- `megatrend-dataset` -> `trends`
- `homepage-links` -> `exploreMegatrendsCard`
- `legal-information` + `contact-us` -> `regulatoryNotice`

## Canonical download source

For homepage downloads, canonical data source is:

- `pages(home).homeDownloads.*` media relations

No asset substitution fallback should be used for these four download links.
