import { motion } from 'framer-motion'
import WaveDivider from './WaveDivider'

const BERRY = '#C4294B'
const COCOA = '#52250B'

// Each line is an array of segments so a single line can mix pink + brown,
// matching the reference design's exact line breaks.
const HEADLINE: { text: string; color: string }[][] = [
  [{ text: 'We make strawberries,', color: BERRY }],
  [{ text: 'chocolate,', color: COCOA }, { text: ' joy, and', color: BERRY }],
  [{ text: 'little moments', color: BERRY }],
  [{ text: 'worth sharing.', color: BERRY }],
  [{ text: 'Cape Town’s first', color: BERRY }],
  [{ text: 'strawberries &', color: BERRY }],
  [{ text: 'chocolate on tap.', color: COCOA }],
]

export default function About() {
  return (
    <>
      {/* ─── About ───────────────────── */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden bg-[#F6E3EB]">
        <div className="max-w-[86rem] mx-auto px-6 lg:px-10 relative z-10">
          {/* Eyebrow */}
          <div className="flex flex-col items-center mb-14">
            <div className="flex items-center gap-3">
              <img
                src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                alt=""
                aria-hidden="true"
                className="w-6 h-6 object-contain opacity-85"
                draggable={false}
              />
              <span className="text-[12px] font-bold tracking-[0.24em] uppercase text-[#C4294B]">
                Our Story
              </span>
            </div>
            <span className="mt-3 w-14 h-[1px] bg-[#C4294B]/40" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.62fr_1fr] gap-14 lg:gap-12 items-center">
            {/* Left: Big statement */}
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="min-w-0 uppercase leading-[0.98] text-[clamp(1.75rem,5.2vw,5rem)] text-center lg:text-left"
              style={{ fontFamily: "'Anton', 'Archivo Black', system-ui, sans-serif", letterSpacing: '0.005em' }}
            >
              {HEADLINE.map((line, i) => (
                <span key={i} className="block whitespace-nowrap">
                  {line.map((seg, j) => (
                    <span key={j} style={{ color: seg.color }}>
                      {seg.text}
                    </span>
                  ))}
                </span>
              ))}
            </motion.h2>

            {/* Right: landing zone for the flying cup (ScrollCup pins here) */}
            <div className="hidden lg:flex items-center justify-center min-w-0">
              <div
                data-cup-anchor="story"
                aria-hidden="true"
                className="w-full max-w-[360px]"
                style={{ aspectRatio: '548 / 712' }}
              />
            </div>

          </div>
        </div>
        <WaveDivider variant="about" fill="#F6E3EB" height={60} />
      </section>
    </>
  )
}
