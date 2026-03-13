import * as migration_20260313_103000 from './20260313_103000';
import * as migration_20260313_103216 from './20260313_103216';

export const migrations = [
  {
    up: migration_20260313_103000.up,
    down: migration_20260313_103000.down,
    name: '20260313_103000'
  },
  {
    up: migration_20260313_103216.up,
    down: migration_20260313_103216.down,
    name: '20260313_103216'
  },
];
