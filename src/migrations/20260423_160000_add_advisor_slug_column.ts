import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { uniqueAdvisorSlugs } from '@/utilities/advisorSlug'

type IdNameRow = { id: number; name: string | null }

function rowsFromSelect(result: unknown): IdNameRow[] {
  const r = result as { rows?: IdNameRow[] }
  if (Array.isArray(r.rows)) return r.rows
  if (Array.isArray(result)) return result as IdNameRow[]
  return []
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`ALTER TABLE "advisors" ADD COLUMN IF NOT EXISTS "slug" varchar;`,
  )

  const raw = await db.execute(
    sql`select "id", "name" from "advisors" order by "id" asc;`,
  )
  const allRows = rowsFromSelect(raw)
  const withNames = allRows
    .map((r) => ({
      id: r.id,
      name: typeof r.name === 'string' ? r.name : '',
    }))
    .filter((r) => r.name.trim().length > 0)

  const idToSlug = uniqueAdvisorSlugs(withNames.map((r) => ({ id: r.id, name: r.name })))

  for (const { id, name } of allRows) {
    const t = typeof name === 'string' ? name.trim() : ''
    const slug = t
      ? (idToSlug.get(id) as string | undefined) ?? `advisor-${String(id)}`
      : `advisor-${String(id)}`
    await db.execute(
      sql`update "advisors" set "slug" = ${slug} where "id" = ${id}`,
    )
  }

  await db.execute(sql`ALTER TABLE "advisors" ALTER COLUMN "slug" SET NOT NULL;`)
  await db.execute(
    sql`CREATE UNIQUE INDEX IF NOT EXISTS "advisors_slug_idx" ON "advisors" ("slug");`,
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP INDEX IF EXISTS "advisors_slug_idx";`)
  await db.execute(sql`ALTER TABLE "advisors" DROP COLUMN IF EXISTS "slug";`)
}
