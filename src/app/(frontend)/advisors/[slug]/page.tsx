import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ActionLinkButton } from '@/app/(frontend)/_components/ActionLinkButton'
import { Breadcrumb } from '@/app/(frontend)/_components/Breadcrumb'
import { resolveCmsUploadObjectToUrl } from '@/app/(frontend)/_components/getCMSPageBySlug'
import LightHeaderPageClient from '@/app/(frontend)/_components/LightHeaderPageClient'
import { PageHero } from '@/app/(frontend)/_components/PageHero'
import {
  ADVISOR_PAGE_HERO_PALETTE,
  ADVISOR_PAGE_HERO_SECTION_CLASS,
} from '@/app/(frontend)/advisors/advisorHeroPalette'
import { getAllAdvisorSlugParams, queryAdvisorBySlug } from '@/app/(frontend)/_lib/advisorQueries'
import { decodeSlugParam } from '@/app/(frontend)/_lib/contentQueries'
import fallbacks from '@/constants/fallbacks.json'
import { getServerSideURL } from '@/utilities/getURL'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { ogImagePathForRoute } from '@/utilities/ogImage'

import type { Advisor } from '@/payload-types'

/** Set to true when advisor portraits should show on /advisors/[slug]. */
const SHOW_ADVISOR_PROFILE_IMAGE = false

function bioToParagraphs(bio: string): string[] {
  return bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function descriptionFromAdvisor(advisor: Advisor): string {
  const paras = bioToParagraphs(typeof advisor.bio === 'string' ? advisor.bio : '')
  const first = paras[0] || ''
  const withRole = `${advisor.roleTitle}. ${first}`.trim()
  return withRole.length > 165 ? `${withRole.slice(0, 162).trimEnd()}…` : withRole
}

function photoSrcForAdvisor(advisor: Advisor): string | null {
  return resolveCmsUploadObjectToUrl(advisor.photo)
}

export async function generateStaticParams() {
  return getAllAdvisorSlugParams()
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function AdvisorPage({ params: paramsPromise }: Args) {
  const { slug: raw = '' } = await paramsPromise
  const decodedSlug = decodeSlugParam(raw)
  const advisor = await queryAdvisorBySlug(decodedSlug)
  if (!advisor) notFound()

  const paragraphs = bioToParagraphs(typeof advisor.bio === 'string' ? advisor.bio : '')
  const photoSrc = SHOW_ADVISOR_PROFILE_IMAGE ? photoSrcForAdvisor(advisor) : null

  return (
    <main className="bg-white text-[#0b1035]">
      <LightHeaderPageClient />
      <PageHero
        title={advisor.name}
        subtitle={advisor.roleTitle}
        palette={ADVISOR_PAGE_HERO_PALETTE}
        sectionClassName={ADVISOR_PAGE_HERO_SECTION_CLASS}
      />

      <div className="container max-w-3xl py-12 md:py-16">
        <div className="mb-8">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'About us', href: '/about-us' },
              { label: advisor.name || 'Advisor' },
            ]}
            textClassName="text-[16px] md:text-[17px]"
          />
        </div>
        {photoSrc ? (
          <div className="mb-10 w-full max-w-[280px] overflow-hidden rounded-lg border border-[#e8ebf7] bg-white sm:max-w-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS URLs (Supabase / API paths) */}
            <img
              src={photoSrc}
              alt={`Portrait of ${advisor.name}`}
              className="aspect-[3/4] w-full object-cover object-top"
              loading="eager"
            />
          </div>
        ) : null}
        <div className="space-y-4 text-[17px] leading-relaxed text-[#2b3045]">
          {paragraphs.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {advisor.linkedinUrl && advisor.linkedinUrl.trim() ? (
          <div className="mt-10">
            <ActionLinkButton
              href={advisor.linkedinUrl.trim()}
              label="Connect on LinkedIn"
              icon="users"
              external
              iconBefore
              buttonVariant="outlineMuted"
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: raw = '' } = await paramsPromise
  const decodedSlug = decodeSlugParam(raw)
  const advisor = await queryAdvisorBySlug(decodedSlug)
  if (!advisor) {
    return { title: 'Advisor | ' + (fallbacks.metadata.aboutUs?.title || 'IMP Global Megatrend') }
  }

  const path = `/advisors/${advisor.slug}`
  const siteUrl = getServerSideURL()
  const canonical = path.startsWith('/') ? path : `/${path}`
  const desc = descriptionFromAdvisor(advisor)
  const imageUrl = `${siteUrl}${ogImagePathForRoute(canonical)}`
  const pageTitle = `${advisor.name} | Advisory board`

  return {
    title: pageTitle,
    description: desc,
    alternates: { canonical },
    openGraph: mergeOpenGraph({
      title: pageTitle,
      description: desc,
      url: `${siteUrl}${canonical}`,
      images: [{ url: imageUrl }],
    }),
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: desc,
      images: [imageUrl],
    },
  }
}
