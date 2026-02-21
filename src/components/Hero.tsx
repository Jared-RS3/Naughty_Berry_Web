import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'

// Decorative floating dot coords (% of section)
const DOTS = [
  { x: '8%',  y: '18%', size: 10, delay: 0 },
  { x: '14%', y: '72%', size: 6,  delay: 0.4 },
  { x: '88%', y: '14%', size: 14, delay: 0.2 },
  { x: '82%', y: '78%', size: 8,  delay: 0.7 },
  { x: '50%', y: '6%',  size: 5,  delay: 0.5 },
  { x: '72%', y: '55%', size: 7,  delay: 0.9 },
  { x: '22%', y: '44%', size: 4,  delay: 0.3 },
]

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.2 })
  const glowY = useTransform(smoothProgress, [0, 1], [0, 90])
  const dotsY = useTransform(smoothProgress, [0, 1], [0, 40])
  const imageY = useTransform(smoothProgress, [0, 1], [0, 55])
  const imageRotate = useTransform(smoothProgress, [0, 1], [0, -2])

  const reveal = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
  }

  const scrollToEvents = () =>
    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })
  const scrollToMenu = () =>
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FDE8EF 0%, #FFF0F6 45%, #FDE8EF 100%)' }}
      aria-label="Hero — Naughty Berry"
    >
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* top-right warm glow */}
        <motion.div
          className="absolute -top-[15%] -right-[10%] w-[55vw] h-[55vw] rounded-full blur-[120px] opacity-40"
          style={{ y: prefersReducedMotion ? 0 : glowY, background: 'radial-gradient(circle, #FFC8DC, transparent 65%)' }}
        />
        {/* bottom-left warm glow */}
        <motion.div
          className="absolute -bottom-[10%] -left-[8%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-30"
          style={{ y: prefersReducedMotion ? 0 : glowY, background: 'radial-gradient(circle, #F78FB3, transparent 65%)' }}
        />
        {/* centre subtle pink */}
        <motion.div
          className="absolute top-[30%] left-[35%] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-20"
          style={{ y: prefersReducedMotion ? 0 : dotsY, background: 'radial-gradient(circle, #E8176D, transparent 60%)' }}
        />

        {/* Floating decorative dots */}
        {DOTS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: d.x,
              top: d.y,
              width: d.size,
              height: d.size,
              background: 'linear-gradient(135deg, #E8176D, #FF6BAD)',
              opacity: 0.22,
            }}
            animate={{ y: [0, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 3.5 + i * 0.4, repeat: Infinity, delay: d.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Wavy pink border stripe across the bottom */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ opacity: 0.15 }}
        >
          <path
            d="M0,30 C240,0 480,60 720,30 C960,0 1200,60 1440,30 L1440,60 L0,60 Z"
            fill="#E8176D"
          />
        </svg>
      </div>

      {/* ── Navbar spacer + main split ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-7xl mx-auto w-full px-8 lg:px-16 pt-28 pb-16 gap-12 lg:gap-0">

        {/* ── LEFT: copy ── */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
          className="flex-1 flex flex-col items-start justify-center order-2 lg:order-1 max-w-xl"
        >

          {/* Eyebrow pill */}
          <motion.div
            variants={reveal}
            className="flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border border-[#F9BDD4] bg-white/70"
          >
            <Sparkles size={12} className="text-[#E8176D]" />
            <span className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#E8176D]">
              Cape Town's First
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={reveal}
            className="font-display font-black text-5xl md:text-6xl xl:text-7xl leading-[0.92] text-[#2D1225] mb-6"
          >
            Strawberries.
            <br />
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #E8176D 0%, #C01057 50%, #E8176D 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 3s linear infinite',
              }}
            >
              Chocolate.
            </span>
            <br />
            On&nbsp;Tap.
          </motion.h1>

          {/* Divider */}
          <motion.div
            variants={reveal}
            className="w-16 h-[3px] rounded-full mb-6 origin-left"
            style={{ background: 'linear-gradient(90deg, #E8176D, #FF6BAD)' }}
          />

          {/* Sub */}
          <motion.p
            variants={reveal}
            className="text-[#7A3B5E] text-base md:text-lg leading-relaxed mb-8 max-w-sm"
          >
            Pop-ups, markets &amp; private events across Cape Town.
            <br />
            <span className="text-[#7A3B5E]/60 text-sm">Find us this weekend.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={reveal}
            className="flex flex-col sm:flex-row gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 40px rgba(232,23,109,0.40)' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToEvents}
              className="px-8 py-4 rounded-full gradient-berry text-white font-bold text-sm tracking-widest uppercase shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FDE8EF] motion-sheen"
            >
              Book Us for an Event
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#E8176D', color: '#E8176D' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToMenu}
              className="px-8 py-4 rounded-full border-2 border-[#F9BDD4] text-[#7A3B5E] font-bold text-sm tracking-widest uppercase bg-white hover:border-[#E8176D] hover:text-[#E8176D] transition-all"
            >
              View Menu
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={reveal}
            className="flex items-center gap-3 mt-10 px-4 py-3 rounded-2xl border border-[#F9BDD4] bg-white/60 w-fit"
          >
            <div className="flex -space-x-2">
              {['#E8176D', '#C01057', '#FF6BAD'].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white"
                  style={{ background: `radial-gradient(circle at 35% 35%, ${c}cc, ${c}66)` }}
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#E8176D] text-xs">★</span>
                ))}
              </div>
              <span className="text-[#7A3B5E]/70 text-xs tracking-wide">Loved across Cape Town</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: floating strawberry image ── */}
        <div className="flex-1 flex items-center justify-center order-1 lg:order-2 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full max-w-[520px]"
            style={{ y: prefersReducedMotion ? 0 : imageY, rotate: prefersReducedMotion ? 0 : imageRotate }}
          >
            <motion.div
              className="absolute inset-[10%] rounded-full border border-[#E8176D]/20"
              animate={prefersReducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
            />
            {/* Pink card halo behind image */}
            <div
              className="absolute inset-[4%] rounded-full blur-[60px] opacity-50 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #FFC8DC, transparent 70%)' }}
            />
            {/* Hot-pink glow bloom at bottom */}
            <div
              className="absolute bottom-[2%] left-[20%] right-[20%] h-[30%] rounded-full blur-[55px] opacity-60 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, #E8176D 0%, #C01057 50%, transparent 80%)' }}
            />

            {/* Continuous float + sway */}
            <motion.div
              animate={{
                y: [0, -20, -7, -16, 0],
                rotate: [0, 1.4, -0.4, 0.9, 0],
              }}
              transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }}
              className="relative"
            >
              <img
                src="/3d-delicious-seasonal-fruits.png"
                alt="Fresh bursting strawberries — Naughty Berry Cape Town"
                className="relative w-full h-auto object-contain select-none"
                style={{
                  filter:
                    'drop-shadow(0 30px 60px rgba(232,23,109,0.30)) drop-shadow(0 8px 20px rgba(192,16,87,0.20))',
                }}
                draggable={false}
              />
            </motion.div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-[10%] -right-4 md:right-0 px-4 py-2 rounded-2xl border border-[#F9BDD4] bg-white shadow-lg text-center"
            >
              <p className="text-[10px] font-bold tracking-widest uppercase text-[#E8176D]">🔥 Viral</p>
              <p className="text-[11px] font-bold text-[#2D1225] whitespace-nowrap">Dubai Choc</p>
              <p className="text-[11px] font-bold text-[#2D1225]">Strawberries</p>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className="relative z-10 flex flex-col items-center pb-8 text-[#E8176D]/40 pointer-events-none"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase mb-2">Scroll to explore</span>
        <ArrowDown size={14} />
      </motion.div>
    </section>
  )
}
