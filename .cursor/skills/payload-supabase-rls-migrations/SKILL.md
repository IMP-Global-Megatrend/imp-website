---
name: payload-supabase-rls-migrations
description: >-
  Ensures new Postgres tables in public get Row Level Security and explicit
  deny policies for PostgREST on Supabase. Use when running or authoring
  `payload migrate:create` migrations, adding collections/globals that create
  tables, fixing Supabase database linter 0013 (rls_disabled_in_public) or
  0008 (rls_enabled_no_policy), or when the user asks about RLS, policies,
  anon/authenticated, and Payload migrations together.
---

# Payload migrations and RLS on Supabase

This project uses **Payload** with `@payloadcms/db-postgres` on **Supabase** Postgres. The `public` schema is exposed to **PostgREST**; every table there should have **RLS enabled** so the Supabase **database linter 0013** (`rls_disabled_in_public`) stays clean, and you should have **at least one explicit RLS policy** so **linter 0008** (`rls_enabled_no_policy`, INFO) stays clean.

Baselines in this repo:

- `20260423_120000_enable_rls_on_public_tables` — `ENABLE ROW LEVEL SECURITY` on all `public` base tables.
- `20260423_140000_deny_postgrest_rls_policies_on_public` — creates `deny_postgrest_api_roles` on each table: `FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)`. That encodes “no data via PostgREST API roles” while the **table owner** (`postgres` for direct `DATABASE_URL`) still **bypasses RLS** (no `FORCE ROW LEVEL SECURITY`).

**New tables created later** do not get RLS or this policy automatically from Payload.

## When creating a new migration (`payload migrate:create`)

1. **Preferred:** In the same migration’s `up()` body, after each `CREATE TABLE` (or the generated block that creates tables), add:

   `ALTER TABLE public."<table_name>" ENABLE ROW LEVEL SECURITY;`

   Then add the same deny policy PostgREST uses in this project (linter 0008 / explicit access model), unless you are replacing it with real `anon`/`authenticated` rules:

   ```sql
   CREATE POLICY deny_postgrest_api_roles ON public."<table_name>" AS PERMISSIVE
     FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
   ```

   Use the exact table names from the generated SQL. Include **all** new tables the migration creates (including block/junction/version tables if any).

2. **Alternative:** If you skip RLS in that migration, add a **small follow-up migration** soon after that only runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` for the new names—or re-run a **catch-up** style migration that loops over `pg_class` in `public` with `relkind = 'r'` and `NOT relrowsecurity` (same pattern as `20260423_120000_enable_rls_on_public_tables`).

3. In `down()`, for tables you created in that migration, either:
   - `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` before `DROP TABLE`, or
   - let `DROP TABLE` remove the table (RLS on a dropped table is moot; only needed if you disable RLS without dropping).

4. Register and apply migrations per [docs/payload-migration-baseline.md](docs/payload-migration-baseline.md): update `src/migrations/index.ts`, then `pnpm payload migrate:status` and `pnpm payload migrate`.

## Quick checklist (before opening a PR with a new migration)

Follow the repo [branch workflow](../../rules/branch-workflow.mdc): use a **branch** (e.g. `feature/…`), open a PR **to** `develop` (no direct push to `develop`). Do not target `main` except the release PR **`develop` → `main`**.

- [ ] Every **new** `public` table from this change has RLS **enabled** in the same batch or a dedicated follow-up migration.
- [ ] The same table has a **`deny_postgrest_api_roles`** (or your chosen explicit policies) so linter **0008** does not regress.
- [ ] No dependency on `FORCE ROW LEVEL SECURITY` for normal Payload access (table owner / expected connection role should still work).
- [ ] Re-run the Supabase **database linter** in the project dashboard after deploy to confirm **0013** and **0008** stay resolved.

## Related

- [`.cursor/rules/branch-workflow.mdc`](../../rules/branch-workflow.mdc) and [`.cursor/skills/branch-workflow/SKILL.md`](../branch-workflow/SKILL.md) — `develop` / `main` policy
- [`.cursor/rules/payload-migration-baseline.mdc`](../../rules/payload-migration-baseline.mdc)
- [docs/payload-migration-baseline.md](../../../docs/payload-migration-baseline.md)
