import type { PageHeroPalette } from '@/app/(frontend)/_components/PageHeroSilkBackground'

/**
 * Hero silk gradient for `/advisors/[slug]` only — separate from About Us and other
 * {@link PageHero} pages so advisory profiles have their own visual identity.
 */
export const ADVISOR_PAGE_HERO_PALETTE: PageHeroPalette = {
  color1: '#1a2f5c',
  color2: 'oklch(0.52 0.11 210)',
  color3: 'oklch(0.48 0.09 305)',
}

/**
 * Replaces `PageHero`’s default `bg-[#2b3dea]` (merged last) so the section base
 * matches the advisor grain’s primary tone.
 */
export const ADVISOR_PAGE_HERO_SECTION_CLASS = 'bg-[#1a2f5c]'
