import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile'

/**
 * Intro — two beats.
 *
 *  1. BRAND. The film plays behind the Naughty Berry mark and a progress bar.
 *     This beat exists to buy time, so it is also where the rest of the site is
 *     fetched: the below-fold route chunks and the images the first two screens
 *     need. It ends when that work is done, not on a fixed timer.
 *  2. ZOOM. The cup fills the screen, then zooms out and lands exactly where the
 *     hero cup lives while the headline rises in behind it.
 *
 * The zoom is a FLIP, not a cross-dissolve: the overlay cup is laid out directly
 * on the hero anchor's own rect, then pushed out to full screen with a
 * transform. Animating that transform back to identity lands it pixel-perfect on
 * the real cup, and both are graded by the same `.cup-img` rule, so the hand-off
 * is one continuous cup rather than a swap between two.
 *
 * Nothing but transform and opacity ever animates, and the flight is driven by a
 * single rAF writing motion values — no React renders per frame — so the whole
 * sequence stays on the compositor.
 */

const CUP_SRC = '/naughty-hero-cup.webp'
const LOGO_SRC = '/naughty-berry-logo.png'
// const FILM_SRC = '/2026-02-22T12-01-38_ultra_realistic_watermarked.mp4'
const FILM_SRC = '/loader-poster.jpg'
const POSTER_SRC = '/loader-poster.jpg'
const RATIO = 548 / 712 // natural w/h of the cup cut-out

/** Where the printed Naughty Berry wordmark sits inside the cut-out, 0–1. */
const LOGO_FOCUS = { x: 0.5, y: 0.57 }

/** Beat 1: long enough to read the mark, short enough not to be a toll gate. */
const BRAND_MIN_MS = 1050
/** …and never hold the brand beat past this, however slow the network is. */
const BRAND_MAX_MS = 4000
/** Cross-fade from the film to the cup. */
const SWAP_MS = 470
/** Beat 2, and how long before its end the hand-off overlap starts. */
const FLIGHT_MS = 920
const HANDOFF_MS = 240

/** Fetched during beat 1 so the first two screens are warm on arrival. */
const WARM_IMAGES = [CUP_SRC, '/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png']
const WARM_CHUNKS = [
  () => import('./About'),
  () => import('./Testimonials'),
  () => import('./MenuPreview'),
]

type Props = {
  /** Fires as the zoom-out starts — the cue for the hero to animate in. */
  onReveal: () => void
  /** Fires once the overlay has handed off and can be unmounted. */
  onDone: () => void
}

const preloadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = img.onerror = () => resolve()
    img.src = src
    if (img.decode) img.decode().then(() => resolve(), () => resolve())
  })

