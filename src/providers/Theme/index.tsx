'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from '@/providers/Theme/types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, themeLocalStorageKey } from '@/providers/Theme/shared'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(canUseDOM ? 'light' : undefined)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    void themeToSet
    setThemeState('light')
    window.localStorage.setItem(themeLocalStorageKey, 'light')
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  useEffect(() => {
    const themeToSet: Theme = defaultTheme
    window.localStorage.setItem(themeLocalStorageKey, themeToSet)
    document.documentElement.setAttribute('data-theme', themeToSet)
    setThemeState(themeToSet)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
