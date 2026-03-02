'use client'

import { useEffect, useRef } from 'react'

type Blob = {
  cx: number
  cy: number
  ax: number
  ay: number
  ax2: number
  ay2: number
  sx: number
  sy: number
  sx2: number
  sy2: number
  phase: number
  pulse: number
  r: number
  a: number
  color: [number, number, number]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function createBlobs(seed: number, width: number, height: number): Blob[] {
  const runtimeSalt = Math.floor(Math.random() * 0xffffffff)
  const rand = createSeededRandom((seed ^ runtimeSalt) >>> 0)
  const palette: Array<[number, number, number]> = [
    [0, 0, 255],
    [0, 128, 255],
    [128, 0, 255],
    [255, 255, 0],
    [0, 255, 128],
    [0, 255, 255],
  ]
  const size = Math.max(width, height)

  const baseBlobs = Array.from({ length: 10 }, (_, i) => ({
    cx: width * (0.18 + rand() * 0.64),
    cy: height * (0.18 + rand() * 0.64),
    ax: width * (0.05 + rand() * 0.07),
    ay: height * (0.05 + rand() * 0.07),
    ax2: width * (0.015 + rand() * 0.02),
    ay2: height * (0.015 + rand() * 0.02),
    sx: 0.00034 + rand() * 0.00024,
    sy: 0.00031 + rand() * 0.00024,
    sx2: 0.0007 + rand() * 0.00035,
    sy2: 0.00064 + rand() * 0.00035,
    phase: rand() * Math.PI * 2,
    pulse: 0.00018 + rand() * 0.00012,
    r: size * (0.16 + rand() * 0.12),
    a: 0.17 + rand() * 0.14,
    color: palette[i % palette.length]!,
  }))

  // Dedicated orange blob locked away from the center area.
  const orangeOnLeft = rand() < 0.5
  const orangeBlob: Blob = {
    cx: width * (orangeOnLeft ? 0.08 + rand() * 0.22 : 0.7 + rand() * 0.22),
    cy: height * (0.18 + rand() * 0.64),
    ax: width * 0.06,
    ay: height * 0.05,
    ax2: width * 0.018,
    ay2: height * 0.016,
    sx: 0.00042,
    sy: 0.00036,
    sx2: 0.00082,
    sy2: 0.00074,
    phase: rand() * Math.PI * 2,
    pulse: 0.00022,
    r: size * 0.2,
    a: 0.24,
    color: [255, 128, 0],
  }

  return [...baseBlobs, orangeBlob]
}

export function HeroGradientCanvas({ seed = 1337 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const blobsRef = useRef<Blob[]>([])
  const sizeRef = useRef({ width: 1, height: 1 })
  const startTimeRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
      const width = Math.max(1, Math.floor(rect.width))
      const height = Math.max(1, Math.floor(rect.height))
      const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5)

      const changed = width !== sizeRef.current.width || height !== sizeRef.current.height
      sizeRef.current = { width, height }

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (changed || blobsRef.current.length === 0) {
        blobsRef.current = createBlobs(seed, width, height)
      }
    }

    const render = (timeMs: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timeMs
      }

      const { width, height } = sizeRef.current
      ctx.clearRect(0, 0, width, height)
      ctx.globalCompositeOperation = 'screen'
      const fadeDuration = 1200
      const fadeT = Math.min(1, (timeMs - startTimeRef.current) / fadeDuration)
      const fade = 1 - Math.pow(1 - fadeT, 3)

      for (const blob of blobsRef.current) {
        const x =
          blob.cx +
          Math.sin(timeMs * blob.sx + blob.phase) * blob.ax +
          Math.sin(timeMs * blob.sx2 + blob.phase * 1.9) * blob.ax2
        const y =
          blob.cy +
          Math.cos(timeMs * blob.sy + blob.phase) * blob.ay +
          Math.cos(timeMs * blob.sy2 + blob.phase * 1.6) * blob.ay2
        const radiusScale = 0.9 + (Math.sin(timeMs * blob.pulse + blob.phase) + 1) * 0.1
        const radius = blob.r * radiusScale
        const alpha = blob.a * fade
        const gradient = ctx.createRadialGradient(x, y, radius * 0.08, x, y, radius)
        gradient.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${alpha})`)
        gradient.addColorStop(0.6, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${alpha * 0.45})`)
        gradient.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`)
        ctx.fillStyle = gradient
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      }

      ctx.globalCompositeOperation = 'source-over'
      frameRef.current = window.requestAnimationFrame(render)
    }

    resize()
    render(performance.now())

    const resizeObserver = new ResizeObserver(resize)
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    } else {
      resizeObserver.observe(canvas)
    }
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
      resizeObserver.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      className="row-start-1 col-start-1 h-full w-full scale-[1.06] pointer-events-none blur-[22px]"
      aria-hidden="true"
    />
  )
}
