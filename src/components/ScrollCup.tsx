import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

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
 * Flight character (per leg): an arc bow with a gentle banking lean, soft
 * perspective yaw/pitch so the cutout turns like a 3D object, a mid-flight
 * swell, and a faint cross-faded blur for speed. Springs add float and a
 * controlled settle on landing. At rest the cup bobs, sways and slowly yaws
 * under a looping glass sheen, so it never reads as a flat sticker.
 *
 * At the menu stop it hides and the real carousel cup takes over
 * (`fly-cup-docked` on <html> drives that swap via CSS); scrolling back up
 * un-docks it, so the Classic cup is always the one that flies away even if
 * another flavour is selected. Statics under the flyer hide via `cup-static`
 * while `fly-cup-on` is set, and stay visible on mobile / reduced motion.
 */

const CUP_SRC = '/naughty-hero-cup.png'
const RATIO = 548 / 712 // natural w/h of the cup cutout
const BASE_H = 520
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
 * (+y bows downward), mid-flight swell and speed-blur strength. Kept gentle —
 * the cup leans and glides rather than flips.
 */
const LEGS = [
  { tilt: 13, yaw: 15, pitch: -7, bx: -0.05, by: 0.16, swell: 0.1, blur: 0.22 },
  { tilt: -13, yaw: -16, pitch: -6, bx: 0.06, by: 0.14, swell: 0.12, blur: 0.25 },
  { tilt: 10, yaw: 13, pitch: 8, bx: -0.08, by: 0.06, swell: 0.1, blur: 0.28 },
]

type Stop = { cx: number; vy: number; h: number; holdStart: number; holdEnd: number }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

export default function ScrollCup() {
  const [active, setActive] = useState(false)
  const stopsRef = useRef<Stop[] | null>(null)
  const observedRef = useRef(new Set<Element>())

  const mvX = useMotionValue(-9999)
  const mvY = useMotionValue(0)
  const mvScale = useMotionValue(0.5)
  const mvRoll = useMotionValue(0)
  const mvYaw = useMotionValue(0)
  const mvPitch = useMotionValue(0)
  const mvBlur = useMotionValue(0)
  const mvOpacity = useMotionValue(0)

  const spring = { stiffness: 130, damping: 20, mass: 0.8 }
  const sx = useSpring(mvX, spring)
  const sy = useSpring(mvY, spring)
  const sScale = useSpring(mvScale, spring)
  const sRoll = useSpring(mvRoll, { stiffness: 110, damping: 19 })
  const sYaw = useSpring(mvYaw, { stiffness: 140, damping: 18 })
  const sPitch = useSpring(mvPitch, { stiffness: 140, damping: 18 })
  const sBlur = useSpring(mvBlur, { stiffness: 220, damping: 30 })

  useLayoutEffect(() => {
    const mqDesktop = window.matchMedia('(min-width: 1024px)')
    const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setActive(mqDesktop.matches && !mqReduced.matches)
    sync()
    mqDesktop.addEventListener('change', sync)
    mqReduced.addEventListener('change', sync)
    return () => {
      mqDesktop.removeEventListener('change', sync)
      mqReduced.removeEventListener('change', sync)
    }
  }, [])

  useLayoutEffect(() => {
    const html = document.documentElement
    if (!active) {
      html.classList.remove('fly-cup-on', 'fly-cup-docked')
      return
    }
    html.classList.add('fly-cup-on')

    const measure = () => {
      const vh = window.innerHeight
      const found: Stop[] = []
      STOPS.forEach((name, i) => {
        const el = document.querySelector(`[data-cup-anchor="${name}"]`)
        if (!el) return
        if (!observedRef.current.has(el)) {
          observedRef.current.add(el)
          ro.observe(el)
        }
        const r = el.getBoundingClientRect()
        if (r.width < 4 || r.height < 4) return
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
      let blur = 0

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
          blur = leg.blur * arc
        }
      }

      const docked = S.length === STOPS.length && scrollY >= S[last].holdStart - 1
      return { x, y, h, roll, yaw, pitch, blur, docked }
    }

    const apply = (jump = false) => {
      const out = compute(window.scrollY)
      if (!out) return
      html.classList.toggle('fly-cup-docked', out.docked)
      mvX.set(out.x - BASE_W / 2)
      mvY.set(out.y - BASE_H / 2)
      mvScale.set(out.h / BASE_H)
      mvRoll.set(out.roll)
      mvYaw.set(out.yaw)
      mvPitch.set(out.pitch)
      mvBlur.set(out.docked ? 0 : out.blur)
      mvOpacity.set(out.docked ? 0 : 1)
      if (jump) {
        sx.jump(mvX.get())
        sy.jump(mvY.get())
        sScale.jump(mvScale.get())
        sRoll.jump(mvRoll.get())
        sYaw.jump(mvYaw.get())
        sPitch.jump(mvPitch.get())
        sBlur.jump(mvBlur.get())
      }
    }

    const remeasure = () => {
      measure()
      apply()
    }
    const ro = new ResizeObserver(remeasure)
    ro.observe(document.body)
    measure()
    apply(true)

    const onScroll = () => apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', remeasure)
    window.addEventListener('load', remeasure)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', remeasure)
      window.removeEventListener('load', remeasure)
      ro.disconnect()
      observedRef.current.clear()
      html.classList.remove('fly-cup-on', 'fly-cup-docked')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  if (!active) return null

  return (
    <motion.div
      aria-hidden="true"
      className="fixed left-0 top-0 z-40 pointer-events-none"
      style={{
        x: sx,
        y: sy,
        scale: sScale,
        rotate: sRoll,
        opacity: mvOpacity,
        width: BASE_W,
        height: BASE_H,
        willChange: 'transform',
      }}
    >
      {/* Perspective tumble — yaw/pitch make the cutout read as a 3D object */}
      <motion.div
        className="w-full h-full"
        style={{ rotateX: sPitch, rotateY: sYaw, transformPerspective: 1100 }}
      >
        {/* Idle life: slow bob + out-of-phase sway + lazy yaw drift */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full"
        >
          <motion.div
            animate={{ rotate: [0, 1.8, 0, -1.8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full h-full"
          >
            <motion.div
              animate={{ rotateY: [0, 7, 0, -7, 0] }}
              transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-full h-full"
              style={{ transformPerspective: 900 }}
            >
              <img
                src={CUP_SRC}
                alt=""
                className="w-full h-full select-none"
                style={{
                  filter:
                    'drop-shadow(0 10px 14px rgba(80,30,55,0.30)) drop-shadow(0 30px 52px rgba(112,45,80,0.22))',
                }}
                draggable={false}
              />
              {/* Speed blur — cross-fades in mid-flight, composited (opacity only) */}
              <motion.img
                src={CUP_SRC}
                alt=""
                className="absolute inset-0 w-full h-full select-none"
                style={{ opacity: sBlur, filter: 'blur(6px) saturate(1.05)', scale: 1.02 }}
                draggable={false}
              />
              {/* Glass sheen — light sweep clipped to the cup silhouette */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: `url(${CUP_SRC})`,
                  maskImage: `url(${CUP_SRC})`,
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                }}
              >
                <motion.div
                  className="absolute inset-y-0 w-[45%]"
                  animate={{ x: ['-130%', '330%'] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.6 }}
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.34) 45%, rgba(255,255,255,0.12) 58%, transparent 100%)',
                    mixBlendMode: 'screen',
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
