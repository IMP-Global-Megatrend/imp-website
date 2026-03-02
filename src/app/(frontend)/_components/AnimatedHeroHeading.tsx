'use client'

type AnimatedHeroHeadingProps = {
  heading: string
  className?: string
}

export function AnimatedHeroHeading({ heading, className }: AnimatedHeroHeadingProps) {
  const revealStepMs = 90
  const targetWord = 'Tomorrow'
  const targetIndex = heading.indexOf(targetWord)
  const revealClass =
    'inline-block opacity-0 [transform:translateY(0.45em)] blur-[2px] animate-[hero-word-reveal_520ms_cubic-bezier(0.22,1,0.36,1)_forwards]'

  if (targetIndex === -1) {
    const words = heading.trim().split(/\s+/).filter(Boolean)

    return (
      <h1 className={className}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={revealClass}
            style={{ animationDelay: `${index * revealStepMs}ms` }}
          >
            {word}
            {index < words.length - 1 ? '\u00A0' : null}
          </span>
        ))}
      </h1>
    )
  }

  const prefix = heading.slice(0, targetIndex)
  const suffix = heading.slice(targetIndex + targetWord.length)
  const cleanedSuffix = suffix.replace(/^ Today\b/, '')
  const punctuationMatch = cleanedSuffix.match(/^[.!?,;:]+/)
  const animatedPunctuation = punctuationMatch?.[0] ?? ''
  const remainingSuffix = cleanedSuffix.slice(animatedPunctuation.length)
  const prefixWords = prefix.trim().split(/\s+/).filter(Boolean)
  const suffixWords = remainingSuffix.trim().split(/\s+/).filter(Boolean)
  const animatedWordIndex = prefixWords.length

  return (
    <h1 className={className}>
      {prefixWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={revealClass}
          style={{ animationDelay: `${index * revealStepMs}ms` }}
        >
          {word}
          {'\u00A0'}
        </span>
      ))}
      <span
        className={revealClass}
        style={{ animationDelay: `${animatedWordIndex * revealStepMs}ms` }}
      >
        <span className="inline-block align-baseline [perspective:1000px]">
          <span className="relative inline-block h-[1.1em] min-w-[8.8ch] overflow-hidden align-baseline">
            <span className="absolute inset-0 inline-block [transform-style:preserve-3d] [transform-origin:50%_50%] animate-[hero-word-flip_3.2s_ease-in-out_infinite_alternate]">
              <span className="absolute inset-0 inline-block [backface-visibility:hidden]">
                {`Tomorrow${animatedPunctuation}`}
              </span>
              <span className="absolute inset-0 inline-block [backface-visibility:hidden] [transform:rotateX(180deg)]">
                {`Today${animatedPunctuation}`}
              </span>
            </span>
          </span>
        </span>
      </span>
      {suffixWords.length > 0 ? '\u00A0' : null}
      {suffixWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={revealClass}
          style={{ animationDelay: `${(animatedWordIndex + 1 + index) * revealStepMs}ms` }}
        >
          {word}
          {index < suffixWords.length - 1 ? '\u00A0' : null}
        </span>
      ))}
    </h1>
  )
}
