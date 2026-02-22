import { useCallback, useMemo, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, Sparkles } from 'lucide-react'
import WaveDivider from './WaveDivider'

type HeroProps = {
  isNaughtyMode: boolean
}

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

const HERO_BERRY_ACCENTS = [
  { x: '3%', y: '10%', size: 72, delay: 0.1, rotate: -12 },
  { x: '86%', y: '22%', size: 58, delay: 0.45, rotate: 11 },
  { x: '77%', y: '84%', size: 66, delay: 0.25, rotate: -7 },
]

export default function Hero({ isNaughtyMode }: HeroProps) {
  const heroRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.2 })
  const imageY = useTransform(smoothProgress, [0, 1], [0, 55])
  const imageRotate = useTransform(smoothProgress, [0, 1], [0, -2])

  const reveal = useMemo(() => ({
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
  }), [prefersReducedMotion])

  const scrollToEvents = useCallback(() =>
    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' }), [])
  const scrollToMenu = useCallback(() =>
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' }), [])

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{
        background: isNaughtyMode
          ? 'radial-gradient(ellipse at 74% 52%, #A80E52 0%, #530328 32%, #0E0010 66%)'
          : 'linear-gradient(160deg, #FDE8EF 0%, #FFF0F6 45%, #FDE8EF 100%)',
      }}
      aria-label="Hero — Naughty Berry"
    >
      {/* ── Decorative blobs ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        {/* top-right warm glow — static, no JS animation */}
        <div
          className="absolute -top-[5%] right-[8%] w-[58vw] h-[58vw] rounded-full blur-[40px]"
          style={{
            opacity: isNaughtyMode ? 0.72 : 0.4,
            background: isNaughtyMode
              ? 'radial-gradient(circle, #E8176D 0%, #9A0D46 10%, transparent 58%)'
              : 'radial-gradient(circle, #FFC8DC, transparent 65%)',
          }}
        />
        {/* bottom-left warm glow */}
        <div
          className="absolute -bottom-[10%] -left-[8%] w-[40vw] h-[40vw] rounded-full blur-[55px]"
          style={{
            opacity: isNaughtyMode ? 0.45 : 0.3,
            background: isNaughtyMode
              ? 'radial-gradient(circle, #5C094A, transparent 65%)'
              : 'radial-gradient(circle, #F78FB3, transparent 65%)',
          }}
        />
        {/* centre subtle pink */}
        <div
          className="absolute top-[30%] left-[35%] w-[40vw] h-[40vw] rounded-full blur-[140px] opacity-20"
          style={{
            background: isNaughtyMode
              ? 'radial-gradient(circle, #FF1E95, transparent 58%)'
              : 'radial-gradient(circle, #E8176D, transparent 60%)',
          }}
        />

        {isNaughtyMode && (
          <>
            {/* Core bright spotlight — matches the reference right-side glow */}
            <div
              className="absolute top-[10%] right-[2%] w-[52vw] h-[80vh] pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 60% 42%, rgba(232,23,109,0.65) 0%, rgba(168,14,82,0.30) 34%, transparent 62%)',
                filter: 'blur(22px)',
              }}
            />
            {/* Secondary deep-pink pulse on image area */}
            <motion.div
              className="absolute top-[20%] right-[18%] w-[30vw] h-[30vw] rounded-full blur-[32px]"
              style={{ background: 'radial-gradient(circle, rgba(255,43,140,0.48) 0%, transparent 68%)', willChange: 'transform, opacity' }}
              animate={prefersReducedMotion ? undefined : { scale: [0.9, 1.08, 0.93], opacity: [0.5, 0.85, 0.55] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}

        {/* Floating decorative dots — CSS animation, desktop only */}
        {!prefersReducedMotion && DOTS.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full hidden md:block animate-float-soft"
            style={{
              left: d.x,
              top: d.y,
              width: d.size,
              height: d.size,
              background: isNaughtyMode
                ? 'linear-gradient(135deg, #FF2D9C, #9F3BFF)'
                : 'linear-gradient(135deg, #E8176D, #FF6BAD)',
              opacity: 0.22,
              animationDuration: `${3.5 + i * 0.4}s`,
              animationDelay: `${d.delay}s`,
            }}
          />
        ))}

        {/* Berry accents — CSS animation, desktop only */}
        {!prefersReducedMotion && HERO_BERRY_ACCENTS.map((berry, i) => (
          <img
            key={`hero-berry-${i}`}
            src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
            alt=""
            aria-hidden="true"
            className="absolute hidden md:block select-none animate-berry-float"
            style={{
              left: berry.x,
              top: berry.y,
              width: berry.size,
              height: 'auto',
              rotate: `${berry.rotate}deg`,
              opacity: isNaughtyMode ? 0.68 : 0.36,
              filter: isNaughtyMode ? 'drop-shadow(0 8px 16px rgba(255,45,156,0.35))' : 'drop-shadow(0 8px 16px rgba(232,23,109,0.22))',
              animationDuration: `${3.8 + i * 0.5}s`,
              animationDelay: `${berry.delay}s`,
            }}
            draggable={false}
          />
        ))}

        {/* Animated wave divider → MenuPreview */}
        <WaveDivider variant="hero" fill={isNaughtyMode ? 'rgba(255,45,156,0.18)' : '#FFF0F6'} height={64} />
      </div>

      {/* ── Mobile: full-bleed strawberry image background ── */}
      <div className="lg:hidden absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="absolute inset-0 flex items-start justify-center pt-36"
        >
          <div
            className={`w-[85%] max-w-[380px] ${prefersReducedMotion ? '' : 'animate-berry-float'}`}
            style={{ animationDuration: '5s' }}
          >
            <img
              src="/3d-delicious-seasonal-fruits.png"
              alt=""
              className="w-full h-auto object-contain select-none"
              style={{
                filter: isNaughtyMode
                  ? 'drop-shadow(0 30px 60px rgba(255,45,156,0.45)) drop-shadow(0 8px 20px rgba(122,27,120,0.40))'
                  : 'drop-shadow(0 30px 60px rgba(232,23,109,0.35)) drop-shadow(0 8px 20px rgba(192,16,87,0.25))',
              }}
              draggable={false}
            />
          </div>
        </motion.div>
        {/* Gradient scrim — image shows through top half, fades to bg at bottom for text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isNaughtyMode
              ? 'linear-gradient(to bottom, rgba(14,0,16,0.08) 0%, rgba(14,0,16,0.18) 35%, rgba(14,0,16,0.78) 62%, rgba(14,0,16,0.97) 100%)'
              : 'linear-gradient(to bottom, rgba(253,232,239,0.05) 0%, rgba(253,232,239,0.18) 32%, rgba(253,232,239,0.82) 62%, rgba(253,232,239,0.98) 100%)',
          }}
        />
      </div>

      {/* ── Navbar spacer + main split ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center max-w-7xl mx-auto w-full px-8 lg:px-16 pt-24 pb-12 lg:pb-6 gap-12 lg:gap-0">

        {/* ── LEFT: copy ── */}
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="visible"
          className="lg:flex-1 flex flex-col items-center lg:items-start justify-center mt-auto lg:mt-0 order-1 lg:order-1 max-w-xl w-full pb-0 lg:pb-0"
        >

          {/* Eyebrow pill */}
          <motion.div
            variants={reveal}
            className={`flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full border ${
              isNaughtyMode
                ? 'border-[#FF2D9C]/40 bg-black/30 backdrop-blur-sm'
                : 'border-[#F9BDD4] bg-white/70'
            }`}
          >
            <Sparkles size={12} className={isNaughtyMode ? 'text-[#FF4DAE]' : 'text-[#E8176D]'} />
            <span className={`text-[11px] font-bold tracking-[0.28em] uppercase ${isNaughtyMode ? 'text-[#FF4DAE]' : 'text-[#E8176D]'}`}>
              Cape Town's First
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={reveal}
            className={`font-display font-black text-5xl md:text-6xl xl:text-7xl leading-[0.92] mb-6 text-center lg:text-left ${
              isNaughtyMode ? 'text-white' : 'text-[#2D1225]'
            }`}
          >
            Strawberries.
            <br />
            {isNaughtyMode ? (
              <span className="inline-block" style={{ color: '#FF2D8C' }}>
                Chocolate.
              </span>
            ) : (
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
            )}
            <br />
            On&nbsp;Tap.
          </motion.h1>

          {/* Divider */}
          <motion.div
            variants={reveal}
            className="w-16 h-[3px] rounded-full mb-6 origin-center lg:origin-left"
            style={{
              background: isNaughtyMode
                ? 'linear-gradient(90deg, #FF2D9C, #9F3BFF)'
                : 'linear-gradient(90deg, #E8176D, #FF6BAD)',
            }}
          />

          {/* Sub */}
          <motion.p
            variants={reveal}
            className={`text-base md:text-lg leading-relaxed mb-8 max-w-sm text-center lg:text-left ${
              isNaughtyMode ? 'text-white/70' : 'text-[#7A3B5E]'
            }`}
          >
            Pop-ups, markets &amp; private events across Cape Town.
            <br />
            <span className={`text-sm ${isNaughtyMode ? 'text-white/45' : 'text-[#7A3B5E]/60'}`}>Follow us to find where we are this weekend.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={reveal}
            className="flex flex-col sm:flex-row gap-3 items-center lg:items-start"
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 8px 40px rgba(232,23,109,0.40)' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToEvents}
              className={`px-8 py-4 rounded-full text-white font-bold text-sm tracking-widest uppercase shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 motion-sheen ${
                isNaughtyMode
                  ? 'bg-[#E8176D] hover:bg-[#FF2D9C] focus:ring-[#FF2D9C] focus:ring-offset-black'
                  : 'gradient-berry focus:ring-[#E8176D] focus:ring-offset-[#FDE8EF]'
              }`}
            >
              Book Us for an Event
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, borderColor: '#E8176D', color: '#E8176D' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToMenu}
              className={`px-8 py-4 rounded-full border-2 font-bold text-sm tracking-widest uppercase transition-all ${
                isNaughtyMode
                  ? 'border-white/30 text-white bg-transparent hover:border-white/60'
                  : 'border-[#F9BDD4] text-[#7A3B5E] bg-white hover:border-[#E8176D] hover:text-[#E8176D]'
              }`}
            >
              View Menu
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={reveal}
            className={`flex items-center gap-3 mt-10 px-4 py-3 rounded-2xl border w-fit mx-auto lg:mx-0 ${
              isNaughtyMode ? 'border-white/15 bg-black/30 backdrop-blur-sm' : 'border-[#F9BDD4] bg-white/60'
            }`}
          >
            <div className="flex -space-x-2">
              {['#E8176D', '#C01057', '#FF6BAD'].map((c, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-white"
                  style={{
                    background: isNaughtyMode
                      ? `radial-gradient(circle at 35% 35%, ${['#E8176D', '#C01057', '#FF6BAD'][i]}dd, ${['#E8176D', '#C01057', '#FF6BAD'][i]}66)`
                      : `radial-gradient(circle at 35% 35%, ${c}cc, ${c}66)`,
                  }}
                />
              ))}
            </div>
            <div>
              <div className="flex gap-0.5 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xs ${isNaughtyMode ? 'text-[#FF4DAE]' : 'text-[#E8176D]'}`}>★</span>
                ))}
              </div>
              <span className={`text-xs tracking-wide ${isNaughtyMode ? 'text-white/60' : 'text-[#7A3B5E]/70'}`}>Loved across Cape Town pop-ups</span>
            </div>
          </motion.div>
        </motion.div>

        {/* ── RIGHT: floating strawberry image (desktop only — mobile uses absolute bg above) ── */}
        <div className="hidden lg:flex flex-1 items-center justify-center lg:order-2 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative w-full max-w-[520px]"
            style={{ y: prefersReducedMotion ? 0 : imageY, rotate: prefersReducedMotion ? 0 : imageRotate, willChange: prefersReducedMotion ? 'auto' : 'transform' }}
          >


            {/* Hot-pink glow bloom at bottom */}
            <div
              className="absolute bottom-[2%] left-[20%] right-[20%] h-[30%] rounded-full blur-[55px] opacity-60 pointer-events-none"
              style={{
                background: isNaughtyMode
                  ? 'radial-gradient(ellipse, #FF2D9C 0%, #7A1B78 50%, transparent 80%)'
                  : 'radial-gradient(ellipse, #E8176D 0%, #C01057 50%, transparent 80%)',
              }}
            />

            {/* Continuous float + sway */}
            <div
              className={`relative ${prefersReducedMotion ? '' : 'animate-berry-float'}`}
              style={{ animationDuration: '6s' }}
            >
              <img
                src="/3d-delicious-seasonal-fruits.png"
                alt="Fresh bursting strawberries — Naughty Berry Cape Town"
                className="relative w-full h-auto object-contain select-none"
                style={{
                  filter:
                    isNaughtyMode
                      ? 'drop-shadow(0 30px 60px rgba(255,45,156,0.40)) drop-shadow(0 8px 20px rgba(122,27,120,0.35))'
                      : 'drop-shadow(0 30px 60px rgba(232,23,109,0.30)) drop-shadow(0 8px 20px rgba(192,16,87,0.20))',
                }}
                draggable={false}
              />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -6 }}
              transition={{ duration: 0.7, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className={`absolute top-[10%] -right-4 md:right-0 px-4 py-2 rounded-2xl border shadow-lg text-center ${
                isNaughtyMode ? 'border-white/20 bg-black/50 backdrop-blur-md text-white' : 'border-[#F9BDD4] bg-white'
              }`}
            >
              <p className={`text-[10px] font-bold tracking-widest uppercase ${isNaughtyMode ? 'text-[#FF4DAE]' : 'text-[#E8176D]'}`}>🔥 Viral</p>
              <p className={`text-[11px] font-bold whitespace-nowrap ${isNaughtyMode ? 'text-white' : 'text-[#2D1225]'}`}>Dubai Choc</p>
              <p className={`text-[11px] font-bold ${isNaughtyMode ? 'text-white' : 'text-[#2D1225]'}`}>Strawberries</p>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
        className={`relative z-10 flex flex-col items-center pb-8 pointer-events-none ${
          isNaughtyMode ? 'text-[#FF66BE]/60' : 'text-[#E8176D]/40'
        }`}
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase mb-2">Scroll to explore</span>
        <ArrowDown size={14} />
      </motion.div>
    </section>
  )
}
