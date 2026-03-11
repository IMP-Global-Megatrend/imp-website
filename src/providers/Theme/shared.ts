import type { Theme } from '@/providers/Theme/types'

export const themeLocalStorageKey = 'payload-theme'

export const defaultTheme = 'light'

export const getImplicitPreference = (): Theme | null => {
  return 'light'
}
