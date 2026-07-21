import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Instagram, ChevronLeft, ChevronRight } from 'lucide-react'
import SectionHeading from './SectionHeading'
import { usePopupSchedule } from '../hooks/usePopupSchedule'

const PER_PAGE = 3
const EASE_OUT = [0.22, 1, 0.36, 1] as const

export default function FindUs() {
  const { schedule, loading, error } = usePopupSchedule()
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)

  const sorted = [...schedule].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    if (isNaN(da) || isNaN(db)) return 0
    return db - da
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const pageSlots = sorted.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
  const canLeft = page > 0
  const canRight = page < totalPages - 1

  const go = (newPage: number) => {
    setDir(newPage > page ? 1 : -1)
    setPage(newPage)
  }

  const arrowClass = (enabled: boolean) =>
    `w-11 h-11 rounded-full flex items-center justify-center transition-colors ${
      enabled
        ? 'nb-pill text-[#E8176D] hover:bg-[#E8176D] hover:text-white cursor-pointer'
        : 'text-[#E8176D]/25 cursor-default'
    }`

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
          lead="We roam Cape Town every weekend. Locations are updated every Thursday on Instagram."
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
        {!loading && sorted.length === 0 ? (
          <div className="nb-card p-10 text-center mb-16">
            <p className="text-[#3B2116] font-semibold">
              Next weekend’s stops are still being locked in.
            </p>
            <p className="text-[#7A3B5E] text-sm mt-2">
              Locations drop on Instagram every Thursday — follow along below.
            </p>
          </div>
        ) : (
        <div className="relative mb-16">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => canLeft && go(page - 1)}
              aria-label="Previous week"
              disabled={!canLeft}
              className={arrowClass(canLeft)}
            >
              <ChevronLeft size={18} />
            </button>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={`Page ${i + 1}`}
                    aria-current={i === page}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      i === page ? 'w-6 bg-[#E8176D]' : 'w-2 bg-[#E8176D]/25 hover:bg-[#E8176D]/50'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => canRight && go(page + 1)}
              aria-label="Next week"
              disabled={!canRight}
              className={arrowClass(canRight)}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={page}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {loading
                ? Array.from({ length: PER_PAGE }).map((_, i) => (
                    <div key={i} className="nb-card h-56 animate-pulse" />
                  ))
                : pageSlots.map((slot, i) => (
                    <motion.div
                      key={`${slot.day}-${slot.date}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.08, ease: EASE_OUT }}
                      whileHover={{ y: -6 }}
                      className="nb-card p-7 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3
                            className="uppercase text-2xl leading-none text-[#3B2116]"
                            style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
                          >
                            {slot.day}
                          </h3>
                          <p className="text-[#7A3B5E]/60 text-xs mt-2">{slot.date}</p>
                        </div>
                        {slot.isThisWeek && (
                          <span className="shrink-0 px-3 py-1 rounded-full bg-[#E8176D] text-white text-[10px] font-bold tracking-[0.14em] uppercase">
                            This week
                          </span>
                        )}
                      </div>

                      {slot.eventName && (
                        <p className="mt-3 text-[#E8176D] text-sm font-semibold">{slot.eventName}</p>
                      )}

                      <div className="mt-5 space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin size={15} className="text-[#E8176D] mt-0.5 shrink-0" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-[#3B2116] text-sm font-semibold">{slot.location}</p>
                            <p className="text-[#7A3B5E]/70 text-xs mt-0.5">{slot.area}</p>
                          </div>
                        </div>
                        {(slot.startTime || slot.endTime) && (
                          <div className="flex items-center gap-3">
                            <Clock size={15} className="text-[#E8176D] shrink-0" aria-hidden="true" />
                            <p className="text-[#7A3B5E] text-sm">
                              {slot.startTime}
                              {slot.endTime ? ` – ${slot.endTime}` : ''}
                            </p>
                          </div>
                        )}
                        {slot.notes && (
                          <p className="text-[#7A3B5E]/60 text-xs pl-[27px]">{slot.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </AnimatePresence>
        </div>
        )}

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
              Every Monday a new location drops, with reels, moments and behind the scenes.
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