export default function LoadingScreen({ onReveal, onDone }: Props) {
  const prefersReducedMotion = useReducedMotion()
  // On phones the brand film is a still, not a video. The 576KB clip has to be
  // fetched and then decoded frame-by-frame on the main thread during the exact
  // window the site is booting and the cup is about to fly — on mobile that
  // decode competes with everything and is what made the intro feel heavy. The
  // poster is a frame of the same film (already preloaded for the boot screen),
  // so the phone intro looks the same but costs one static image instead.
  const isMobile = useIsMobile()
  const [gone, setGone] = useState(false)
  const [progress, setProgress] = useState(0)
  const cupRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Flight channels. Motion values, so the animation never round-trips through
  // React state.
  const scale = useMotionValue(1)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cupOpacity = useMotionValue(0)
  const brandOpacity = useMotionValue(1)
  const veilOpacity = useMotionValue(1)
  const markOpacity = useMotionValue(0)

  const phase = useRef<'brand' | 'swap' | 'fly' | 'done'>('brand')
  const swapAt = useRef(0)
  const flyAt = useRef(0)
  const from = useRef({ scale: 1, x: 0, y: 0 })

  const finish = useCallback(() => {
    if (phase.current === 'done') return
    phase.current = 'done'
    document.documentElement.classList.remove('nb-intro')
    setGone(true)
    onDone()
  }, [onDone])

  /* ── Freeze the page and hide the real cups for the duration ── */
  useLayoutEffect(() => {
    const html = document.documentElement
    html.classList.add('nb-intro')
    window.scrollTo(0, 0)
    // Take over from the static boot screen in index.html. This runs in the
    // same commit as our own first paint, and we draw the same poster, gradient
    // and mark, so there is no frame where neither is on screen.
    document.getElementById('boot')?.remove()
    return () => html.classList.remove('nb-intro')
  }, [])

  /* ── Place the cup, warm the site, then run the sequence ── */
  useLayoutEffect(() => {
    let raf = 0
    let cancelled = false

    // Lay the overlay cup on the hero's own box and push it out to full screen.
    const place = () => {
      const anchor = document.querySelector('[data-cup-anchor="hero"]')
      const img = cupRef.current
      const r = anchor?.getBoundingClientRect()
      // Height comes from the ratio rather than the DOM, so this doesn't have
      // to wait on the cup image having decoded.
      if (!img || !r || r.width < 4) {
        raf = requestAnimationFrame(place)
        return
      }
      const height = r.width / RATIO
      // Set as a custom property rather than in JSX: framer's MotionStyle only
      // accepts known CSS keys, and `.cup-img` reads the shadow from this var.
      // On mobile the cup carries NO drop-shadow: a drop-shadow is a per-pixel
      // blur that re-rasterises on every frame the layer rescales, and the
      // zoom-out rescales the cup on every single frame — the one thing certain
      // to stutter on a phone. The mobile ScrollCup flyer it hands off to is
      // shadowless too, so dropping it here also removes the shadow pop at the
      // hand-off. Desktop keeps the shadow for weight.
      img.style.setProperty(
        '--cup-shadow',
        isMobile ? 'none' : 'drop-shadow(0 14px 24px rgba(80,30,55,0.26))'
      )
      img.style.left = `${r.left}px`
      img.style.top = `${r.top}px`
      img.style.width = `${r.width}px`
      img.style.height = `${height}px`

      const vw = window.innerWidth
      const vh = window.innerHeight
      // Big enough to fill the screen, but never so wide it runs off a phone.
      const s = Math.min(vh / height, (vw * 1.15) / r.width)
      // Scaling happens about the printed logo so that point stays put; the
      // translate then carries it to the middle of the viewport.
      const logoX = r.left + r.width * LOGO_FOCUS.x
      const logoY = r.top + height * LOGO_FOCUS.y
      from.current = { scale: s, x: vw / 2 - logoX, y: vh / 2 - logoY }
      scale.set(s)
      x.set(from.current.x)
      y.set(from.current.y)
    }

    place()

    // Beat 1 doubles as the site's warm-up. The progress bar tracks real work.
    const jobs = [...WARM_IMAGES.map((s) => preloadImage(s)), ...WARM_CHUNKS.map((f) => f())]
    let settled = 0
    for (const job of jobs) {
      Promise.resolve(job).catch(() => {}).then(() => {
        if (cancelled) return
        settled += 1
        setProgress(Math.round((settled / jobs.length) * 100))
      })
    }

    const beginSwap = () => {
      if (cancelled || phase.current !== 'brand') return
      setProgress(100)
      // Stop the film the instant the cup takes over. It fades out over the swap
      // and is covered by the cup, so the last decoded frame is never seen — but
      // left playing it keeps decoding video frames on the main thread through
      // the whole zoom-out, which is exactly the beat that has to stay at 60fps.
      // Pausing here hands the flight a clear thread.
      videoRef.current?.pause()
      // Re-place: fonts and images landing during beat 1 can move the hero.
      place()
      swapAt.current = performance.now()
      phase.current = prefersReducedMotion ? 'fly' : 'swap'
      if (prefersReducedMotion) {
        flyAt.current = swapAt.current
        onReveal()
      }
    }

    const held = new Promise((r) => setTimeout(r, prefersReducedMotion ? 0 : BRAND_MIN_MS))
    const capped = new Promise((r) => setTimeout(r, BRAND_MAX_MS))
    Promise.race([Promise.all([...jobs.map((j) => Promise.resolve(j).catch(() => {})), held]), capped])
      .then(beginSwap)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── One rAF drives both beats ── */
  useAnimationFrame(() => {
    const now = performance.now()

    if (phase.current === 'swap') {
      const t = now - swapAt.current
      const p = Math.min(1, t / SWAP_MS)
      const e = p * p * (3 - 2 * p) // smoothstep
      // The film and mark clear as the cup rises in, already at full size.
      brandOpacity.set(1 - e)
      cupOpacity.set(e)
      markOpacity.set(e)
      if (p === 1) {
        phase.current = 'fly'
        flyAt.current = now
        onReveal()
      }
      return
    }

    if (phase.current !== 'fly') return
    if (prefersReducedMotion) return finish()

    const t = now - flyAt.current
    const p = Math.min(1, t / FLIGHT_MS)
    // Ease-out cubic. The cup still leads out immediately, but without the
    // violent initial spike of an expo curve (~7× the average velocity in the
    // first frames), which is what made the old zoom read as a snap followed by
    // a crawl. Cubic peaks at ~3×, so the whole travel is one smooth, even glide
    // that decelerates gently onto the hero mark.
    const e = 1 - Math.pow(1 - p, 3)
    const f = from.current

    scale.set(f.scale + (1 - f.scale) * e)
    x.set(f.x * (1 - e))
    y.set(f.y * (1 - e))

    // The veil clears early so the headline is revealed while the cup is still
    // travelling; the strapline only lives while the cup is large.
    veilOpacity.set(Math.max(0, 1 - t / (FLIGHT_MS * 0.45)))
    markOpacity.set(Math.max(0, 1 - t / (FLIGHT_MS * 0.3)))

    if (t >= FLIGHT_MS - HANDOFF_MS) {
      document.documentElement.classList.remove('nb-intro')
      cupOpacity.set(Math.max(0, 1 - (t - (FLIGHT_MS - HANDOFF_MS)) / HANDOFF_MS))
    }
    if (t >= FLIGHT_MS) finish()
  })

  if (gone) return null

  return (
    <div className="fixed inset-0 z-[999] overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Beat 2's backdrop, underneath everything — the brand layer sits on top
          of it and clears to reveal it. */}
      <motion.div className="absolute inset-0 bg-[#FFDCEA]" style={{ opacity: veilOpacity }} />

      {/* ── Beat 1: film + mark ── */}
      <motion.div className="absolute inset-0" style={{ opacity: brandOpacity }}>
        {/* The poster is what the boot screen already painted, so the film has
            something to be until it has buffered — it never shows through. On
            mobile the poster IS the brand layer; the video is desktop-only. */}
        {isMobile ? (
          <img
            src={POSTER_SRC}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) saturate(1.35)' }}
          />
        ) : (
          <video
            ref={videoRef}
            src={FILM_SRC}
            poster={POSTER_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) saturate(1.35)' }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, rgba(232,23,109,0.42) 0%, rgba(45,18,37,0.84) 55%, rgba(20,4,14,0.97) 100%)',
          }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
          {/* No entrance — the boot screen already has this on screen at full
              size, and animating it here would make it pop a second time. */}
          <img
            src={LOGO_SRC}
            alt="Naughty Berry"
            className="w-[clamp(220px,38vw,360px)]"
            style={{ filter: 'drop-shadow(0 8px 36px rgba(232,23,109,0.62))' }}
            draggable={false}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.55, ease: 'easeOut' }}
            className="mt-6 text-white/60 text-[11px] font-bold tracking-[0.32em] uppercase"
          >
            Cape Town’s Sweetest Obsession
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.45 }}
            className="mt-12 w-full max-w-[240px]"
          >
            <div className="relative h-[3px] rounded-full bg-white/12 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#E8176D]"
                style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Beat 2: the cup. Position and size are written imperatively from the
             hero's own rect; only the transform is animated. ── */}
      <motion.img
        ref={cupRef}
        src={CUP_SRC}
        alt=""
        fetchPriority="high"
        decoding="async"
        draggable={false}
        className="cup-img absolute select-none"
        style={{
          transformOrigin: `${LOGO_FOCUS.x * 100}% ${LOGO_FOCUS.y * 100}%`,
          x,
          y,
          scale,
          opacity: cupOpacity,
          willChange: 'transform, opacity',
        }}
      />

      <motion.div
        className="absolute inset-x-0 bottom-[9%] flex justify-center"
        style={{ opacity: markOpacity }}
      >
        <span className="text-[11px] font-bold tracking-[0.34em] uppercase text-[#E8176D]/70">
          Strawberries &amp; Chocolate On Tap
        </span>
      </motion.div>
    </div>
  )
}
