'use client'

import { forwardRef, useEffect, useRef, useState, type ForwardRefExoticComponent } from 'react'
import {
  ArrowUpRightIcon,
  BadgePercentIcon,
  BoxesIcon,
  ChartLineIcon,
  CircleDollarSignIcon,
  CompassIcon,
  DownloadIcon,
  EarthIcon,
  MapPinCheckIcon,
  HomeIcon,
  LinkedinIcon,
  MailCheckIcon,
  MenuIcon,
  RocketIcon,
  ShieldCheckIcon,
  TelescopeIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from 'lucide-animated'

export type AnimatedIconName =
  | 'arrowUpRight'
  | 'badgePercent'
  | 'boxes'
  | 'chartLine'
  | 'circleDollar'
  | 'compass'
  | 'download'
  | 'earth'
  | 'graduationCap'
  | 'mapPinCheck'
  | 'home'
  | 'linkedin'
  | 'mailCheck'
  | 'menu'
  | 'rocket'
  | 'shieldCheck'
  | 'telescope'
  | 'trendingUp'
  | 'users'
  | 'x'

const GraduationCapIcon = forwardRef<SVGSVGElement, { size?: number; className?: string; 'aria-hidden'?: boolean }>(
  ({ size = 16, className, 'aria-hidden': ariaHidden = true }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  ),
)
GraduationCapIcon.displayName = 'GraduationCapIcon'

const icons = {
  arrowUpRight: ArrowUpRightIcon,
  badgePercent: BadgePercentIcon,
  boxes: BoxesIcon,
  chartLine: ChartLineIcon,
  circleDollar: CircleDollarSignIcon,
  compass: CompassIcon,
  download: DownloadIcon,
  earth: EarthIcon,
  graduationCap: GraduationCapIcon,
  mapPinCheck: MapPinCheckIcon,
  home: HomeIcon,
  linkedin: LinkedinIcon,
  mailCheck: MailCheckIcon,
  menu: MenuIcon,
  rocket: RocketIcon,
  shieldCheck: ShieldCheckIcon,
  telescope: TelescopeIcon,
  trendingUp: TrendingUpIcon,
  users: UsersIcon,
  x: XIcon,
}

export function AnimatedIcon({
  name,
  size = 16,
  className,
  animate,
  animateOnHover = false,
  'aria-hidden': ariaHidden = true,
}: {
  name: AnimatedIconName
  size?: number
  className?: string
  animate?: boolean
  animateOnHover?: boolean
  'aria-hidden'?: boolean
}) {
  const Icon = icons[name] as unknown as ForwardRefExoticComponent<any>
  const wrapperRef = useRef<HTMLSpanElement | null>(null)
  const iconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null)
  const hasStartedAnimationRef = useRef(false)
  const [isHovered, setIsHovered] = useState(false)
  const shouldAnimate = animateOnHover ? isHovered : animate

  useEffect(() => {
    if (!animateOnHover) return

    const wrapper = wrapperRef.current
    const groupElement = wrapper?.closest('.group') as HTMLElement | null
    if (!groupElement) return

    const start = () => setIsHovered(true)
    const stop = () => setIsHovered(false)

    groupElement.addEventListener('mouseenter', start)
    groupElement.addEventListener('mouseleave', stop)

    return () => {
      groupElement.removeEventListener('mouseenter', start)
      groupElement.removeEventListener('mouseleave', stop)
    }
  }, [animateOnHover])

  useEffect(() => {
    if (shouldAnimate === undefined) return
    if (shouldAnimate) {
      iconRef.current?.startAnimation?.()
      hasStartedAnimationRef.current = true
      return
    }
    if (!hasStartedAnimationRef.current) return
    iconRef.current?.stopAnimation?.()
  }, [shouldAnimate])

  return (
    <span
      ref={wrapperRef}
      className="inline-flex"
      onMouseEnter={animateOnHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={animateOnHover ? () => setIsHovered(false) : undefined}
    >
      <Icon ref={iconRef} size={size} className={className} aria-hidden={ariaHidden} />
    </span>
  )
}
