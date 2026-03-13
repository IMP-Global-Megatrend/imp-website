'use client'

import type { CSSProperties } from 'react'

type AnimatedHeroHeadingProps = {
  heading: string
  className?: string
}

export function AnimatedHeroHeading({ heading, className }: AnimatedHeroHeadingProps) {
  const revealStepMs = 90
  const leaveStepMs = 110
  const leaveWordDurationMs = 110
  const targetWord = 'Tomorrow'
  const targetIndex = heading.indexOf(targetWord)
  const revealClass =
    'inline-block opacity-0 [transform:translateY(0.45em)] blur-[2px] animate-[hero-word-reveal_520ms_cubic-bezier(0.22,1,0.36,1)_forwards]'

  const getWordStyle = (index: number, totalWords: number): CSSProperties =>
    ({
      animationDelay: `${index * revealStepMs}ms`,
      '--hero-word-leave-delay': `${(totalWords - 1 - index) * leaveStepMs}ms`,
    }) as CSSProperties

  const getHeadingStyle = (totalWords: number): CSSProperties =>
    ({
      '--hero-word-leave-total-ms': `${(totalWords - 1) * leaveStepMs + leaveWordDurationMs}ms`,
    }) as CSSProperties

  if (targetIndex === -1) {
    const words = heading.trim().split(/\s+/).filter(Boolean)

    return (
      <h1 className={['hero-heading', className].filter(Boolean).join(' ')} style={getHeadingStyle(words.length)}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className={`${revealClass} hero-heading-word`}
            style={getWordStyle(index, words.length)}
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
  const totalWords = prefixWords.length + 1 + suffixWords.length

  return (
    <h1 className={['hero-heading', className].filter(Boolean).join(' ')} style={getHeadingStyle(totalWords)}>
      {prefixWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={`${revealClass} hero-heading-word`}
          style={getWordStyle(index, totalWords)}
        >
          {word}
          {'\u00A0'}
        </span>
      ))}
      <span
        className={`${revealClass} hero-heading-word`}
        style={getWordStyle(animatedWordIndex, totalWords)}
      >
        <span className="hero-word-flip-perspective inline-flex items-baseline align-baseline [perspective:1000px]">
          <span className="hero-word-flip-window relative inline-block h-[1em] min-w-[8.8ch] overflow-hidden align-baseline leading-[inherit]">
            <span className="hero-word-flip-rotator absolute inset-0 inline-block [transform-style:preserve-3d] [transform-origin:50%_50%] animate-[hero-word-flip_3.2s_ease-in-out_infinite_alternate]">
              <span className="hero-word-flip-face hero-word-flip-face-front absolute inset-0 inline-block [backface-visibility:hidden]">
                {`Tomorrow${animatedPunctuation}`}
              </span>
              <span className="hero-word-flip-face hero-word-flip-face-back absolute inset-0 inline-block [backface-visibility:hidden] [transform:rotateX(180deg)]">
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
          className={`${revealClass} hero-heading-word`}
          style={getWordStyle(animatedWordIndex + 1 + index, totalWords)}
        >
          {word}
          {index < suffixWords.length - 1 ? '\u00A0' : null}
        </span>
      ))}
    </h1>
  )
}
