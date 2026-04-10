import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Payload maps perfMTD → "perf_m_t_d" (each capital letter), not "perf_mtd".
 * The prior migration added the wrong column name; align with Drizzle/Payload.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "performance_usd_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_m_t_d" varchar;

    ALTER TABLE "performance_chf_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_m_t_d" varchar;
  `)

  await db.execute(sql`
    DO $fix$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'performance_usd_share_class_data'
          AND column_name = 'perf_mtd'
      ) THEN
        UPDATE "performance_usd_share_class_data"
        SET "perf_m_t_d" = "perf_mtd"
        WHERE "perf_mtd" IS NOT NULL AND "perf_mtd" <> '';
        ALTER TABLE "performance_usd_share_class_data" DROP COLUMN "perf_mtd";
      END IF;

      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'performance_chf_share_class_data'
          AND column_name = 'perf_mtd'
      ) THEN
        UPDATE "performance_chf_share_class_data"
        SET "perf_m_t_d" = "perf_mtd"
        WHERE "perf_mtd" IS NOT NULL AND "perf_mtd" <> '';
        ALTER TABLE "performance_chf_share_class_data" DROP COLUMN "perf_mtd";
      END IF;
    END
    $fix$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "performance_usd_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_mtd" varchar;

    ALTER TABLE "performance_chf_share_class_data"
      ADD COLUMN IF NOT EXISTS "perf_mtd" varchar;

    UPDATE "performance_usd_share_class_data" SET "perf_mtd" = "perf_m_t_d" WHERE "perf_m_t_d" IS NOT NULL;
    UPDATE "performance_chf_share_class_data" SET "perf_mtd" = "perf_m_t_d" WHERE "perf_m_t_d" IS NOT NULL;

    ALTER TABLE "performance_usd_share_class_data" DROP COLUMN IF EXISTS "perf_m_t_d";
    ALTER TABLE "performance_chf_share_class_data" DROP COLUMN IF EXISTS "perf_m_t_d";
  `)
}
