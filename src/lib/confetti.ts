/**
 * Confetti burst, hand-rolled so the page doesn't pull a library for one
 * celebratory moment. Mounts its own fixed canvas above everything, runs a
 * simple gravity + drag simulation, then tears itself down — nothing to clean
 * up from the calling component.
 */

const PALETTE = ['#E8176D', '#FF6BAD', '#FFB8D2', '#FFF9ED', '#C01057', '#F7C983']

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vrot: number
  color: string
  /** Ribbons tumble; discs stay round. Mixing the two is what stops a burst
   *  reading as a uniform spray of dots. */
  ribbon: boolean
  life: number
}

export type ConfettiOptions = {
  /** Burst origin in viewport fractions (0–1). Defaults to just above centre. */
  originX?: number
  originY?: number
  count?: number
}

export function burstConfetti({
  originX = 0.5,
  originY = 0.38,
  count = 140,
}: ConfettiOptions = {}): () => void {
  if (typeof window === 'undefined') return () => {}
  // Nothing here is load-bearing — if the visitor asked for less motion, the
  // celebration is simply the copy that lands with it.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.remove()
    return () => {}
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const resize = () => {
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  const ox = window.innerWidth * originX
  const oy = window.innerHeight * originY

  const particles: Particle[] = Array.from({ length: count }, () => {
    // Fan the burst upward and outward: a full circle would send half of it
    // straight into the floor before anyone sees it.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.15
    const speed = 7 + Math.random() * 13
    return {
      x: ox + (Math.random() - 0.5) * 60,
      y: oy + (Math.random() - 0.5) * 30,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.32,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      ribbon: Math.random() > 0.38,
      life: 0,
    }
  })

  let raf = 0
  let stopped = false

  const stop = () => {
    if (stopped) return
    stopped = true
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    canvas.remove()
  }

  const tick = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    let alive = 0

    for (const p of particles) {
      p.life += 1
      p.vy += 0.32 // gravity
      p.vx *= 0.988 // drag
      p.vy *= 0.988
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot

      if (p.y > window.innerHeight + 60) continue
      alive++

      const fade = Math.max(0, 1 - Math.max(0, p.life - 90) / 70)
      ctx.save()
      ctx.globalAlpha = fade
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.ribbon) {
        // Squashing height by the rotation fakes a strip flipping through space.
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.5 * Math.abs(Math.cos(p.rot)))
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    }

    if (alive === 0) return stop()
    raf = requestAnimationFrame(tick)
  }

  raf = requestAnimationFrame(tick)
  return stop
}
