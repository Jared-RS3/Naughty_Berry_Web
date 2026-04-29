import { motion } from 'framer-motion'
import { Heart, Zap, Users, MapPin } from 'lucide-react'
import WaveDivider from './WaveDivider'

const VALUES = [
  {
    icon: Heart,
    title: 'Made with Love',
    desc: 'Each cup is carefully prepared by hand and completed in front of you, combining freshness with a fun, interactive experience. From the first pour to the final touch, it\'s all about great flavour, quality ingredients, and a little bit of showmanship and, of course, lots of love.',
    color: '#E8176D',
  },
  {
    icon: Zap,
    title: 'Sweet, Simple, Premium',
    desc: 'We use premium chocolate and locally sourced strawberries, because we believe dessert should always feel a little more exciting than the usual.',
    color: '#E8176D',
  },
  {
    icon: Users,
    title: 'The Naughty Berry Club',
    desc: 'Naughty Berry started with just one table, a chocolate melter, and a big dream at local Cape Town markets. From those humble beginnings, our community showed up for us in the best way possible and helped turn that dream into something much bigger. Because of their support, we\'ve grown into three trailers, each one built on the same love for strawberries, chocolate, and shared moments that started it all. Our community is the backbone of everything we do, and the Naughty Berry Club continues to grow every day, one cup, one smile, and one pop-up at a time.',
    color: '#9B59B6',
  },
  {
    icon: MapPin,
    title: 'From Cape Town, with Love',
    desc: 'Proudly rooted in the Mother City, we\'re here to add a little more fun, colour, and sweetness to Cape Town\'s dessert scene one strawberry at a time.',
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
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
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


              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-6 leading-tight text-center lg:text-left">
                Cape Town's First <br />
                Strawberries & <br />
                <span className="text-shimmer">Chocolate on Tap.</span>
              </h2>

              <div className="space-y-4 text-[#2D1225]/60 leading-relaxed text-center lg:text-left">
                <p>
                  Naughty Berry is all about fun, flavour, and community. Inspired by our love for strawberries, chocolate, and everything pink, we brought it all together to create an experience that's playful, welcoming, and a little bit indulgent.
                </p>
                <p>
                  At the heart of Naughty Berry is connection, from our friendly, energetic team to the way we engage with every customer. We're not just serving desserts, we're creating moments. Think fresh, juicy locally sourced strawberries topped with smooth, premium chocolate, poured right in front of you and served with a smile.
                </p>
                <p className="text-[#2D1225]/80 font-medium">
                  We pop up on select dates at markets and events, with all upcoming locations shared on our website and social media pages. We also bring the Naughty Berry experience to any occasion, from weddings and year-end functions to baby showers, birthdays, and private parties. Naughty Berry adds a pop of fun, colour, and exceptional service to every event.
                </p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center lg:items-start">
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
              className="flex flex-col gap-4"
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
                    className="bg-white border border-[#F9BDD4] rounded-2xl p-5 hover:border-[#E8176D]/30 transition-all duration-300 flex gap-4 items-start"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${v.color}20`, border: `1px solid ${v.color}30` }}
                    >
                      <Icon size={18} style={{ color: v.color }} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-[#2D1225] mb-1">{v.title}</h3>
                      <p className="text-[#2D1225]/50 text-sm leading-relaxed">{v.desc}</p>
                    </div>
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
