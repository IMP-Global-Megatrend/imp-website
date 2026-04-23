import * as migration_20260313_103000 from './20260313_103000';
import * as migration_20260313_103216 from './20260313_103216';
import * as migration_20260313_115600_add_portfolio_top_holdings_color from './20260313_115600_add_portfolio_top_holdings_color';
import * as migration_20260313_130800_backfill_portfolio_top_holdings_colors from './20260313_130800_backfill_portfolio_top_holdings_colors';
import * as migration_20260410_120000_add_performance_mtd_columns from './20260410_120000_add_performance_mtd_columns';
import * as migration_20260411_100000_fix_perf_mtd_db_column_name from './20260411_100000_fix_perf_mtd_db_column_name';
import * as migration_20260412_100000_add_footer_download_columns from './20260412_100000_add_footer_download_columns';
import * as migration_20260417_113419_add_advisors_collection from './20260417_113419_add_advisors_collection';
import * as migration_20260423_120000_enable_rls_on_public_tables from './20260423_120000_enable_rls_on_public_tables';
import * as migration_20260423_140000_deny_postgrest_rls_policies_on_public from './20260423_140000_deny_postgrest_rls_policies_on_public';
import * as migration_20260423_160000_add_advisor_slug_column from './20260423_160000_add_advisor_slug_column';

export const migrations = [
  {
    up: migration_20260313_103000.up,
    down: migration_20260313_103000.down,
    name: '20260313_103000',
  },
  {
    up: migration_20260313_103216.up,
    down: migration_20260313_103216.down,
    name: '20260313_103216',
  },
  {
    up: migration_20260313_115600_add_portfolio_top_holdings_color.up,
    down: migration_20260313_115600_add_portfolio_top_holdings_color.down,
    name: '20260313_115600_add_portfolio_top_holdings_color',
  },
  {
    up: migration_20260313_130800_backfill_portfolio_top_holdings_colors.up,
    down: migration_20260313_130800_backfill_portfolio_top_holdings_colors.down,
    name: '20260313_130800_backfill_portfolio_top_holdings_colors',
  },
  {
    up: migration_20260410_120000_add_performance_mtd_columns.up,
    down: migration_20260410_120000_add_performance_mtd_columns.down,
    name: '20260410_120000_add_performance_mtd_columns',
  },
  {
    up: migration_20260411_100000_fix_perf_mtd_db_column_name.up,
    down: migration_20260411_100000_fix_perf_mtd_db_column_name.down,
    name: '20260411_100000_fix_perf_mtd_db_column_name',
  },
  {
    up: migration_20260412_100000_add_footer_download_columns.up,
    down: migration_20260412_100000_add_footer_download_columns.down,
    name: '20260412_100000_add_footer_download_columns',
  },
  {
    up: migration_20260417_113419_add_advisors_collection.up,
    down: migration_20260417_113419_add_advisors_collection.down,
    name: '20260417_113419_add_advisors_collection',
  },
  {
    up: migration_20260423_120000_enable_rls_on_public_tables.up,
    down: migration_20260423_120000_enable_rls_on_public_tables.down,
    name: '20260423_120000_enable_rls_on_public_tables',
  },
  {
    up: migration_20260423_140000_deny_postgrest_rls_policies_on_public.up,
    down: migration_20260423_140000_deny_postgrest_rls_policies_on_public.down,
    name: '20260423_140000_deny_postgrest_rls_policies_on_public',
  },
  {
    up: migration_20260423_160000_add_advisor_slug_column.up,
    down: migration_20260423_160000_add_advisor_slug_column.down,
    name: '20260423_160000_add_advisor_slug_column',
  },
];
