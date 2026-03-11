type QuoteBandSectionProps = {
  heading?: string
  quotes: string[]
  className?: string
  headingClassName?: string
}

export function QuoteBandSection({ heading, quotes, className, headingClassName }: QuoteBandSectionProps) {
  const visibleQuotes = quotes.map((quote) => quote.trim()).filter(Boolean)

  if (visibleQuotes.length === 0) return null

  return (
    <section className={`bg-secondary py-20 md:py-24 ${className || ''}`.trim()}>
      <div className="container">
        <div className="max-w-5xl space-y-6">
          {heading ? (
            <h3 className={headingClassName || 'text-white font-display font-medium leading-relaxed text-[18px] md:text-[19px]'}>
              {heading}
            </h3>
          ) : null}
          <div className={`grid grid-cols-1 gap-6 md:gap-8 ${visibleQuotes.length > 1 ? 'md:grid-cols-2' : ''}`.trim()}>
            {visibleQuotes.map((quote, index) => (
              <blockquote
                key={`${index}-${quote.slice(0, 24)}`}
                className="border-l border-primary-light pl-8 pr-8 text-[#62A8FF] font-thin leading-relaxed text-[18px] md:text-[19px] whitespace-pre-line"
              >
                {quote}
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
