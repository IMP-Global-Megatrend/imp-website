import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

/**
 * Baseline anchor migration.
 *
 * This migration intentionally performs no schema changes.
 * It exists so environments with pre-existing dev-pushed schemas
 * can share a common migration starting point.
 */
export async function up(_: MigrateUpArgs): Promise<void> {}

export async function down(_: MigrateDownArgs): Promise<void> {}
