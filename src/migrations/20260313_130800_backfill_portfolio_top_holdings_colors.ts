import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY weight DESC, sort_order ASC, id ASC) AS rn
      FROM portfolio_top_holdings
      WHERE color IS NULL OR btrim(color) = ''
    )
    UPDATE portfolio_top_holdings p
    SET color = CASE ranked.rn
      WHEN 1 THEN '#0F3BBF'
      WHEN 2 THEN '#F6D800'
      WHEN 3 THEN '#FF8F00'
      WHEN 4 THEN '#7C3BBF'
      WHEN 5 THEN '#7EE815'
      WHEN 6 THEN '#FF7FBF'
      WHEN 7 THEN '#A86D6D'
      WHEN 8 THEN '#294736'
      WHEN 9 THEN '#FC0844'
      WHEN 10 THEN '#9DB81F'
      ELSE '#0F3BBF'
    END
    FROM ranked
    WHERE p.id = ranked.id;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE portfolio_top_holdings
    SET color = ''
    WHERE color IN (
      '#0F3BBF',
      '#F6D800',
      '#FF8F00',
      '#7C3BBF',
      '#7EE815',
      '#FF7FBF',
      '#A86D6D',
      '#294736',
      '#FC0844',
      '#9DB81F'
    );
  `)
}
