import React from 'react'

import { HeaderThemeProvider } from '@/providers/HeaderTheme'
import { ThemeProvider } from '@/providers/Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </ThemeProvider>
  )
}
