'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type BlobConfig = {
  phase: number
  speed: number
  radius: number
  driftX: number
  driftY: number
  alpha: number
  color: [number, number, number]
  noiseSeedX: number
  noiseSeedY: number
  noiseSpeedX: number
  noiseSpeedY: number
  centerX: number
  centerY: number
  aspectX: number
  aspectY: number
  rotationPhase: number
  rotationSpeed: number
  morphPhase: number
  morphSpeed: number
  speedVariance: number
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

function fract(value: number): number {
  return value - Math.floor(value)
}

// Lightweight smooth-ish value noise for organic blob motion.
function noise1D(time: number, seed: number): number {
  const t = time * 0.00007 + seed * 17.17
  const i0 = Math.floor(t)
  const i1 = i0 + 1
  const f = t - i0
  const smooth = f * f * (3 - 2 * f)

  const r0 = fract(Math.sin(i0 * 127.1 + seed * 311.7) * 43758.5453)
  const r1 = fract(Math.sin(i1 * 127.1 + seed * 311.7) * 43758.5453)
  return (r0 + (r1 - r0) * smooth) * 2 - 1
}

export function HeroGradientCanvas({ seed = 1337 }: { seed?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isVisibleRef = useRef(true)
  const prefersReducedMotionRef = useRef(false)
  const mouseTargetRef = useRef({ x: 0.5, y: 0.5 })
  const mouseCurrentRef = useRef({ x: 0.5, y: 0.5 })
  const [isCanvasVisible, setIsCanvasVisible] = useState(false)

  const blobs = useMemo<BlobConfig[]>(
    () => {
      const rand = createSeededRandom(seed)
      const palette: Array<[number, number, number]> = [
        [36, 45, 255], // vivid primary blue
        [0, 92, 255], // saturated blue
        [92, 115, 255], // bright electric blue
        [120, 78, 255], // saturated indigo
        [164, 90, 255], // vivid violet
        [208, 70, 255], // magenta-purple
        [255, 56, 128], // hot pink
        [255, 98, 58], // warm coral
        [255, 138, 32], // vivid orange
        [255, 176, 24], // warm amber
        [255, 210, 0], // saturated yellow
        [255, 155, 84], // peach
        [255, 84, 64], // warm red-orange
        [255, 108, 0], // deep orange
        [255, 194, 64], // golden orange
        [48, 199, 126], // emerald green
        [112, 221, 142], // mint green
        [18, 170, 98], // deep green
        [0, 130, 232], // deep cyan-blue
      ]

      return Array.from({ length: 12 }, (_, i) => ({
        phase: rand() * Math.PI * 2,
        speed: 0.00012 + rand() * 0.00016,
        radius: 0.16 + rand() * 0.22,
        driftX: 0.12 + rand() * 0.26,
        driftY: 0.12 + rand() * 0.26,
        alpha: 0.24 + rand() * 0.24,
        color: palette[i % palette.length]!,
        noiseSeedX: rand() * 999,
        noiseSeedY: rand() * 999,
        noiseSpeedX: 0.75 + rand() * 1.05,
        noiseSpeedY: 0.75 + rand() * 1.05,
        centerX: 0.2 + rand() * 0.6,
        centerY: 0.2 + rand() * 0.6,
        aspectX: 0.75 + rand() * 0.75,
        aspectY: 0.75 + rand() * 0.75,
        rotationPhase: rand() * Math.PI * 2,
        rotationSpeed: 0.00006 + rand() * 0.00008,
        morphPhase: rand() * Math.PI * 2,
        morphSpeed: 0.00008 + rand() * 0.0001,
        speedVariance: 0.22 + rand() * 0.26,
      }))
    },
    [seed],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsCanvasVisible(true)
    }, 40)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    let width = 0
    let height = 0
    let dpr = 1

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      const rect = parent?.getBoundingClientRect() ?? canvas.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      dpr = clamp(window.devicePixelRatio || 1, 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const drawFrame = (timeMs: number) => {
      context.clearRect(0, 0, width, height)

      // Ease mouse influence so gradients softly follow the cursor.
      mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.06
      mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.06

      const interactionX = (mouseCurrentRef.current.x - 0.5) * width
      const interactionY = (mouseCurrentRef.current.y - 0.5) * height
      const t = timeMs
      const reducedMotion = prefersReducedMotionRef.current
      const motionScale = reducedMotion ? 0.2 : 1
      const followScale = reducedMotion ? 0.04 : 0.14

      context.globalCompositeOperation = 'source-over'

      for (const blob of blobs) {
        const speedPulse = 1 + noise1D(t * 0.35, blob.noiseSeedX + 97.1) * blob.speedVariance
        const driftSpeed = blob.speed * Math.max(0.45, speedPulse)
        const rotationSpeed = blob.rotationSpeed * Math.max(0.45, speedPulse * 0.9 + 0.1)
        const morphSpeed = blob.morphSpeed * Math.max(0.55, speedPulse * 0.85 + 0.15)
        const baseRadiusPx = Math.max(width, height) * blob.radius
        const randomX = noise1D(t * blob.noiseSpeedX, blob.noiseSeedX) * width * 0.14 * motionScale
        const randomY = noise1D(t * blob.noiseSpeedY, blob.noiseSeedY) * height * 0.14 * motionScale
        const x =
          width * blob.centerX +
          Math.sin(t * driftSpeed + blob.phase) * width * blob.driftX * motionScale +
          randomX +
          interactionX * followScale
        const y =
          height * blob.centerY +
          Math.cos(t * driftSpeed * 1.13 + blob.phase * 1.27) * height * blob.driftY * motionScale +
          randomY +
          interactionY * followScale
        const rotation =
          Math.sin(t * rotationSpeed + blob.rotationPhase) * 0.7 +
          noise1D(t * morphSpeed * 0.6, blob.noiseSeedX + 23.7) * 0.25
        const morph = Math.sin(t * morphSpeed + blob.morphPhase)
        const morphOffset = noise1D(t * morphSpeed * 1.35, blob.noiseSeedY + 71.3)
        const aspectPulse = 1 + morph * 0.38 + morphOffset * 0.18
        const sx = Math.max(0.45, blob.aspectX * aspectPulse)
        const sy = Math.max(0.45, blob.aspectY * (2 - aspectPulse))
        const radiusPx = baseRadiusPx * (0.82 + (morph + 1) * 0.22)

        context.save()
        context.translate(x, y)
        context.rotate(rotation)
        context.scale(sx, sy)

        const highlightX = Math.cos(t * rotationSpeed + blob.phase) * radiusPx * 0.16
        const highlightY = Math.sin(t * rotationSpeed * 1.1 + blob.phase) * radiusPx * 0.16
        const gradient = context.createRadialGradient(
          -highlightX * 0.35,
          -highlightY * 0.35,
          radiusPx * 0.05,
          0,
          0,
          radiusPx * 1.08,
        )
        gradient.addColorStop(
          0,
          `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.alpha * (0.92 + (morph + 1) * 0.12)})`,
        )
        gradient.addColorStop(
          0.55,
          `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, ${blob.alpha * 0.6})`,
        )
        gradient.addColorStop(1, `rgba(${blob.color[0]}, ${blob.color[1]}, ${blob.color[2]}, 0)`)

        const blurPx = Math.max(16, radiusPx * 0.26)
        context.filter = `blur(${blurPx}px)`
        context.fillStyle = gradient
        context.fillRect(-radiusPx, -radiusPx, radiusPx * 2, radiusPx * 2)
        context.filter = 'none'
        context.restore()
      }

      context.globalCompositeOperation = 'source-over'
    }

    const tick = (timeMs: number) => {
      if (!isVisibleRef.current) return
      drawFrame(timeMs)
      rafRef.current = window.requestAnimationFrame(tick)
    }

    const stopLoop = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const startLoop = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(tick)
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = clamp((event.clientX - rect.left) / rect.width, 0, 1)
      const y = clamp((event.clientY - rect.top) / rect.height, 0, 1)
      mouseTargetRef.current = { x, y }
    }

    const handlePointerLeave = () => {
      mouseTargetRef.current = { x: 0.5, y: 0.5 }
    }

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateReducedMotion = () => {
      prefersReducedMotionRef.current = motionQuery.matches
    }
    updateReducedMotion()

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = Boolean(entry?.isIntersecting)
        if (isVisibleRef.current) {
          startLoop()
        } else {
          stopLoop()
        }
      },
      { threshold: 0.01 },
    )

    resizeCanvas()
    drawFrame(performance.now())
    observer.observe(canvas)
    startLoop()

    window.addEventListener('resize', resizeCanvas, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    motionQuery.addEventListener('change', updateReducedMotion)

    return () => {
      stopLoop()
      observer.disconnect()
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      motionQuery.removeEventListener('change', updateReducedMotion)
    }
  }, [blobs])

  return (
    <canvas
      ref={canvasRef}
      className={`row-start-1 col-start-1 h-full w-full pointer-events-none transition-opacity duration-1000 ease-out ${
        isCanvasVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden="true"
    />
  )
}
