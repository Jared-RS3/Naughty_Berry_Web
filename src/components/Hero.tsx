import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react'
import { Strawberry3D, SceneLighting, FloatingParticles, ChocSphere } from './StrawberryScene'
import { Suspense } from 'react'

const SLIDES = [
  {
    id: 0,
    name: 'Classic Cup',
    tagline: 'The one that started it all.',
    desc: 'Fresh strawberries, silky chocolate drizzle, premium cream — served in a gorgeous dessert cup.',
    price: 'From R65',
    accent: '#E8176D',
    strawColor: '#E8176D',
    withChoc: false,
    badge: 'Fan Favourite',
  },
  {
    id: 1,
    name: 'Brownie Cup',
    tagline: 'Two worlds. One cup.',
    desc: 'Fudgy brownie base loaded with fresh strawberries and a cascade of rich chocolate.',
    price: 'From R75',
    accent: '#C01057',
    strawColor: '#C01057',
    withChoc: true,
    badge: 'Best Seller',
  },
  {
    id: 2,
    name: 'Milk Choc Strawberries',
    tagline: 'Dipped to perfection.',
    desc: 'Hand-dipped whole strawberries in velvety milk chocolate. Simple. Stunning. Naughty.',
    price: 'From R55',
    accent: '#FF6BAD',
    strawColor: '#E8176D',
    withChoc: true,
    badge: 'Crowd Pleaser',
  },
  {
    id: 3,
    name: 'Dubai Chocolate Strawberries',
    tagline: "Cape Town's most talked-about bite.",
    desc: "Our viral special — strawberries enrobed in Dubai pistachio chocolate with kunafa crunch.",
    price: 'From R95',
    accent: '#E8176D',
    strawColor: '#FF6BAD',
    withChoc: true,
    badge: '🔥 Viral Special',
  },
  {
    id: 4,
    name: 'Seasonal Special',
    tagline: 'New drop. Every weekend.',
    desc: "Chef's surprise creation — follow @naughtyberrycpt to find out what's dropping this weekend.",
    price: 'Ask Us',
    accent: '#F78FB3',
    strawColor: '#E8176D',
    withChoc: false,
    badge: 'Limited Drop',
  },
]

import type { Variants } from 'framer-motion'

const SLIDE_VARIANTS: Variants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '60%' : '-60%',
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, damping: 28, stiffness: 260, mass: 0.9 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-60%' : '60%',
    opacity: 0,
    scale: 0.88,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  }),
}

