'use client'

import { useEffect, useRef } from 'react'

type Blob = {
  cx: number
  cy: number
  ax: number
  ay: number
  sx: number
  sy: number
  phase: number
  radius: number
  alpha: number
  color: [number, number, number]
}

const PALETTE: Array<[number, number, number]> = [
  [52, 91, 255],
  [70, 205, 255],
  [114, 72, 255],
  [255, 185, 66],
  [86, 252, 186],
]

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function createBlobs(width: number, height: number, seed: number): Blob[] {
  const rand = createSeededRandom(seed)
  const size = Math.max(width, height)

  return Array.from({ length: 9 }, (_, index) => ({
    cx: width * (0.12 + rand() * 0.76),
    cy: height * (0.12 + rand() * 0.76),
    ax: width * (0.04 + rand() * 0.09),
    ay: height * (0.04 + rand() * 0.09),
    sx: 0.00028 + rand() * 0.00025,
    sy: 0.00031 + rand() * 0.00022,
    phase: rand() * Math.PI * 2,
    radius: size * (0.19 + rand() * 0.15),
    alpha: 0.16 + rand() * 0.12,
    color: PALETTE[index % PALETTE.length]!,
  }))
}

export function OgGradientCanvas({ seed = 1337, opacity = 1 }: { seed?: number; opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    const width = 1200
    const height = 630
    canvas.width = width
    canvas.height = height

    const blobs = createBlobs(width, height, seed)
    let frame: number | null = null

    const render = (timeMs: number) => {
      context.clearRect(0, 0, width, height)
      context.globalCompositeOperation = 'screen'

      for (const blob of blobs) {
        const x = blob.cx + Math.sin(timeMs * blob.sx + blob.phase) * blob.ax
        const y = blob.cy + Math.cos(timeMs * blob.sy + blob.phase) * blob.ay
        const gradient = context.createRadialGradient(x, y, blob.radius * 0.08, x, y, blob.radius)
        gradient.addColorStop(0, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.alpha})`)
        gradient.addColorStop(0.6, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.alpha * 0.45})`)
        gradient.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`)
        context.fillStyle = gradient
        context.fillRect(x - blob.radius, y - blob.radius, blob.radius * 2, blob.radius * 2)
      }

      context.globalCompositeOperation = 'source-over'
      frame = window.requestAnimationFrame(render)
    }

    frame = window.requestAnimationFrame(render)

    return () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame)
      }
    }
  }, [seed])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        filter: 'blur(24px)',
      }}
    />
  )
}
