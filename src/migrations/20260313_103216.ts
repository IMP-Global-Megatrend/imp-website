import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "portfolio_strategy_hero_title" varchar,
      ADD COLUMN IF NOT EXISTS "portfolio_strategy_hero_subtitle" jsonb;

    ALTER TABLE "_pages_v"
      ADD COLUMN IF NOT EXISTS "version_portfolio_strategy_hero_title" varchar,
      ADD COLUMN IF NOT EXISTS "version_portfolio_strategy_hero_subtitle" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "portfolio_strategy_hero_title",
      DROP COLUMN IF EXISTS "portfolio_strategy_hero_subtitle";

    ALTER TABLE "_pages_v"
      DROP COLUMN IF EXISTS "version_portfolio_strategy_hero_title",
      DROP COLUMN IF EXISTS "version_portfolio_strategy_hero_subtitle";
  `)
}
