import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "portfolio_top_holdings"
      ADD COLUMN IF NOT EXISTS "color" varchar;

    ALTER TABLE IF EXISTS "_portfolio_top_holdings_v"
      ADD COLUMN IF NOT EXISTS "version_color" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE IF EXISTS "portfolio_top_holdings"
      DROP COLUMN IF EXISTS "color";

    ALTER TABLE IF EXISTS "_portfolio_top_holdings_v"
      DROP COLUMN IF EXISTS "version_color";
  `)
}
