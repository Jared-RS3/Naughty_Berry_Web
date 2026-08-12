import { motion } from 'framer-motion'
import { Instagram } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { usePopupSchedule } from '../hooks/usePopupSchedule'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function FindUs() {
  // The schedule carousel that used to live here is gone; the hook stays
  // because the section still reports an Airtable outage, and because it shares
  // one cached fetch with the hero pill and the footer map card.
  const { error } = usePopupSchedule()

  return (
    <section
      id="findus"
      className="py-24 lg:py-32 relative overflow-hidden bg-[#FFDCEA] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Find Us"
          word="FIND US"
          title={['','']}
          // title={['This weekend’s', 'pop-up schedule.']}
          // lead="We roam Cape Town every weekend. Locations are updated every Thursday on Instagram."
          className="mb-14"
        />

        {error && (
          <div className="text-center mb-12 space-y-1">
            <p className="text-[#E8176D] text-sm font-semibold">
              Could not load the schedule from Airtable.
            </p>
            <p className="text-[#7A3B5E]/60 text-xs font-mono">{error}</p>
          </div>
        )}

        {/* Schedule carousel — replaced by a plain notice when there is
            nothing to page through, so the section never sits on empty space. */}
       
        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="nb-card p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div>
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#E8176D] mb-3">
              Never miss us
            </p>
            <h3
              className="uppercase leading-[1.05] text-[clamp(1.5rem,3.2vw,2.4rem)]"
              style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
            >
              <span className="text-[#3B2116]">Follow </span>
              <span className="text-[#E8176D]">@naughtyberrycpt</span>
            </h3>
            <p className="mt-3 text-[#7A3B5E]">
              Every week a new location drops, with reels, moments and behind the scenes.
            </p>
          </div>
          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E8176D] text-white text-[12px] font-bold tracking-[0.18em] uppercase hover:bg-[#C01057] transition-colors"
            aria-label="Follow Naughty Berry on Instagram"
          >
            <Instagram size={16} />
            Follow on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  )
}
