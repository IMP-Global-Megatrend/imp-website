import Link from 'next/link'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { AlternatingFeatureLayout } from '@/app/(frontend)/_components/AlternatingFeatureLayout'
import { ActionLinkButton } from '@/app/(frontend)/_components/ActionLinkButton'
import { formatArticleDate } from '@/app/(frontend)/articles/_lib/formatArticleDate'
import type { ArticleListItem } from '@/app/(frontend)/articles/_lib/types'

type ArticlesAlternatingListProps = {
  posts: ArticleListItem[]
  startIndex?: number
}

export function ArticlesAlternatingList({ posts, startIndex = 0 }: ArticlesAlternatingListProps) {
  return (
    <div>
      {posts.map((post, idx) => {
        const globalIndex = startIndex + idx
        const reverse = globalIndex % 2 === 1
        const href = `/articles/${post.slug}`
        const image =
          typeof post.heroImage === 'object'
            ? post.heroImage
            : typeof post.meta?.image === 'object'
              ? post.meta.image
              : null
        const authorLabel =
          post.populatedAuthors && post.populatedAuthors.length > 0
            ? formatAuthors(post.populatedAuthors)
            : `Article ${globalIndex + 1}`
        const bylineLabel = formatArticleDate(post.publishedAt) || authorLabel

        return (
          <section key={post.id} className="scroll-mt-24 pt-16 md:pt-20 pb-0">
            <div className="container">
              <AlternatingFeatureLayout
                className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-stretch"
                reverse={reverse}
                contentClassName="h-full order-2"
                mediaClassName={`flex items-center justify-center order-1 ${reverse ? 'lg:pr-8' : 'lg:pl-8'}`}
                content={
                  <div className="flex h-full items-stretch gap-4">
                    <div className="hidden md:flex items-stretch gap-2 shrink-0 self-stretch">
                      <span
                        className="font-display text-right text-[#0b1035] text-[18px] font-medium whitespace-nowrap pt-0 pb-2"
                        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                      >
                        {authorLabel}
                      </span>
                      <span aria-hidden className="w-px self-stretch bg-[#d9def0]" />
                    </div>
                    <div className="flex-1 self-start pb-5 md:pb-6">
                      <p className="font-display text-[12px] text-[#5f6477] uppercase tracking-[0.15em] mb-2">
                        {bylineLabel}
                      </p>
                      <h2 className="text-[28px] md:text-[32px] leading-[1.2] text-[#0b1035] mb-4">
                        <Link href={href} className="hover:text-[#2b3dea] transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      {post.meta?.description ? (
                        <p className="text-[17px] md:text-[18px] text-[#2b3045] leading-relaxed mb-6">
                          {post.meta.description}
                        </p>
                      ) : null}
                      <ActionLinkButton
                        href={href}
                        label="Read article"
                        icon="arrowUpRight"
                        buttonVariant="outlineMuted"
                      />
                    </div>
                  </div>
                }
                media={
                  <div className="w-full">
                    <Link href={href} className="block w-full">
                      {image ? (
                        <Media
                          resource={image}
                          className="overflow-hidden bg-white"
                          imgClassName="w-full h-auto object-cover"
                        />
                      ) : (
                        <div className="aspect-[16/10] bg-[#f4f6fb]" />
                      )}
                    </Link>
                  </div>
                }
              />
            </div>
            <div className="w-full border-b border-[#d9def0]" />
          </section>
        )
      })}
    </div>
  )
}
