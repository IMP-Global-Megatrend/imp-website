import type { ReactNode } from 'react'
import { HeroGradientCanvas } from './HeroGradientCanvas'

type GradientMotionBackgroundProps = {
  seed?: number
  className?: string
  overlayClassName?: string
  children?: ReactNode
}

export function GradientMotionBackground({
  seed = 1337,
  className,
  overlayClassName = 'bg-gradient-to-b from-primary/35 via-primary/12 to-primary/58',
  children,
}: GradientMotionBackgroundProps) {
  const rootClassName = className ? `grid h-full w-full ${className}` : 'grid h-full w-full'

  return (
    <div className={rootClassName}>
      <HeroGradientCanvas seed={seed} />
      <div className={`row-start-1 col-start-1 h-full w-full ${overlayClassName}`}>
        {children}
      </div>
    </div>
  )
}
