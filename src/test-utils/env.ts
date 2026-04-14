/**
 * Snapshot / restore process.env keys for isolated route tests.
 */

export function snapshotEnv(keys: string[]): { restore: () => void } {
  const snapshot: Record<string, string | undefined> = {}
  for (const key of keys) {
    snapshot[key] = process.env[key]
  }
  return {
    restore: () => {
      for (const key of keys) {
        const value = snapshot[key]
        if (value === undefined) {
          Reflect.deleteProperty(process.env, key)
        } else {
          process.env[key] = value
        }
      }
    },
  }
}
