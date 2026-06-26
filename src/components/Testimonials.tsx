import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote: 'The strawberry cups look so yummy. Definitely a balanced diet.',
    name: 'Quaanitah',
    handle: '@quaanitah',
  },
  {
    quote: 'Isa can review it.',
    name: 'Soraya Jacobs',
    handle: '@_sorayajacobs',
  },
  {
    quote: 'The strawberries are always so so fresh and juicy and chocolate is just too good 😊',
    name: 'Milkshaikk',
    handle: '@milkshaikk_',
  },
  {
    quote: 'My favourite sweet treat ever!!',
    name: 'Milkshaikk',
    handle: '@milkshaikk_',
  },
  {
    quote: 'NEVER DISAPPOINTS! Always so fresh and tasty! ❤️',
    name: 'Naailah H.',
    handle: '@naailah_h',
  },
  {
    quote: "Also, AMAZING service. Just chef's kiss 🤌",
    name: 'Aadielah Solomon',
    handle: '@aadielahsolomon',
  },
  {
    quote: 'super friendly staff! strawberries & brownies are ALWAYS covered in a generous amount of chocolate 🥰',
    name: 'Aadielah Solomon',
    handle: '@aadielahsolomon',
  },
  {
    quote: 'Most delicious strawberries I’ve ever tasted! 😋',
    name: 'Ammaarah B.',
    handle: '@ammaarah.b',
  },
  {
    quote: 'It was an absolute pleasure having you as part of our wedding. Thank you for your wonderful service and yummy treats(as always) it was definitely a hit among the guests! 😊',
    name: 'Ammaarah B.',
    handle: '@ammaarah.b',
  }
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
