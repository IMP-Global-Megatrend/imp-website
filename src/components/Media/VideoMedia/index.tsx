'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '@/components/Media/types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

function filenameToLabel(filename: string): string {
  const withoutExt = filename.replace(/\.[a-zA-Z0-9]+$/, '')
  const normalized = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!normalized) return 'Media video'
  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { alt: altFromProps, onClick, resource, videoClassName } = props

  const videoRef = useRef<HTMLVideoElement>(null)
  // const [showFallback] = useState<boolean>()

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { alt: altFromResource, filename } = resource
    const ariaLabel =
      (typeof altFromProps === 'string' && altFromProps.trim()) ||
      (typeof altFromResource === 'string' && altFromResource.trim()) ||
      (typeof filename === 'string' ? filenameToLabel(filename) : '') ||
      'Media video'

    return (
      <video
        aria-label={ariaLabel}
        autoPlay
        className={cn(videoClassName)}
        controls={false}
        loop
        muted
        onClick={onClick}
        playsInline
        ref={videoRef}
      >
        <source src={getMediaUrl(`/media/${filename}`)} />
      </video>
    )
  }

  return null
}
