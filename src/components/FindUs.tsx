import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Instagram, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import WaveDivider from './WaveDivider'
import { usePopupSchedule } from '../hooks/usePopupSchedule'

const PER_PAGE = 3

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

  return (
    <section id="findus" className="py-24 lg:py-32 relative overflow-hidden bg-[#FDE8EF]">
      {/* Background stripe */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background: 'repeating-linear-gradient(-45deg, #E8143C, #E8176D 1px, transparent 1px, transparent 60px)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="w-5 h-5 object-contain opacity-85"
              draggable={false}
            />
            <span className="w-8 h-[1px] bg-[#E8176D]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
              Find Us
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-3 leading-tight text-center md:text-left">
                This Weekend's <br />
                <span className="text-shimmer">Pop-up Schedule.</span>
              </h2>
              <p className="text-[#2D1225]/50 text-lg max-w-lg">
                We roam Cape Town every weekend. Locations are updated every Thursday on Instagram.
              </p>
            </div>
            <a
              href="https://www.instagram.com/naughtyberrycpt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-full border border-[#E8176D]/40 text-[#E8176D] text-sm font-medium hover:bg-[#E8176D]/10 transition-all self-start shrink-0"
              aria-label="Follow Naughty Berry on Instagram for pop-up locations"
            >
              <Instagram size={14} />
              Follow for Locations
            </a>
          </div>
        </motion.div>

        {/* Schedule Cards */}
        {error && (
          <div className="text-center mb-14 space-y-1">
            <p className="text-[#E8176D]/80 text-sm font-medium">Could not load schedule from Airtable.</p>
            <p className="text-[#2D1225]/40 text-xs font-mono">{error}</p>
            <p className="text-[#2D1225]/40 text-xs">
              Set <span className="font-mono">VITE_AIRTABLE_TOKEN</span> in Netlify environment variables and redeploy.
            </p>
          </div>
        )}
        {/* Carousel */}
        <div className="relative mb-14">
          {/* Arrow row */}
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => canLeft && go(page - 1)}
              aria-label="Previous"
              className={`w-10 h-10 rounded-full bg-white border shadow-md flex items-center justify-center transition-all duration-200 ${
                canLeft
                  ? 'border-[#F9BDD4] text-[#E8176D] hover:border-[#E8176D]/50 hover:shadow-[0_0_14px_rgba(232,23,109,0.18)] cursor-pointer'
                  : 'border-[#F9BDD4]/40 text-[#2D1225]/20 cursor-default'
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page dots */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    aria-label={`Page ${i + 1}`}
                    className={`rounded-full transition-all duration-200 ${
                      i === page
                        ? 'w-5 h-2 bg-[#E8176D]'
                        : 'w-2 h-2 bg-[#E8176D]/25 hover:bg-[#E8176D]/50'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={() => canRight && go(page + 1)}
              aria-label="Next"
              className={`w-10 h-10 rounded-full bg-white border shadow-md flex items-center justify-center transition-all duration-200 ${
                canRight
                  ? 'border-[#F9BDD4] text-[#E8176D] hover:border-[#E8176D]/50 hover:shadow-[0_0_14px_rgba(232,23,109,0.18)] cursor-pointer'
                  : 'border-[#F9BDD4]/40 text-[#2D1225]/20 cursor-default'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Cards */}
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
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
              {loading
                ? Array.from({ length: PER_PAGE }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#F9BDD4] rounded-2xl p-7 animate-pulse h-52"
                    />
                  ))
                : pageSlots.map((slot, i) => (
                    <motion.div
                      key={`${slot.day}-${slot.date}-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                      className={`bg-white border rounded-2xl p-7 relative overflow-hidden group transition-all duration-300 ${
                        slot.isThisWeek
                          ? 'border-[#E8176D]/40 ring-1 ring-[#E8176D]/20'
                          : 'border-[#F9BDD4] hover:border-[#E8176D]/30'
                      }`}
                    >
                      {/* Day accent */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#E8176D] to-transparent opacity-50 rounded-l-2xl" />

                      <div className="flex items-start justify-between mb-5">
                        <div>
                          <h3 className="font-display text-2xl font-bold text-[#2D1225]">{slot.day}</h3>
                          <p className="text-[#2D1225]/30 text-xs mt-0.5">{slot.date}</p>
                          {slot.eventName && (
                            <p className="text-[#E8176D]/70 text-xs font-medium mt-1">{slot.eventName}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin size={14} className="text-[#E8176D] mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[#2D1225]/80 text-sm font-medium">{slot.location}</p>
                            <p className="text-[#2D1225]/40 text-xs mt-0.5">{slot.area}</p>
                          </div>
                        </div>
                        {(slot.startTime || slot.endTime) && (
                          <div className="flex items-center gap-3">
                            <Clock size={14} className="text-[#E8176D] shrink-0" />
                            <p className="text-[#2D1225]/60 text-sm">
                              {slot.startTime}{slot.endTime ? ` – ${slot.endTime}` : ''}
                            </p>
                          </div>
                        )}
                        {slot.notes && (
                          <p className="text-[#2D1225]/40 text-xs pl-[26px]">{slot.notes}</p>
                        )}
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#F9BDD4]">
                        <a
                          href="https://www.instagram.com/naughtyberrycpt"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] text-[#E8176D]/70 hover:text-[#E8176D] transition-colors font-medium tracking-widest uppercase"
                        >
                          <Instagram size={11} />
                          @naughtyberrycpt
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    </motion.div>
                  ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Instagram CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #E8176D22 0%, #FDE8EF 50%, #E8176D22 100%)',
              border: '1px solid rgba(232,23,109,0.15)',
            }}
          />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, #E8176D 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-12">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D] mb-2">
                Never Miss Us
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-[#2D1225]">
                Follow <span className="text-[#E8176D]">@naughtyberrycpt</span>
              </h3>
              <p className="text-[#2D1225]/50 mt-2">
                Weekly location drops every Thursday. Reels, drips, and behind-the-scenes.
              </p>
            </div>
            <a
              href="https://www.instagram.com/naughtyberrycpt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 rounded-full gradient-berry text-white font-semibold text-sm tracking-widest uppercase shrink-0 hover:shadow-[0_0_24px_rgba(232,20,60,0.4)] transition-all"
              aria-label="Follow Naughty Berry on Instagram"
              style={{ color: '#fff' }}
            >
              <Instagram size={16} />
              Follow on Instagram
            </a>
          </div>
        </motion.div>
      </div>
      <WaveDivider variant="findus" fill="#FFF0F6" height={60} />
    </section>
  )
}
