import React from 'react'

import type { Page } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'

export function CMSPageContent({ page }: { page: Page }) {
  return (
    <article className="pb-16">
      {page.hero && <RenderHero {...page.hero} />}
      {Array.isArray(page.layout) && page.layout.length > 0 && (
        <RenderBlocks blocks={page.layout as never} />
      )}
    </article>
  )
}
