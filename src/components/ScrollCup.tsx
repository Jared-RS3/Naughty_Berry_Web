import { useLayoutEffect, useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'

/**
 * ScrollCup — the shared strawberry cup that travels with scroll:
 * hero centre → pinned right of Our Story → centre of the pinned Reviews
 * stage → docks as the menu carousel's centre cup (the Classic, "the
 * original").
 *
 * Each stop is an element tagged data-cup-anchor="hero|story|reviews|menu".
 * A stop inside a pinned stage (ancestor tagged data-cup-sticky-stage whose
 * parent is the tall scroll run) holds for the stage's whole pinned range.
 * ARRIVE tunes where in the viewport a stop is reached — the menu stop
 * arrives at 80% height so the cup snaps into the carousel early, while the
 * list is still rising into view.
 *
 * Flight character (per leg): an arc bow with a gentle banking lean, a small
 * perspective turn, a mid-flight swell and a depth pop toward the viewer.
 * Springs add float and a controlled settle on landing, and velocity drives a
 * squash-and-stretch so the cup lands with weight instead of sliding to a stop.
 *
 * Everything that animates here is transform or opacity, deliberately. The
 * cup's lighting is a single masked group of static gradients — a mask forces
 * its own render surface, and one whose contents never change gets cached as a
 * texture and transformed rather than repainted every frame. The ground shadow
 * is a soft radial gradient for the same reason: it used to animate
 * `filter: blur()`, which re-rasterises on every frame it changes.
 *
 * At the menu stop it hides and the real carousel cup takes over
 * (`fly-cup-docked` on <html> drives that swap via CSS); scrolling back up
 * un-docks it, so the Classic cup is always the one that flies away even if
 * another flavour is selected. Statics under the flyer hide via `cup-static`
 * while `fly-cup-on` is set, and stay visible on mobile / reduced motion.
 */

const CUP_SRC = '/naughty-hero-cup.png'
const RATIO = 548 / 712 // natural w/h of the cup cutout
// Reference box, deliberately larger than the cup ever renders. Every stop and
// every mid-flight swell therefore lands at scale < 1, so the promoted layer is
// only ever scaled *down* — 3D transforms that scale a rasterised layer up are
// what made the cup go soft mid-arc.
const BASE_H = 720
const BASE_W = BASE_H * RATIO

const STOPS = ['hero', 'story', 'reviews', 'menu'] as const
/** Viewport fraction (of height) where each free-flow stop is reached. */
const ARRIVE = [0.5, 0.5, 0.5, 0.8]
/** Pin windows around free-flow stops, in viewport-heights of scroll. */
const HOLD_BEFORE = [0, 0.18, 0, 0]
const HOLD_AFTER = [0.18, 0.18, 0, 0]
/**
 * Flight character per leg (stop i → i+1): banking tilt (deg, roll axis),
 * perspective yaw/pitch (deg), arc bulge as fractions of viewport height
 * (+y bows downward), a depth pop `bz` (px toward the viewer at mid-flight,
 * for real 3D travel through space) and a mid-flight swell.
 *
 * Yaw and pitch are kept small on purpose. Perspective rotation foreshortens
 * the cut-out, and because it is a photograph rather than real geometry, more
 * than a few degrees reads as the cup being squashed rather than turned. The
 * sense of a solid object comes from the lighting and the arc, not the angle.
 */
const LEGS = [
  { tilt: 4, yaw: 7, pitch: -3.5, bx: -0.05, by: 0.16, bz: 120, swell: 0.05 },
  { tilt: -4.5, yaw: -8, pitch: -3, bx: 0.06, by: 0.14, bz: 135, swell: 0.055 },
  // Into the menu: the biggest bow and the biggest swell of the three. The cup
  // lobs up and over toward the viewer before dropping into the carousel, so
  // the arrival is an event rather than a slide.
  { tilt: -6, yaw: -9, pitch: 4, bx: 0.09, by: -0.2, bz: 210, swell: 0.11 },
]

type Stop = { cx: number; vy: number; h: number; holdStart: number; holdEnd: number }

// Gentle sine ease-in-out. Its velocity peaks at only ~1.57× the average (vs 2×
// for the old cubic), so the cup travels each leg at a far more even, uniform
// pace — the springs then smooth the hand-off at both ends.
const easeInOut = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

/** Clips the light group to the cup's silhouette so it never leaks past the
 *  edge. A mask forces its own render surface, so there is exactly one of
 *  these; the blend mode sits on the group, which keeps the compositing
 *  identical to blending each layer separately. */
const SILHOUETTE = {
  WebkitMaskImage: `url(${CUP_SRC})`,
  maskImage: `url(${CUP_SRC})`,
  WebkitMaskSize: '100% 100%',
  maskSize: '100% 100%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
} as const

export default function ScrollCup({ loaded = true }: { loaded?: boolean }) {
  const stopsRef = useRef<Stop[] | null>(null)
  const observedRef = useRef(new Set<Element>())

  const mvX = useMotionValue(-9999)
  const mvY = useMotionValue(0)
  const mvScale = useMotionValue(0.5)
  const mvRoll = useMotionValue(0)
  const mvYaw = useMotionValue(0)
  const mvPitch = useMotionValue(0)
  const mvZ = useMotionValue(0)
  const mvOpacity = useMotionValue(0)

  // One coherent spring drives every flight channel — position, scale, depth
  // and the whole tumble. Sharing the exact same response means nothing races
  // ahead or lags behind, so the cup reads as a single body rather than a
  // bundle of parts settling at different rates.
  //
  // It is tuned stiff and slightly under-damped. A soft spring makes the cup
  // trail the scroll position, which reads as lag rather than as weight; the
  // small overshoot on arrival is what gives the landing its cartoon snap.
  const flightSpring = { stiffness: 210, damping: 19, mass: 0.7 }
  const sx = useSpring(mvX, flightSpring)
  const sy = useSpring(mvY, flightSpring)
  const sScale = useSpring(mvScale, flightSpring)
  const sZ = useSpring(mvZ, flightSpring)
  const sRoll = useSpring(mvRoll, flightSpring)
  const sYaw = useSpring(mvYaw, flightSpring)
  const sPitch = useSpring(mvPitch, flightSpring)
  // Fade the flyer on its own spring so docking into (and undocking out of) the
  // menu is a crossfade with the real carousel cup rather than a hard pop. Kept
  // brisk — a slow fade here is what made the hand-off into the menu feel like
  // the cup was dissolving instead of arriving.
  const sOpacity = useSpring(mvOpacity, { stiffness: 320, damping: 34 })

  // Squash and stretch, straight off the flight velocity: the cup elongates
  // along its travel while it's moving fast and compresses as it decelerates
  // into a stop. This is the whole cartoon read — without it a scaled photo
  // just slides, with it the cup feels like it has weight and lands.
  const vy = useVelocity(sy)
  const vyDamped = useSpring(vy, { stiffness: 420, damping: 22, mass: 0.5 })
  // Snapped to exactly 1 below a floor. Velocity is noisy and never settles on
  // a true zero, so without this the cup's transform kept changing by
  // fractions of a percent forever, holding its layer dirty and denying the
  // compositor the chance to go idle even when nothing is moving.
  const deform = (v: number, at: number) => {
    const m = Math.min(1, Math.abs(v) / 3200)
    return m < 0.02 ? 1 : 1 + (at - 1) * m
  }
  const stretchY = useTransform(vyDamped, (v) => deform(v, 1.16))
  const squashX = useTransform(vyDamped, (v) => deform(v, 0.88))

  // Idle life, driven off the clock rather than a keyframe loop, so it can be
  // stopped outright when there is nothing to see.
  // Out-of-phase periods keep the drift from ever looking like a cycle.
  //
  // Writing these ticks a chain of ~10 derived values and style writes, so the
  // loop bails whenever the flyer is off screen, docked, or the tab is hidden —
  // otherwise the whole page pays for a cup nobody can see.
  // Bob only. There used to be idle roll, yaw and pitch as well, but at the
  // couple of degrees they ran at they were invisible — and they kept three
  // more animated properties (plus everything derived from yaw) changing on
  // every frame forever, so the cup's layers could never settle. The float is
  // the part you actually read as "alive", and it is a single translate.
  const idleBob = useMotionValue(0)
  const idleOnRef = useRef(true)
  // The clock starts at hand-off, not at mount, so every idle channel is
  // exactly 0 at the instant the intro cup cross-fades into this one. Starting
  // from document time would drop the cup in mid-bob and show up as a jump.
  const idleT0 = useRef(0)

  useAnimationFrame((t) => {
    if (!loaded || !idleOnRef.current || document.hidden) return
    if (!idleT0.current) idleT0.current = t
    idleBob.set(Math.sin((t - idleT0.current) / 1900) * -6)
  })


  // Fixed world light: as the body turns, the highlight, rim and form shadow
  // travel across the silhouette instead of turning with it.
  // Ground shadow: spreads and washes out as the cup lifts toward the viewer
  // (sZ) or rides up on the bob — the depth cue that sells it as a solid.
  // Transform and opacity only. It used to animate `filter: blur()`, which
  // forces a re-raster every frame; the softness now comes from the radial
  // gradient itself, which costs nothing to move or scale.
  const shadowX = useTransform(sYaw, [-12, 12], [18, -18])
  const shadowScale = useTransform(
    [sZ, idleBob],
    ([z, b]: number[]) => (1 + z / 420) * (1 + b / 150)
  )
  const shadowOpacity = useTransform([sZ, idleBob], ([z, b]: number[]) =>
    Math.max(0.06, 0.34 - z / 640 + b / 280)
  )

  useLayoutEffect(() => {
    // The cup flies on every viewport — mobile carries its own pinned
    // Our Story / Reviews stages with matching anchors, so the whole
    // hero → story → reviews → menu choreography plays on a phone too.
    //
    // Deliberately NOT gated on prefers-reduced-motion: iOS Low Power Mode
    // reports reduce-motion, which was silently killing the whole scroll
    // experience on the exact devices this needs to shine on. The flight is
    // scroll-driven (it only moves when the finger does), so it stays on.
    const html = document.documentElement
    html.classList.add('fly-cup-on')
    // Local handle so the cleanup doesn't read a ref that may have changed.
    const observed = observedRef.current

    const measure = () => {
      const vh = window.innerHeight
      const found: Stop[] = []
      STOPS.forEach((name, i) => {
        // Both the desktop and the mobile layout carry an anchor for each stop;
        // whichever layout is hidden has display:none, so its rect is empty.
        // Pick the one that is actually laid out right now.
        const candidates = Array.from(
          document.querySelectorAll(`[data-cup-anchor="${name}"]`)
        )
        let el: Element | null = null
        let r: DOMRect | null = null
        for (const cand of candidates) {
          const cr = cand.getBoundingClientRect()
          if (cr.width >= 4 && cr.height >= 4) {
            el = cand
            r = cr
            break
          }
        }
        if (!el || !r) return
        if (!observed.has(el)) {
          observed.add(el)
          ro.observe(el)
        }
        const cx = r.left + r.width / 2
        const h = Math.min(r.width, r.height * RATIO) / RATIO

        const stage = el.closest('[data-cup-sticky-stage]')
        const run = stage?.parentElement
        if (stage && run) {
          // Pinned stage: the anchor is viewport-fixed from the moment the
          // run's top hits the viewport top until its bottom leaves.
          const runRect = run.getBoundingClientRect()
          const runTop = runRect.top + window.scrollY
          found.push({
            cx,
            vy: r.top - stage.getBoundingClientRect().top + r.height / 2,
            h,
            holdStart: runTop,
            holdEnd: runTop + Math.max(0, runRect.height - vh),
          })
        } else {
          const cy = r.top + window.scrollY + r.height / 2
          const s = Math.max(0, cy - vh * ARRIVE[i])
          found.push({
            cx,
            vy: cy - s,
            h,
            holdStart: s - HOLD_BEFORE[i] * vh,
            holdEnd: s + HOLD_AFTER[i] * vh,
          })
        }
      })
      found.sort((a, b) => a.holdStart - b.holdStart)
      stopsRef.current = found.length ? found : null
    }

    const compute = (scrollY: number) => {
      const S = stopsRef.current
      if (!S) return null
      const vh = window.innerHeight
      const last = S.length - 1
      let x: number, y: number, h: number
      let roll = 0
      let yaw = 0
      let pitch = 0
      let z = 0

      if (scrollY <= S[0].holdStart) {
        // ride with the document at the first stop
        x = S[0].cx
        y = S[0].vy + (S[0].holdStart - scrollY)
        h = S[0].h
      } else if (scrollY >= S[last].holdEnd) {
        x = S[last].cx
        y = S[last].vy + (S[last].holdEnd - scrollY)
        h = S[last].h
      } else {
        let i = 0
        while (scrollY > S[i].holdEnd) i++
        if (scrollY >= S[i].holdStart) {
          // pinned at stop i
          x = S[i].cx
          y = S[i].vy
          h = S[i].h
        } else {
          // in flight from stop i-1 to stop i
          const from = S[i - 1]
          const to = S[i]
          const start = from.holdEnd
          const end = to.holdStart
          const t = end <= start ? 1 : Math.min(1, Math.max(0, (scrollY - start) / (end - start)))
          const e = easeInOut(t)
          const arc = Math.sin(Math.PI * e)
          const leg = LEGS[Math.min(i - 1, LEGS.length - 1)]
          x = from.cx + (to.cx - from.cx) * e + leg.bx * vh * arc
          y = from.vy + (to.vy - from.vy) * e + leg.by * vh * arc
          h = (from.h + (to.h - from.h) * e) * (1 + leg.swell * arc)
          roll = leg.tilt * arc
          yaw = leg.yaw * arc
          pitch = leg.pitch * arc
          z = leg.bz * arc
        }
      }

      const docked = S.length === STOPS.length && scrollY >= S[last].holdStart - 1
      return { x, y, h, roll, yaw, pitch, z, docked }
    }

    const apply = (jump = false) => {
      const out = compute(window.scrollY)
      if (!out) return
      // Gate the idle loop: nothing to animate once the cup has left the
      // viewport or handed over to the carousel.
      idleOnRef.current =
        !out.docked &&
        out.y + out.h / 2 > -40 &&
        out.y - out.h / 2 < window.innerHeight + 40
      html.classList.toggle('fly-cup-docked', out.docked)
      mvX.set(out.x - BASE_W / 2)
      mvY.set(out.y - BASE_H / 2)
      mvScale.set(out.h / BASE_H)
      mvRoll.set(out.roll)
      mvYaw.set(out.yaw)
      mvPitch.set(out.pitch)
      mvZ.set(out.docked ? 0 : out.z)
      mvOpacity.set(out.docked ? 0 : 1)
      if (jump) {
        sx.jump(mvX.get())
        sy.jump(mvY.get())
        sScale.jump(mvScale.get())
        sZ.jump(mvZ.get())
        sRoll.jump(mvRoll.get())
        sYaw.jump(mvYaw.get())
        sPitch.jump(mvPitch.get())
        sOpacity.jump(mvOpacity.get())
      }
    }

    // Scroll fires far more often than the screen refreshes, and `measure()`
    // reads layout for every anchor. Coalescing both onto one rAF caps the work
    // at once per frame and keeps the reads out of the scroll handler itself.
    let frame = 0
    let needsMeasure = false
    const schedule = (remeasureToo = false) => {
      needsMeasure ||= remeasureToo
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        if (needsMeasure) {
          needsMeasure = false
          measure()
        }
        apply()
      })
    }

    const remeasure = () => schedule(true)
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    measure()
    apply(true)

    const onScroll = () => schedule()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    window.addEventListener('load', remeasure)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('load', remeasure)
      ro.disconnect()
      observed.clear()
      html.classList.remove('fly-cup-on', 'fly-cup-docked')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      aria-hidden="true"
      className="nb-flyer fixed left-0 top-0 z-40 pointer-events-none"
      style={{
        x: sx,
        y: sy,
        opacity: sOpacity,
        width: BASE_W,
        height: BASE_H,
        willChange: 'transform',
      }}
    >
      {/* Hand-off — the intro overlay zooms a copy of the cup down onto this
          exact spot and cross-fades out, so the flyer only has to appear. An
          entrance of its own here would read as the cup arriving twice. */}
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.3, ease: 'linear' }}
        style={{ transformPerspective: 1000 }}
      >
      {/* Scale layer — the floor plane lives here, so the ground shadow scales
          with the cup but never inherits its tumble. */}
      <motion.div className="relative w-full h-full" style={{ scale: sScale }}>
        {/* Ground shadow — stays flat on the floor as the body turns above it */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            left: '18%',
            width: '64%',
            bottom: '0.5%',
            height: '5.5%',
            borderRadius: '50%',
            x: shadowX,
            scale: shadowScale,
            opacity: shadowOpacity,
            background:
              'radial-gradient(ellipse at center, rgba(74,24,48,0.70) 0%, rgba(74,24,48,0.30) 38%, rgba(74,24,48,0.10) 62%, transparent 80%)',
          }}
        />

        {/* Solid body — depth (z toward the viewer), the full roll/pitch/yaw
            tumble and the idle bob all ride one perspective layer, so the cup
            banks and turns as a single sculpted object. */}
        <motion.div
          className="w-full h-full"
          style={{
            y: idleBob,
            z: sZ,
            rotate: sRoll,
            rotateX: sPitch,
            rotateY: sYaw,
            transformPerspective: 1150,
            // No preserve-3d: nothing here is positioned in 3D space, and it
            // forces a 3D rendering context that blocks layer squashing.
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          {/* Squash and stretch. Its own layer, below the rotation, so the cup
              deforms along the screen's vertical rather than along whatever
              angle it happens to be banked at — which is how it's drawn in
              animation, and the only version that doesn't look like a glitch.
              Origin at the base so it plants on landing. */}
          <motion.div
            className="relative w-full h-full"
            style={{
              scaleX: squashX,
              scaleY: stretchY,
              transformOrigin: '50% 92%',
              willChange: 'transform',
            }}
          >
            {/* One drop-shadow, not three. drop-shadow is a per-pixel blur and
                it is re-rasterised whenever the layer's scale changes — which,
                on a cup that is constantly rescaling as it flies, meant three
                full-size blurs every frame. The ground shadow below carries the
                weight; this only has to lift the cup off the pink. */}
            <img
              src={CUP_SRC}
              alt=""
              className="cup-img w-full h-full select-none"
              style={
                {
                  '--cup-shadow': 'drop-shadow(0 14px 20px rgba(80,30,55,0.28))',
                } as React.CSSProperties
              }
              draggable={false}
            />

            {/* Lighting. One masked group, and everything inside it is static:
                a mask forces its own render surface, and a surface whose
                contents never change can be cached as a texture and simply
                transformed with the cup instead of repainted every frame.
                (The light used to slide against the cup's yaw — at the ±3° the
                cup now turns, that parallax was invisible and cost a repaint
                per frame.) The multiply shade group was dropped entirely: it
                was a second surface, and it desaturated the product shot. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ ...SILHOUETTE, mixBlendMode: 'screen' }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(58% 44% at 32% 20%, rgba(255,255,255,0.50) 0%, rgba(255,238,247,0.17) 46%, transparent 74%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(258deg, rgba(255,248,252,0.62) 0%, rgba(255,220,236,0.20) 9%, transparent 24%)',
                }}
              />
              <div
                className="cup-sheen absolute inset-y-0 w-[45%]"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.34) 45%, rgba(255,255,255,0.12) 58%, transparent 100%)',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      </motion.div>
    </motion.div>
  )
}
