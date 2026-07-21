import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { STAGGER } from '../motionPresets'
import StoryTags from './StoryTags'

/**
 * Our Story — a pinned scroll story. A tall run pins one full-screen stage:
 * the statement sits left, the flying cup lands and holds in the right-hand
 * column, and the headline "loads" word by word as you scroll — each word
 * lifting from a faint ghost into full colour. The pin holds the page (and
 * the cup) in place for the whole fill; once the last word lands the sticker
 * tags pop in, and the run ends so normal scrolling resumes.
 *
 * The stage is tagged data-cup-sticky-stage so ScrollCup treats the anchor
 * inside it as viewport-fixed for the run's entire pinned range.
 *
 * Below lg (and under reduced motion) there is no pin: the same copy just
 * reveals on entry.
 */

const BERRY = '#E8176D'
const COCOA = '#3B2116'
const ARCHIVO = "'Archivo Black', system-ui, sans-serif"

type Seg = { text: string; color: string }

/** Each line is an array of segments so one line can mix berry + cocoa. */
const STATEMENT: Seg[][] = [
  [{ text: 'We make strawberries,', color: BERRY }],
  [{ text: 'chocolate,', color: COCOA }, { text: 'joy, and', color: BERRY }],
  [{ text: 'little moments', color: BERRY }],
  [{ text: 'worth sharing.', color: BERRY }],
]

const TAGLINE: Seg[][] = [
  [{ text: 'Cape Town’s first', color: BERRY }],
  [{ text: 'strawberries &', color: BERRY }],
  [{ text: 'chocolate on tap.', color: COCOA }],
]

/** Fraction of the pinned run spent filling the text — the rest is the beat
 *  where the tags land and the unlock is signalled. */
const FILL_SPAN = 0.66
const FILL_START = 0.04
/** Progress at which the text is full and the tags pop. */
const FILLED_AT = FILL_START + FILL_SPAN + 0.03

const TOTAL_WORDS = [...STATEMENT, ...TAGLINE]
  .flat()
  .reduce((n, seg) => n + seg.text.split(' ').length, 0)

const STATEMENT_WORDS = STATEMENT.flat().reduce((n, s) => n + s.text.split(' ').length, 0)

const FILL_EASE = cubicBezier(0.22, 1, 0.36, 1)

/** One word of the headline, filling in as scroll progress passes it. */
function FillWord({
  progress,
  index,
  color,
  active,
  children,
}: {
  progress: MotionValue<number>
  index: number
  color: string
  active: boolean
  children: ReactNode
}) {
  const step = FILL_SPAN / TOTAL_WORDS
  const t0 = FILL_START + index * step
  const t1 = t0 + step * 2.6
  const opacity = useTransform(progress, [t0, t1], [0.12, 1], { ease: FILL_EASE })
  const y = useTransform(progress, [t0, t1], [14, 0], { ease: FILL_EASE })

  if (!active) return <span style={{ color }}>{children}</span>
  return (
    <motion.span className="inline-block" style={{ color, opacity, y }}>
      {children}
    </motion.span>
  )
}

/** Renders a block of lines as filling words, continuing a running index. */
function FillBlock({
  lines,
  startIndex,
  progress,
  active,
  className,
}: {
  lines: Seg[][]
  startIndex: number
  progress: MotionValue<number>
  active: boolean
  className?: string
}) {
  let i = startIndex
  return (
    <span className={className}>
      {lines.map((line, li) => (
        <span key={li} className="block whitespace-nowrap">
          {line.flatMap((seg) =>
            seg.text.split(' ').map((word) => (
              <FillWord
                key={`${li}-${i}`}
                progress={progress}
                index={i++}
                color={seg.color}
                active={active}
              >
                {word}
                <span className="inline-block w-[0.26em]" />
              </FillWord>
            ))
          )}
        </span>
      ))}
    </span>
  )
}

function Eyebrow() {
  return (
    <div className="flex items-center justify-center lg:justify-start gap-3">
      <img
        src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
        alt=""
        aria-hidden="true"
        className="w-6 h-6 object-contain opacity-85"
        draggable={false}
      />
      <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
      <span className="text-[12px] font-bold tracking-[0.24em] uppercase text-[#E8176D]">
        Our Story
      </span>
      <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
    </div>
  )
}

