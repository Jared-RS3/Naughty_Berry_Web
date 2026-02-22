import { motion } from 'framer-motion'
import { Heart, Zap, Users, MapPin } from 'lucide-react'
import WaveDivider from './WaveDivider'

const VALUES = [
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Every single cup is prepared by hand. No gimmicks, no shortcuts. Just premium ingredients, real strawberries and proper chocolate.',
    color: '#E8176D',
  },
  {
    icon: Zap,
    title: 'Premium Always',
    desc: 'We use Belgian chocolate, fresh Cape Town strawberries and real cream. Because life is too short for average desserts.',
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

export default function About() {
  return (
    <>
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
                <img
                  src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-5 object-contain opacity-85"
                  draggable={false}
                />
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
                  Naughty Berry started with a simple obsession: why settle for basic desserts when you can have something extraordinary? We took the world's most romantic combination, fresh strawberries and premium chocolate, and made it accessible to everyone.
                </p>
                <p>
                  Every weekend you'll find us at Cape Town's best markets and pop-ups, serving handcrafted dessert cups and chocolate dipped strawberries made fresh right in front of you. No preservatives, no shortcuts. Just real ingredients and real flavour.
                </p>
                <p className="text-[#2D1225]/80 font-medium">
                  We're also available for private functions and events across Cape Town. Whether it's a wedding, a birthday or a year end celebration, we bring the Naughty Berry experience right to you.
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
        <WaveDivider variant="about" fill="#ffffff" height={60} />
      </section>
    </>
  )
}
