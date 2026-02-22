import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: "Honestly the best dessert cup I've ever had. The brownie cup hit differently. Send help.",
    name: 'Leila M.',
    handle: '@leilalovescpt',
  },
  {
    quote: 'Had Naughty Berry at my wedding and every single guest asked for the Instagram. 10/10.',
    name: 'Tamsin O.',
    handle: '@tamsinolivier',
  },
  {
    quote: "The Dubai chocolate strawberries are INSANE. Can't stop thinking about them.",
    name: 'Naledi P.',
    handle: '@naledivibes',
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 relative overflow-hidden border-y border-[#F9BDD4] bg-white">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, #E8143C 0%, transparent 60%)' }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <img
            src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
            alt=""
            aria-hidden="true"
            className="w-5 h-5 object-contain opacity-85"
            draggable={false}
          />
          <span className="w-8 h-[1px] bg-[#E8176D]" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
            What Cape Town Says
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white border border-[#F9BDD4] rounded-2xl p-7 relative"
            >
              <div className="text-4xl text-[#E8176D]/30 font-display mb-3 leading-none">"</div>
              <p className="text-[#2D1225]/70 text-sm leading-relaxed mb-5 italic">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #E8143C, #C01057)' }}
                  aria-hidden="true"
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-[#2D1225]/80 text-sm font-semibold">{t.name}</p>
                  <p className="text-[#E8176D]/60 text-xs">{t.handle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