export default function Hero() {
  const [[slide, dir], setSlide] = useState<[number, number]>([0, 0])
  const dragStartX = useRef(0)

  const go = useCallback(
    (newSlide: number) => {
      const bounded = (newSlide + SLIDES.length) % SLIDES.length
      setSlide((prev) => [bounded, bounded > prev[0] ? 1 : -1])
    },
    []
  )

  const current = SLIDES[slide]

  const scrollToMenu = () => {
    document.querySelector('#menu')?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToEvents = () => {
    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col overflow-hidden gradient-hero"
      aria-label="Hero — Naughty Berry"
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-[120px]"
          style={{ background: `radial-gradient(circle, ${current.accent} 0%, transparent 70%)` }}
        />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[80px] bg-[#FF6BAD]" />
      </div>

      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#E8176D 1px, transparent 1px), linear-gradient(90deg, #E8176D 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 lg:px-10 pt-24 pb-12 gap-8 lg:gap-0">

        {/* ─── Left: Copy ───────────────────────────── */}
        <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
          {/* Brand badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="w-8 h-[1px] bg-[#E8176D]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8176D]">
              Cape Town's First
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[0.95] mb-6 text-[#2D1225]"
          >
            Strawberries.
            <br />
            <span className="text-shimmer">Chocolate.</span>
            <br />
            On Tap.
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-[#7A3B5E] text-lg md:text-xl leading-relaxed mb-8 font-medium"
          >
            Cape Town pop-ups&nbsp;+&nbsp;private functions.
            <br />
            <span className="text-[#7A3B5E]/70 text-base">Follow us to find where we are this weekend.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(232,20,60,0.55)' }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToEvents}
              className="px-8 py-4 rounded-full gradient-berry text-white font-bold text-sm tracking-widest uppercase transition-all focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FDE8EF]"
              aria-label="Book us for an event"
            >
              Book Us for an Event
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToMenu}
              className="px-8 py-4 rounded-full border-2 border-[#E8176D]/40 text-[#E8176D] font-bold text-sm tracking-widest uppercase hover:border-[#E8176D] hover:bg-[#E8176D]/10 transition-all focus:outline-none focus:ring-2 focus:ring-[#E8176D]/30 focus:ring-offset-2 focus:ring-offset-[#FDE8EF]"
              aria-label="View menu"
            >
              View Menu
            </motion.button>
          </motion.div>
        </div>

        {/* ─── Right: 3D Slider ─────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg lg:max-w-none relative">

          {/* 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full h-[380px] md:h-[480px] relative"
          >
            <Canvas
              camera={{ position: [0, 0, 3.5], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 2]}
              shadows
              aria-label="3D strawberry visualization"
            >
              <SceneLighting />
              <Suspense fallback={null}>
                <Environment preset="city" />
                <group key={slide}>
                  <Strawberry3D
                    scale={1}
                    color={current.strawColor}
                    withChoc={current.withChoc}
                    autoRotate={true}
                  />
                </group>
                <FloatingParticles />
                <ChocSphere position={[-2.5, -1, -1.5]} />
              </Suspense>
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI * 0.65}
                minPolarAngle={Math.PI * 0.35}
                autoRotate={false}
              />
            </Canvas>

            {/* Reflection blur below */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-[#E8176D]/15 blur-2xl rounded-full pointer-events-none" />
          </motion.div>

          {/* Slide Content Panel */}
          <div
            className="w-full max-w-sm relative overflow-hidden cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => { dragStartX.current = e.clientX }}
            onPointerUp={(e) => {
              const diff = e.clientX - dragStartX.current
              if (diff < -60) go(slide + 1)
              if (diff > 60) go(slide - 1)
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={slide}
                custom={dir}
                variants={SLIDE_VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                className="glass-card rounded-3xl p-6 text-center"
              >
                {/* Badge */}
                <span
                  className="inline-block px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase rounded-full mb-3"
                  style={{
                    background: `${current.accent}22`,
                    color: current.accent,
                    border: `1px solid ${current.accent}44`,
                  }}
                >
                  {current.badge}
                </span>

                <h2 className="font-display text-2xl font-bold text-[#2D1225] mb-1">{current.name}</h2>
                <p className="text-[#E8176D] font-medium text-sm mb-3 italic">{current.tagline}</p>
                <p className="text-[#7A3B5E] text-sm leading-relaxed mb-4">{current.desc}</p>

                <div className="flex items-center justify-between">
                  <span className="text-[#E8176D] font-bold text-lg">{current.price}</span>
                  <button
                    onClick={scrollToMenu}
                    className="text-[11px] tracking-widest uppercase font-bold text-[#7A3B5E] hover:text-[#E8176D] transition-colors"
                    aria-label={`See details for ${current.name}`}
                  >
                    See details →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Arrows */}
            <button
              onClick={() => go(slide - 1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-8 h-8 rounded-full glass-card flex items-center justify-center text-[#7A3B5E] hover:text-[#E8176D] transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => go(slide + 1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-8 h-8 rounded-full glass-card flex items-center justify-center text-[#7A3B5E] hover:text-[#E8176D] transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-5" role="tablist" aria-label="Slide indicators">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === slide}
                aria-label={`Go to slide ${i + 1}: ${s.name}`}
                onClick={() => setSlide([i, i > slide ? 1 : -1])}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === slide ? 24 : 6,
                  height: 6,
                  background: i === slide ? '#E8176D' : 'rgba(232,23,109,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative z-10 flex flex-col items-center pb-8 text-[#7A3B5E]/50"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase mb-2">Scroll to explore</span>
        <ArrowDown size={14} />
      </motion.div>
    </section>
  )
}
