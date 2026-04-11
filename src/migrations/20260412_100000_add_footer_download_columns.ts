import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Footer global `downloads` upload fields map to `downloads_*_id` columns.
 * Older databases created before this group was added lack those columns, so
 * `findGlobal({ slug: 'footer', select: { downloads: true } })` fails at SQL time.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "footer"
      ADD COLUMN IF NOT EXISTS "downloads_factsheet_usd_id" integer;

    ALTER TABLE "footer"
      ADD COLUMN IF NOT EXISTS "downloads_factsheet_chf_hedged_id" integer;

    ALTER TABLE "footer"
      ADD COLUMN IF NOT EXISTS "downloads_fund_commentary_id" integer;

    ALTER TABLE "footer"
      ADD COLUMN IF NOT EXISTS "downloads_presentation_id" integer;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "footer" DROP COLUMN IF EXISTS "downloads_factsheet_usd_id";
    ALTER TABLE "footer" DROP COLUMN IF EXISTS "downloads_factsheet_chf_hedged_id";
    ALTER TABLE "footer" DROP COLUMN IF EXISTS "downloads_fund_commentary_id";
    ALTER TABLE "footer" DROP COLUMN IF EXISTS "downloads_presentation_id";
  `)
}
