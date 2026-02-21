import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const scrollToEvents = () =>
    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToMenu = () =>
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(135deg, #100508 0%, #2D1225 50%, #180a18 100%)' }}
      aria-label="Hero — Naughty Berry"
    >
      {/* ── Bokeh glows ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="absolute top-0 right-0 w-[70vw] h-[70vw] rounded-full blur-[160px] opacity-[0.18]"
          style={{ background: 'radial-gradient(circle, #E8176D, transparent 65%)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full blur-[130px] opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #C01057, transparent 65%)' }}
        />
      </div>

      {/* ── Main split layout ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-7xl mx-auto w-full px-8 lg:px-16 pt-28 pb-16 gap-12 lg:gap-0">

        {/* ── LEFT: copy ── */}
        <div className="flex-1 flex flex-col items-start justify-center order-2 lg:order-1 max-w-xl">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-10 h-px bg-[#E8176D]" />
            <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#E8176D]">
              Cape Town's First
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.2 }}
            className="font-display font-black text-5xl md:text-6xl xl:text-7xl leading-[0.92] text-white mb-6"
          >
            Strawberries.
            <br />
            <span className="text-shimmer">Chocolate.</span>
            <br />
            On&nbsp;Tap.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="text-white/50 text-base md:text-lg leading-relaxed mb-8 max-w-sm"
          >
            Pop-ups, markets &amp; private events across Cape Town.
            <br />
            <span className="text-white/30 text-sm">Follow us to find where we are this weekend.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.52 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(232,23,109,0.65)' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToEvents}
              className="px-8 py-4 rounded-full gradient-berry text-white font-bold text-sm tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#2D1225]"
            >
              Book Us for an Event
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToMenu}
              className="px-8 py-4 rounded-full border border-white/20 text-white/60 font-bold text-sm tracking-widest uppercase hover:border-white/50 hover:text-white transition-all"
            >
              View Menu
            </motion.button>
          </motion.div>

          {/* Small social proof line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex items-center gap-2 mt-10"
          >
            <div className="flex -space-x-2">
              {['#E8176D','#C01057','#FF6BAD'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#2D1225]"
                  style={{ background: `radial-gradient(circle at 35% 35%, ${c}cc, ${c}66)` }} />
              ))}
            </div>
            <span className="text-white/30 text-xs tracking-wide">Loved across Cape Town pop-ups</span>
          </motion.div>
        </div>

        {/* ── RIGHT: floating strawberry image ── */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full max-w-[520px]"
          >
            {/* Continuous float + gentle sway */}
            <motion.div
              animate={{
                y: [0, -22, -8, -18, 0],
                rotate: [0, 1.5, -0.5, 1, 0],
              }}
              transition={{
                duration: 7,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              }}
              className="relative"
            >
              {/* Glow bloom */}
              <div
                className="absolute bottom-[5%] left-[15%] right-[15%] h-[35%] rounded-full blur-[70px] opacity-80 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, #E8176D 0%, #C01057 50%, transparent 80%)' }}
              />
              {/* Soft halo ring */}
              <div
                className="absolute inset-[8%] rounded-full blur-[50px] opacity-20 pointer-events-none"
                style={{ background: '#FF6BAD' }}
              />

              <img
                src="/3d-delicious-seasonal-fruits.png"
                alt="Fresh bursting strawberries — Naughty Berry Cape Town"
                className="relative w-full h-auto object-contain select-none"
                style={{
                  filter:
                    'drop-shadow(0 40px 80px rgba(232,23,109,0.55)) drop-shadow(0 0 40px rgba(232,23,109,0.2))',
                }}
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="relative z-10 flex flex-col items-center pb-8 text-white/20 pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase mb-2">Scroll to explore</span>
        <ArrowDown size={14} />
      </motion.div>
    </section>
  )
}
