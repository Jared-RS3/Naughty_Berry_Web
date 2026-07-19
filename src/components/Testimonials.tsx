import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: 'The strawberry cups look so yummy. Definitely a balanced diet.',
    name: 'Quaanitah',
    handle: '@quaanitah',
  },
  {
    quote: 'The strawberries are always so so fresh and juicy and chocolate is just too good 😊',
    name: 'Milkshaikk',
    handle: '@milkshaikk_',
  },
  {
    quote: 'My favourite sweet treat ever!!',
    name: 'Milkshaikk',
    handle: '@milkshaikk_',
  },
  {
    quote: 'NEVER DISAPPOINTS! Always so fresh and tasty! ❤️',
    name: 'Naailah H.',
    handle: '@naailah_h',
  },
  {
    quote: "Also, AMAZING service. Just chef's kiss 🤌",
    name: 'Aadielah Solomon',
    handle: '@aadielahsolomon',
  },
  {
    quote: 'super friendly staff! strawberries & brownies are ALWAYS covered in a generous amount of chocolate 🥰',
    name: 'Aadielah Solomon',
    handle: '@aadielahsolomon',
  },
  {
    quote: 'Most delicious strawberries I’ve ever tasted! 😋',
    name: 'Ammaarah B.',
    handle: '@ammaarah.b',
  },
  {
    quote: 'It was an absolute pleasure having you as part of our wedding. Thank you for your wonderful service and yummy treats! 😊',
    name: 'S Mia',
    handle: '',
  },
]

/** Scatter positions for the six desktop card slots, matching Reviews.png. */
const SLOTS: Array<CSSProperties> = [
  { left: '7.5%', top: '33%' },
  { left: '7.5%', top: '62%' },
  { left: '24.5%', top: '50%' },
  { right: '24.5%', top: '52%' },
  { right: '6.5%', top: '39%' },
  { right: '7%', top: '66%' },
]

/** Scroll-reveal order for the slots — cards pop in alternating around the cup. */
const REVEAL_ORDER = [0, 3, 1, 4, 2, 5]

const PINK = '#D3196A'
const CREAM = '#FFF9ED'

function Stars() {
  return (
    <div className="flex gap-[3px] mt-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="w-[9px] h-[9px]" fill={PINK} aria-hidden="true">
          <path d="M12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7-6.2-3.7L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ t }: { t: (typeof TESTIMONIALS)[number] }) {
  return (
    <div
      className="rounded-[22px] p-5 text-left"
      style={{ background: CREAM, boxShadow: '0 18px 40px rgba(180, 40, 95, 0.12)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #E8143C, #C01057)' }}
          aria-hidden="true"
        >
          {t.name[0]}
        </div>
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.08em] uppercase" style={{ color: PINK }}>
            {t.name}
          </p>
          <Stars />
        </div>
      </div>
      <p className="text-[13px] leading-relaxed text-[#6E5A62]">{t.quote}</p>
    </div>
  )
}

/** One scattered card slot, revealed by scroll progress through the pinned run. */
function RevealSlot({
  progress,
  order,
  active,
  children,
}: {
  progress: MotionValue<number>
  order: number
  active: boolean
  children: ReactNode
}) {
  const t0 = 0.05 + order * 0.155
  const t1 = t0 + 0.12
  const opacity = useTransform(progress, [t0, t1], [0, 1])
  const y = useTransform(progress, [t0, t1], [90, 0])
  const scale = useTransform(progress, [t0, t1], [0.8, 1])
  const rotate = useTransform(progress, [t0, t1], [order % 2 ? 6 : -6, 0])
  if (!active) return <>{children}</>
  return <motion.div style={{ opacity, y, scale, rotate }}>{children}</motion.div>
}

/**
 * Reviews — pinned scroll story. A 260vh run pins a full-screen stage: the
 * giant REVIEWS headline builds as the stage rises, the shared flying cup
 * lands centre when it pins, then the cream review cards pop in one by one
 * around the cup as you keep scrolling (Ocha-style). Arrows still cycle
 * which six reviews fill the slots. Below lg it stays a simple card grid.
 */
