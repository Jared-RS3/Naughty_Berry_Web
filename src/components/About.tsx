import { motion } from 'framer-motion'
import { Heart, Zap, Users, MapPin } from 'lucide-react'

const VALUES = [
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Every single cup is prepared by hand. No shortcuts — just premium ingredients, real strawberries, and proper chocolate.',
    color: '#E8176D',
  },
  {
    icon: Zap,
    title: 'Premium Always',
    desc: 'We use Belgian chocolate, fresh Cape-grown strawberries, and real cream. Because life\'s too short for average desserts.',
    color: '#E8176D',
  },
  {
    icon: Users,
    title: 'Community First',
    desc: 'We started at local Cape Town markets. The community built Naughty Berry and we show up for it every single weekend.',
    color: '#9B59B6',
  },
  {
    icon: MapPin,
    title: 'Cape Town Proud',
    desc: 'Born and raised in the Mother City. We\'re here to put Cape Town\'s dessert scene on the map. One strawberry at a time.',
    color: '#2D6A4F',
  },
]

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

export default function About() {
  return (
    <>
      {/* ─── Social Proof ──────────── */}
      <section className="py-20 relative overflow-hidden border-y border-[#F9BDD4] bg-white">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #E8143C 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 justify-center mb-10"
          >
            <span className="w-8 h-[1px] bg-[#E8176D]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
              What Cape Town Says
            </span>
            <span className="w-8 h-[1px] bg-[#E8176D]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl p-7 relative"
              >
                <div className="text-4xl text-[#E8176D]/30 font-display mb-3 leading-none">"</div>
                <p className="text-[#2D1225]/70 text-sm leading-relaxed mb-5 italic">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
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

      {/* ─── About ───────────────────── */}
      <section id="about" className="py-24 lg:py-32 relative overflow-hidden bg-[#FDE8EF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Story */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-8 h-[1px] bg-[#E8176D]" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
                  Our Story
                </span>
              </div>

              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-6 leading-tight">
                Cape Town's First <br />
                Strawberries & <br />
                <span className="text-shimmer">Chocolate on Tap.</span>
              </h2>

              <div className="space-y-4 text-[#2D1225]/60 leading-relaxed">
                <p>
                  Naughty Berry started with a simple obsession: why settle for basic desserts when you can have something extraordinary? We took the world's most romantic combination — fresh strawberries and premium chocolate — and made it accessible to everyone.
                </p>
                <p>
                  Every weekend you'll find us at Cape Town's best markets and pop-ups, serving handcrafted dessert cups and chocolate-dipped strawberries made fresh in front of you. No preservatives, no shortcuts — just real ingredients and real flavour.
                </p>
                <p className="text-[#2D1225]/80 font-medium">
                  We're also available for private functions and events across Cape Town. Wedding? Birthday? Year-end function? We bring the Naughty Berry experience to you.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-6 py-3 rounded-full gradient-berry text-white font-semibold text-sm tracking-widest uppercase"
                  aria-label="Book Naughty Berry for an event"
                >
                  Book for an Event
                </motion.button>
                <a
                  href="https://www.instagram.com/naughtyberrycpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border border-[#F9BDD4] text-[#2D1225]/60 font-medium text-sm tracking-widest uppercase hover:border-[#E8176D]/40 hover:text-[#E8176D] transition-all text-center"
                >
                  Follow Our Journey
                </a>
              </div>
            </motion.div>

            {/* Right: Values */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {VALUES.map((v, i) => {
                const Icon = v.icon
                return (
                  <motion.div
                    key={v.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl p-6 hover:border-[#F9BDD4] transition-all duration-300 group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${v.color}20`, border: `1px solid ${v.color}30` }}
                    >
                      <Icon size={18} style={{ color: v.color }} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-[#2D1225] mb-2">{v.title}</h3>
                    <p className="text-[#2D1225]/50 text-sm leading-relaxed">{v.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
