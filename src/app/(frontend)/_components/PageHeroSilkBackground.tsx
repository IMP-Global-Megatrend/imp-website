'use client'

import { HeroGrainientBackground } from '@/app/(frontend)/_components/HeroGrainientBackground'

export type PageHeroPalette = {
  color1: string
  color2: string
  color3: string
}

export function PageHeroSilkBackground({ palette }: { palette: PageHeroPalette }) {
  return (
    <HeroGrainientBackground
      variant="page"
      palette={palette}
      className="absolute inset-x-0 top-0 -bottom-px z-0 pointer-events-none"
    />
  )
}