export default function Testimonials() {
  const prefersReducedMotion = useReducedMotion()
  const [offset, setOffset] = useState(0)
  const runRef = useRef<HTMLDivElement>(null)

  // Reduced motion: no pin, no scroll choreography — everything just shows.
  const pinned = !prefersReducedMotion

  // Scroll progress measured straight off the run's rect (framer's useScroll
  // caches target offsets, which go stale as lazy sections mount above):
  // approach 0→1 while the stage rises into view, progress 0→1 while pinned.
  const approach = useMotionValue(0)
  const progress = useMotionValue(0)
  useEffect(() => {
    const el = runRef.current
    if (!el || !pinned) return
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
    const update = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      approach.set(clamp01((vh - r.top) / vh))
      progress.set(clamp01(-r.top / Math.max(1, r.height - vh)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pinned, approach, progress])

  const headOpacity = useTransform(approach, [0.5, 0.92], [0, 1])
  const headScale = useTransform(approach, [0.5, 1], [0.9, 1])
  const headY = useTransform(approach, [0.5, 1], [70, 0])
  const eyebrowOpacity = useTransform(approach, [0.6, 0.95], [0, 1])

  const shift = (dir: 1 | -1) =>
    setOffset((o) => (o + dir + TESTIMONIALS.length) % TESTIMONIALS.length)

  const visible = Array.from(
    { length: SLOTS.length },
    (_, i) => TESTIMONIALS[(offset + i) % TESTIMONIALS.length]
  )

  return (
    <section
      className="relative"
      style={{ background: '#F6E3EB' }}
      aria-label="Reviews — what Cape Town says"
    >
      {/* ── Desktop: tall run with a pinned full-screen stage ── */}
      <div
        ref={runRef}
        className="relative hidden lg:block"
        style={{ height: pinned ? '260vh' : undefined }}
      >
        <div
          data-cup-sticky-stage
          className={pinned ? 'sticky top-0 h-screen overflow-hidden' : 'relative py-20 overflow-hidden'}
        >
          <div
            className="relative w-full h-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10"
            style={{ containerType: 'inline-size' }}
          >
            {/* Eyebrow */}
            <motion.div
              style={pinned ? { opacity: eyebrowOpacity } : undefined}
              className="absolute inset-x-0 top-[11%] z-30 flex flex-col items-center gap-3"
            >
              <div className="flex items-center justify-center gap-2">
                <img
                  src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-5 object-contain"
                  draggable={false}
                />
                <span
                  className="text-[13px] font-extrabold tracking-[0.3em] uppercase"
                  style={{ color: PINK }}
                >
                  Reviews
                </span>
              </div>
              <span className="w-16 h-px bg-[#D3196A]/25" aria-hidden="true" />
            </motion.div>

            <h2 className="sr-only">Reviews — what Cape Town says about Naughty Berry</h2>

            {/* Stage — fills the pinned screen */}
            <div className="absolute inset-x-4 sm:inset-x-6 lg:inset-x-10 top-[13%] bottom-[6%]">
              {/* Giant headline behind everything */}
              <motion.div
                style={{
                  ...(pinned ? { opacity: headOpacity, scale: headScale, y: headY } : {}),
                  fontFamily: "'Archivo Black', system-ui, sans-serif",
                  fontSize: 'min(16.5cqw, 250px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: '#EC7EA6',
                }}
                aria-hidden="true"
                className="absolute inset-x-0 top-[2%] z-0 text-center select-none pointer-events-none"
              >
                REVIEWS
              </motion.div>

              {/* Cup cut-out, seated over the headline.
                  data-cup-anchor: ScrollCup's reviews stop; cup-static hides the
                  static cup while the flying cup renders in its place. */}
              <div
                data-cup-anchor="reviews"
                className="cup-static absolute left-1/2 top-[54%] z-10 pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)', width: 'clamp(200px, 21cqw, 320px)' }}
              >
                <div
                  aria-hidden="true"
                  className="absolute left-1/2 -translate-x-1/2"
                  style={{
                    bottom: '-3%',
                    width: '72%',
                    height: '6%',
                    borderRadius: '50%',
                    filter: 'blur(7px)',
                    background:
                      'radial-gradient(ellipse at center, rgba(90,32,58,0.32) 0%, rgba(90,32,58,0.12) 45%, transparent 72%)',
                  }}
                />
                <img
                  src="/naughty-hero-cup.png"
                  alt=""
                  className="w-full h-auto select-none"
                  style={{ filter: 'drop-shadow(0 12px 18px rgba(80,30,55,0.28))' }}
                  draggable={false}
                />
              </div>

              {/* Up/down arrows with connecting rule */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => shift(-1)}
                  aria-label="Previous reviews"
                  className="w-11 h-11 rounded-full border flex items-center justify-center transition-colors hover:bg-white/50"
                  style={{ borderColor: 'rgba(211,25,106,0.45)', color: PINK }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
                <span className="w-px h-52 bg-[#D3196A]/25" aria-hidden="true" />
                <button
                  type="button"
                  onClick={() => shift(1)}
                  aria-label="Next reviews"
                  className="w-11 h-11 rounded-full border flex items-center justify-center transition-colors hover:bg-white/50"
                  style={{ borderColor: 'rgba(211,25,106,0.45)', color: PINK }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Scattered review cards — revealed one by one by scroll */}
              {SLOTS.map((pos, i) => (
                <div
                  key={i}
                  className="absolute z-20"
                  style={{ ...pos, width: 'clamp(190px, 15cqw, 235px)' }}
                >
                  <RevealSlot progress={progress} order={REVEAL_ORDER[i]} active={pinned}>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`${offset}-${i}`}
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <ReviewCard t={visible[i]} />
                      </motion.div>
                    </AnimatePresence>
                  </RevealSlot>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet: compact headline + cup, then card grid ── */}
      <div className="lg:hidden py-16">
        <div
          className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-6"
          style={{ containerType: 'inline-size' }}
        >
          <div className="flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                alt=""
                aria-hidden="true"
                className="w-5 h-5 object-contain"
                draggable={false}
              />
              <span
                className="text-[13px] font-extrabold tracking-[0.3em] uppercase"
                style={{ color: PINK }}
              >
                Reviews
              </span>
            </div>
            <span className="w-16 h-px bg-[#D3196A]/25" aria-hidden="true" />
          </div>

          <div className="relative mt-2 mb-10">
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-3 z-0 text-center select-none pointer-events-none"
              style={{
                fontFamily: "'Archivo Black', system-ui, sans-serif",
                fontSize: 'min(17cqw, 110px)',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#EC7EA6',
              }}
            >
              REVIEWS
            </div>
            <img
              src="/naughty-hero-cup.png"
              alt=""
              className="relative z-10 mx-auto w-[46%] max-w-[220px] h-auto select-none"
              style={{ filter: 'drop-shadow(0 12px 18px rgba(80,30,55,0.28))' }}
              draggable={false}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * i }}
              >
                <ReviewCard t={t} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