function ReadFullStory({ className = '' }: { className?: string }) {
  return (
    <a
      href="/story"
      className={`group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#E8176D] text-white text-[12px] font-bold tracking-[0.18em] uppercase hover:bg-[#C01057] transition-colors ${className}`}
    >
      Read Full Story
      <ArrowRight
        size={15}
        className="transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  )
}

export default function About() {
  const prefersReducedMotion = useReducedMotion()
  const pinned = !prefersReducedMotion
  const runRef = useRef<HTMLDivElement>(null)
  const [filled, setFilled] = useState(false)

  // Progress measured straight off the run's rect: 0 as the stage pins,
  // 1 as it releases. (framer's useScroll caches target offsets, which go
  // stale as lazy sections mount above this one.)
  const progress = useMotionValue(0)
  useEffect(() => {
    const el = runRef.current
    if (!el || !pinned) return
    const read = () => {
      const r = el.getBoundingClientRect()
      const span = Math.max(1, r.height - window.innerHeight)
      const p = Math.min(1, Math.max(0, -r.top / span))
      progress.set(p)
      setFilled(p >= FILLED_AT)
    }
    // getBoundingClientRect forces layout, so it runs once per frame at most
    // rather than once per scroll event.
    let frame = 0
    const update = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        read()
      })
    }
    read()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pinned, progress])

  // Hairline meter under the eyebrow — reads as the statement "loading".
  const meterWidth = useTransform(
    progress,
    [FILL_START, FILL_START + FILL_SPAN],
    ['0%', '100%']
  )
  // The "keep scrolling" cue below is commented out. To bring it back, restore
  // its opacity here: useTransform(progress, [0.86, 0.96], [0, 1]).

  return (
    <section id="about" className="relative bg-[#FFDCEA]">
      {/* ── Desktop: tall run with a pinned full-screen stage ── */}
      <div
        ref={runRef}
        className="relative hidden lg:block"
        style={{ height: pinned ? '230vh' : undefined }}
      >
        <div
          data-cup-sticky-stage
          className={pinned ? 'sticky top-0 h-screen overflow-hidden' : 'relative py-28'}
        >
          <div className="h-full max-w-[86rem] mx-auto px-6 lg:px-10 flex flex-col justify-center">
            <div className="grid grid-cols-[1.32fr_0.68fr] gap-12 items-center">
              {/* Left: the statement, filling word by word */}
              <div className="min-w-0">
                <Eyebrow />

                {/* Fill meter */}
                <span
                  className="relative mt-5 mb-8 block h-[2px] w-40 overflow-hidden rounded-full bg-[#E8176D]/15"
                  aria-hidden="true"
                >
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-[#E8176D]"
                    style={pinned ? { width: meterWidth } : { width: '100%' }}
                  />
                </span>

                <h2
                  className="min-w-0 uppercase leading-[1.03] text-[clamp(1.7rem,3.9vw,3.6rem)]"
                  style={{ fontFamily: ARCHIVO }}
                >
                  <FillBlock
                    lines={STATEMENT}
                    startIndex={0}
                    progress={progress}
                    active={pinned}
                  />
                  <FillBlock
                    lines={TAGLINE}
                    startIndex={STATEMENT_WORDS}
                    progress={progress}
                    active={pinned}
                    className="mt-7 block text-[0.9em] leading-[1.12]"
                  />
                </h2>

                {/* Sticker tags — pop in the moment the text is full */}
                <motion.div
                  initial="hidden"
                  animate={pinned ? (filled ? 'show' : 'hidden') : 'show'}
                  variants={STAGGER}
                >
                  <StoryTags className="mt-9" />
                </motion.div>

                <div className="mt-9 flex items-center gap-6">
                  <ReadFullStory />

                  {/* Scroll-unlock cue */}
                  {/* <motion.span
                    className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8176D]/70"
                    style={pinned ? { opacity: cueOpacity } : { opacity: 0 }}
                    aria-hidden="true"
                  >
                    Keep scrolling
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </motion.svg>
                  </motion.span> */}
                </div>
              </div>

              {/* Right: landing zone for the flying cup (ScrollCup pins here) */}
              <div className="flex items-center justify-center min-w-0">
                <div
                  data-cup-anchor="story"
                  aria-hidden="true"
                  className="w-full max-w-[340px]"
                  style={{ aspectRatio: '548 / 712' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile / tablet: no pin, cup and copy simply reveal ── */}
      <div className="lg:hidden py-20">
        <div className="max-w-2xl mx-auto px-6">
          <Eyebrow />
          <motion.h2
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ type: 'spring', stiffness: 90, damping: 16 }}
            className="mt-8 uppercase leading-[1.05] text-[clamp(1.6rem,7.4vw,2.6rem)] text-center"
            style={{ fontFamily: ARCHIVO }}
          >
            {[...STATEMENT, ...TAGLINE].map((line, i) => (
              <span
                key={i}
                className={`block ${i === STATEMENT.length ? 'mt-6 text-[0.72em]' : ''}`}
              >
                {line.map((seg, j) => (
                  <span key={j} style={{ color: seg.color }}>
                    {seg.text}{' '}
                  </span>
                ))}
              </span>
            ))}
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={STAGGER}
          >
            <StoryTags className="mt-9 justify-center" />
          </motion.div>

          <div className="mt-9 flex justify-center">
            <ReadFullStory />
          </div>

          <motion.img
            src="/naughty-hero-cup.png"
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="cup-img mt-12 mx-auto w-[54%] max-w-[240px] h-auto select-none"
            style={{ '--cup-shadow': 'drop-shadow(0 14px 22px rgba(80,30,55,0.26))' } as React.CSSProperties}
            draggable={false}
          />
        </div>
      </div>
    </section>
  )
}
