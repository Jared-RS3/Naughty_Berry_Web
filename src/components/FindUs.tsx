import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Instagram, ExternalLink } from 'lucide-react'
import WaveDivider from './WaveDivider'

const SCHEDULE = [
  {
    day: 'Friday',
    date: 'Update weekly',
    location: 'Follow @naughtyberrycpt for exact location',
    area: 'Cape Town CBD Area',
    time: '17:00 – 21:00',
    confirmed: false,
  },
  {
    day: 'Saturday',
    date: 'Update weekly',
    location: 'Cape Town Market / Pop-up TBC',
    area: 'Atlantic Seaboard / Southern Suburbs',
    time: '10:00 – 16:00',
    confirmed: false,
  },
  {
    day: 'Sunday',
    date: 'Update weekly',
    location: 'Neighbourhood Market / Design Fair',
    area: 'Cape Town area TBC',
    time: '09:00 – 14:00',
    confirmed: false,
  },
]

export default function FindUs() {
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
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-3 leading-tight">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {SCHEDULE.map((slot, i) => (
            <motion.div
              key={slot.day}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl p-7 relative overflow-hidden group hover:border-[#E8176D]/30 transition-all duration-300"
            >
              {/* Day accent */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#E8176D] to-transparent opacity-50 rounded-l-2xl" />

              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#2D1225]">{slot.day}</h3>
                  <p className="text-[#2D1225]/30 text-xs mt-0.5">{slot.date}</p>
                </div>
                <span className={`px-2 py-1 text-[9px] font-bold tracking-widest rounded-full uppercase ${
                  slot.confirmed
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-[#F9BDD4]/30 text-[#7A3B5E]/50 border border-[#F9BDD4]'
                }`}>
                  {slot.confirmed ? 'Confirmed' : 'Check IG'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-[#E8176D] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[#2D1225]/80 text-sm font-medium">{slot.location}</p>
                    <p className="text-[#2D1225]/40 text-xs mt-0.5">{slot.area}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#E8176D] shrink-0" />
                  <p className="text-[#2D1225]/60 text-sm">{slot.time}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#F9BDD4]">
                <a
                  href="https://www.instagram.com/naughtyberrycpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-[#E8176D]/70 hover:text-[#E8176D] transition-colors font-medium tracking-widest uppercase"
                >
                  <Calendar size={11} />
                  Confirm on Instagram
                  <ExternalLink size={9} />
                </a>
              </div>
            </motion.div>
          ))}
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
