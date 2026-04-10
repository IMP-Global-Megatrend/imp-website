import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      ADD COLUMN IF NOT EXISTS "performance_cards_performance_mtd_label" varchar;

    ALTER TABLE "_pages_v"
      ADD COLUMN IF NOT EXISTS "version_performance_cards_performance_mtd_label" varchar;

    ALTER TABLE "performance_usd_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_m_t_d" varchar;

    ALTER TABLE "performance_chf_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_m_t_d" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "pages"
      DROP COLUMN IF EXISTS "performance_cards_performance_mtd_label";

    ALTER TABLE "_pages_v"
      DROP COLUMN IF EXISTS "version_performance_cards_performance_mtd_label";

    ALTER TABLE "performance_usd_share_class_data"
      DROP COLUMN IF EXISTS "perf_m_t_d";

    ALTER TABLE "performance_chf_share_class_data"
      DROP COLUMN IF EXISTS "perf_m_t_d";
  `)
}
