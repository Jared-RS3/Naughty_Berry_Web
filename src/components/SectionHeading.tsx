import { motion } from 'framer-motion'
import { STAGGER, POP, RISE } from '../motionPresets'

/**
 * The one heading every section below the hero uses, so the lower half of the
 * site carries the same weight as CUPS (menu) and REVIEWS (testimonials):
 * a giant berry word, the sentence sitting over its bottom third, then the
 * lead. Keep new sections on this — the giant word is what makes a section
 * read as a chapter rather than a block of copy.
 */

const ARCHIVO = "'Archivo Black', system-ui, sans-serif"

export default function SectionHeading({
  eyebrow,
  word,
  title,
  lead,
  className = '',
}: {
  eyebrow: string
  /** The giant backdrop word — keep it to one or two short words. */
  word: string
  /** The sentence over it, as [berry line, cocoa line]. */
  title: [string, string]
  lead?: string
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={STAGGER}
      className={`text-center ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <motion.div variants={POP} className="flex items-center justify-center gap-3">
        <img
          src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
          alt=""
          aria-hidden="true"
          className="w-6 h-6 object-contain opacity-85"
          draggable={false}
        />
        <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
        <span className="text-[12px] font-bold tracking-[0.24em] uppercase text-[#E8176D]">
          {eyebrow}
        </span>
        <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
      </motion.div>

      <motion.div variants={RISE} className="mt-7 flex flex-col items-center">
        <span
          aria-hidden="true"
          className="select-none pointer-events-none whitespace-nowrap"
          style={{
            fontFamily: ARCHIVO,
            fontSize: 'min(13.5cqw, 176px)',
            lineHeight: 0.86,
            letterSpacing: '-0.02em',
            color: '#E8176D',
          }}
        >
          {word}
        </span>
        <h2
          className="relative z-10 uppercase leading-[1.02] text-[clamp(1.35rem,3.5cqw,2.55rem)] text-[#3B2116]"
          style={{
            fontFamily: ARCHIVO,
            // Just enough tuck to bind the sentence to the word above it —
            // any more and the two sets of caps start reading as one blur.
            marginTop: 'clamp(-20px, -1.5cqw, -4px)',
          }}
        >
          <span className="block">{title[0]}</span>
          <span className="block">{title[1]}</span>
        </h2>
      </motion.div>

      {lead && (
        <motion.p variants={RISE} className="mt-6 text-[#7A3B5E] text-lg max-w-xl mx-auto">
          {lead}
        </motion.p>
      )}
    </motion.div>
  )
}
