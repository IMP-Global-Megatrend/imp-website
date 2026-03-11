import type { ReactNode } from 'react'
import { HeroGrainientBackground } from '@/app/(frontend)/_components/HeroGrainientBackground'

type GradientMotionBackgroundProps = {
  seed?: number
  className?: string
  overlayClassName?: string
  children?: ReactNode
}

export function GradientMotionBackground({
  seed = 1337,
  className,
  overlayClassName = '',
  children,
}: GradientMotionBackgroundProps) {
  const rootClassName = className
    ? `relative h-full w-full overflow-hidden ${className}`
    : 'relative h-full w-full overflow-hidden'

  return (
    <div className={rootClassName}>
      <HeroGrainientBackground
        variant="home"
        palette={{ color1: 'oklch(0.46 0.18 258)', color2: 'oklch(0.46 0.14 242)', color3: 'oklch(0.46 0.12 274)' }}
        className={`absolute inset-0 z-0 pointer-events-none ${overlayClassName}`.trim()}
      />
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
