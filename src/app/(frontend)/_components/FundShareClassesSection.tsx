import type { FundShareClassMeta } from '@/app/(frontend)/_components/getCMSPageBySlug'

type ShareClassContent = {
  title: string
  feeLabel: string
  feeText: string
  isin: string
  wkn: string
  bloomberg: string
}

type ShareClassMetaEntry = {
  isinLabel: string
  isinValue: string
  wknLabel: string
  wknValue: string
  bloombergLabel: string
  bloombergValue: string
}

function splitLabelAndBadge(rawLabel: string): { label: string; badge: string | null } {
  const value = rawLabel.trim()
  if (!value) return { label: '', badge: null }

  // Handles:
  // - "ISIN (USD Share Class)"
  // - "Bloomberg Ticker (USD Share Class" (missing trailing parenthesis)
  const openingParenIndex = value.indexOf('(')
  if (openingParenIndex === -1) return { label: value, badge: null }

  const base = value.slice(0, openingParenIndex).trim()
  const rawBadge = value
    .slice(openingParenIndex + 1)
    .replace(/\)+$/, '')
    .trim()

  if (!rawBadge) return { label: base || value, badge: null }
  return { label: base || value, badge: rawBadge }
}

function LabelWithBadge({ rawLabel }: { rawLabel: string }) {
  const { label } = splitLabelAndBadge(rawLabel)

  return (
    <span className="font-medium" aria-label={rawLabel}>
      {label}
    </span>
  )
}

function FundShareClassInfoTable({
  metaEntry,
  fallback,
}: {
  metaEntry: ShareClassMetaEntry | undefined
  fallback: Pick<ShareClassContent, 'isin' | 'wkn' | 'bloomberg'>
}) {
  const rows = [
    {
      label: (metaEntry?.isinLabel || 'ISIN').trim(),
      value: metaEntry?.isinValue || fallback.isin,
    },
    {
      label: (metaEntry?.wknLabel || 'WKN').trim(),
      value: metaEntry?.wknValue || fallback.wkn,
    },
    {
      label: (metaEntry?.bloombergLabel || 'Bloomberg').trim(),
      value: metaEntry?.bloombergValue || fallback.bloomberg,
    },
  ]

  return (
    <div className="mt-5 overflow-hidden border-y border-[#d9def0]">
      <table className="w-full text-sm font-display text-[#2b3045] border-collapse">
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.label}-${index}`} className={index < rows.length - 1 ? 'border-b border-[#d9def0]' : ''}>
              <th scope="row" className="py-2 pr-4 text-left align-middle">
                <LabelWithBadge rawLabel={row.label} />
              </th>
              <td className="w-[1%] whitespace-nowrap py-2 text-right align-middle">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FundShareClassColumn({
  content,
  metaEntry,
  side,
}: {
  content: ShareClassContent
  metaEntry: ShareClassMetaEntry | undefined
  side: 'left' | 'right'
}) {
  const isChfShareClass = /chf/i.test(content.title)
  const flagSrc = isChfShareClass ? '/images/flags/ch.svg' : '/images/flags/us.svg'
  const flagAlt = isChfShareClass ? 'Swiss flag' : 'United States flag'

  return (
    <article className={side === 'left' ? 'md:pr-8' : 'md:pl-8'}>
      <img src={flagSrc} alt={flagAlt} className="mb-3 h-5 w-auto" loading="lazy" />
      <h2 className="text-[22px] leading-[1.3] text-[#0b1035] mb-1">{content.title}</h2>
      <div className="mb-3">
        <span className="inline-flex items-center rounded-full border border-primary-light/30 px-2.5 py-1 text-[10px] font-display uppercase tracking-[0.08em] text-primary">
          {content.feeLabel}
        </span>
      </div>
      <p className="text-[#2b3045]">{content.feeText}</p>
      <FundShareClassInfoTable
        metaEntry={metaEntry}
        fallback={{ isin: content.isin, wkn: content.wkn, bloomberg: content.bloomberg }}
      />
    </article>
  )
}

export function FundShareClassesSection({
  usdContent,
  chfContent,
  shareClassMeta,
}: {
  usdContent: ShareClassContent
  chfContent: ShareClassContent
  shareClassMeta: FundShareClassMeta | null
}) {
  return (
    <section className="relative border-t border-[#d9def0]">
      <div aria-hidden className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-[#d9def0]" />
      <div className="container py-10 md:py-12">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12">
          <FundShareClassColumn content={usdContent} metaEntry={shareClassMeta?.usd} side="left" />
          <FundShareClassColumn content={chfContent} metaEntry={shareClassMeta?.chf} side="right" />
        </div>
      </div>
    </section>
  )
}
