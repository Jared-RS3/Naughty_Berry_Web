import type { Variants } from 'framer-motion'

/**
 * Shared entrance presets so every section header animates with the same
 * playful, springy character. Use STAGGER on the header wrapper and give each
 * child (eyebrow / title / paragraph) a variant below.
 *
 *   <motion.div initial="hidden" whileInView="show"
 *     viewport={{ once: true, margin: '-80px' }} variants={STAGGER}>
 *     <motion.div variants={POP}>…eyebrow…</motion.div>
 *     <motion.h2  variants={RISE}>…title…</motion.h2>
 *     <motion.p   variants={RISE}>…lead…</motion.p>
 *   </motion.div>
 */
export const STAGGER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
}

/** Eyebrow — a little pop as it lands (overshoot from a low damping). */
export const POP: Variants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 220, damping: 14 } },
}

/** Titles & lead text — rise up and settle on a soft spring. */
export const RISE: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } },
}
