import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $polup$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT c.relname AS tname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
          AND c.relrowsecurity
          AND NOT EXISTS (
            SELECT 1
            FROM pg_policies p
            WHERE p.schemaname = 'public'
              AND p.tablename = c.relname::text
              AND p.policyname = 'deny_postgrest_api_roles'
          )
      LOOP
        EXECUTE format(
          'CREATE POLICY deny_postgrest_api_roles ON public.%I AS PERMISSIVE FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
          r.tname
        );
      END LOOP;
    END;
    $polup$;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $poldown$
    DECLARE
      r RECORD;
    BEGIN
      FOR r IN
        SELECT c.relname AS tname
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
      LOOP
        EXECUTE format(
          'DROP POLICY IF EXISTS deny_postgrest_api_roles ON public.%I',
          r.tname
        );
      END LOOP;
    END;
    $poldown$;
  `)
}
