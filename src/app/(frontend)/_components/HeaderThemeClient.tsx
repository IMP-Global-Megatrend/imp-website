'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

type HeaderThemeClientProps = {
  theme: 'light' | 'dark'
}

export default function HeaderThemeClient({ theme }: HeaderThemeClientProps) {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(theme)
  }, [setHeaderTheme, theme])

  return <React.Fragment />
}
