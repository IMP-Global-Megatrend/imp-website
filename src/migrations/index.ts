import * as migration_20260313_103000 from './20260313_103000';
import * as migration_20260313_103216 from './20260313_103216';
import * as migration_20260313_115600_add_portfolio_top_holdings_color from './20260313_115600_add_portfolio_top_holdings_color';
import * as migration_20260313_130800_backfill_portfolio_top_holdings_colors from './20260313_130800_backfill_portfolio_top_holdings_colors';

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
];
