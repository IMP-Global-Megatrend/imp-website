'use client'

import { useEffect, useRef, type ForwardRefExoticComponent } from 'react'
import {
  ArrowUpRightIcon,
  ChartLineIcon,
  CircleDollarSignIcon,
  CompassIcon,
  DownloadIcon,
  EarthIcon,
  HomeIcon,
  LinkedinIcon,
  MailCheckIcon,
  MenuIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from 'lucide-animated'

type AnimatedIconName =
  | 'arrowUpRight'
  | 'chartLine'
  | 'circleDollar'
  | 'compass'
  | 'download'
  | 'earth'
  | 'home'
  | 'linkedin'
  | 'mailCheck'
  | 'menu'
  | 'trendingUp'
  | 'users'
  | 'x'

const icons = {
  arrowUpRight: ArrowUpRightIcon,
  chartLine: ChartLineIcon,
  circleDollar: CircleDollarSignIcon,
  compass: CompassIcon,
  download: DownloadIcon,
  earth: EarthIcon,
  home: HomeIcon,
  linkedin: LinkedinIcon,
  mailCheck: MailCheckIcon,
  menu: MenuIcon,
  trendingUp: TrendingUpIcon,
  users: UsersIcon,
  x: XIcon,
}

export function AnimatedIcon({
  name,
  size = 16,
  className,
  animate,
  'aria-hidden': ariaHidden = true,
}: {
  name: AnimatedIconName
  size?: number
  className?: string
  animate?: boolean
  'aria-hidden'?: boolean
}) {
  const Icon = icons[name] as unknown as ForwardRefExoticComponent<any>
  const iconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null)

  useEffect(() => {
    if (animate === undefined) return
    if (animate) {
      iconRef.current?.startAnimation?.()
      return
    }
    iconRef.current?.stopAnimation?.()
  }, [animate])

  return <Icon ref={iconRef} size={size} className={className} aria-hidden={ariaHidden} />
}
