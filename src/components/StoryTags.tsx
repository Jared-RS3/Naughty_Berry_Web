import { motion } from 'framer-motion'
import { POP } from '../motionPresets'

/**
 * The little sticker badges on Our Story. Presentational only — the parent
 * supplies the variant context (see STAGGER in motionPresets), so the home
 * page can hold them back until the headline has finished filling while the
 * /story page pops them on entry.
 */

type Tone = 'berry' | 'cream' | 'cocoa'

const TONES: Record<Tone, { background: string; color: string; shadow: string }> = {
  berry: { background: '#E8176D', color: '#FFFFFF', shadow: 'rgba(192,16,87,0.26)' },
  cream: { background: '#FFF9ED', color: '#E8176D', shadow: 'rgba(180,40,95,0.14)' },
  cocoa: { background: '#3B2116', color: '#FFE9D6', shadow: 'rgba(59,33,22,0.24)' },
}

const TAGS: { label: string; tone: Tone; tilt: number }[] = [
  // { label: 'Locally Made', tone: 'berry', tilt: -3 },
  // { label: 'Made With Love', tone: 'cream', tilt: 2.2 },
  // { label: 'Community Based', tone: 'cocoa', tilt: -1.6 },
  // { label: 'Cape Town First', tone: 'cream', tilt: 3 },
]

/** Tiny dipped berry, inherits the pill's text colour. */
function Berry() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M12 5.4c3.3 0 6 2.2 6 5.3 0 3.9-3.6 8.4-6 8.4s-6-4.5-6-8.4c0-3.1 2.7-5.3 6-5.3z" />
      <path d="M12 6.5C11 4.9 9.4 4.1 7.4 4c.5 1.5 1.5 2.5 3 3-1.4.2-2.6 0-3.6-.6.6 1.4 1.9 2.1 3.6 2.1h3.2c1.7 0 3-.7 3.6-2.1-1 .6-2.2.8-3.6.6 1.5-.5 2.5-1.5 3-3-2 .1-3.6.9-4.6 2.5z" />
    </svg>
  )
}

export default function StoryTags({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {TAGS.map(({ label, tone, tilt }) => {
        const t = TONES[tone]
        return (
          <motion.span
            key={label}
            variants={POP}
            whileHover={{ rotate: 0, y: -4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold tracking-[0.06em] uppercase whitespace-nowrap"
            style={{
              background: t.background,
              color: t.color,
              rotate: tilt,
              boxShadow: `0 10px 22px ${t.shadow}`,
            }}
          >
            <Berry />
            {label}
          </motion.span>
        )
      })}
    </div>
  )
}
