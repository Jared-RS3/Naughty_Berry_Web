import { useEffect, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Instagram } from 'lucide-react'
import { STAGGER, POP, RISE } from '../motionPresets'
import StoryTags from './StoryTags'

/**
 * /story — the long version of Our Story, reached from the "Read Full Story"
 * link on the home page. It is a real URL, served by the SPA fallback in
 * public/_redirects, so it can be linked and shared on its own.
 */

const ARCHIVO = "'Archivo Black', system-ui, sans-serif"

const CHAPTERS = [
  {
    no: '01',
    heading: 'It started with a tap.',
    body: [
      'Naughty Berry began with one stubborn idea: that a strawberry tastes better the second it leaves the chocolate. Not an hour before, not sitting in a fridge under cling film — right then, still warm, still moving.',
      'So we built the tap. Real couverture chocolate, flowing all night, and a queue of people watching their cup get made in front of them. It turned out we were not the only ones who cared about that thirty-second window.',
    ],
  },
  {
    no: '02',
    heading: 'Cape Town made it ours.',
    body: [
      'What began as a single trailer at a weekend market became a fixture. Different suburb every Saturday, the same faces finding us each time, telling their friends where we would be before we had even posted it.',
      'We buy our strawberries locally and pick them over by hand. The ones that do not make the cup do not leave the kitchen. It is slower, and it is the only version of this we are interested in running.',
    ],
  },
  {
    no: '03',
    heading: 'Now we bring it to you.',
    body: [
      'Weddings, birthdays, year-end functions, a Tuesday because someone deserved it — the tap travels. Our team sets up, styles the station, and serves your guests the same cup we serve at the market.',
      'Still made in front of you. Still handed over while the chocolate is setting. That has not changed since the first night, and it is not going to.',
    ],
  },
]

export default function StoryPage() {
  // This route never mounts LoadingScreen, so nothing else would ever clear the
  // boot screen from index.html. Before paint, so it doesn't flash.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
  }, [])

  useEffect(() => {
    document.title = 'Our Story – Naughty Berry | Cape Town'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-[#F6E3EB] text-[#2D1225]">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[12px] font-bold tracking-[0.2em] uppercase text-[#E8176D] hover:text-[#C01057] transition-colors"
        >
          <ArrowLeft size={15} />
          Back to Naughty Berry
        </a>
      </div>

      {/* Header */}
      <motion.header
        initial="hidden"
        animate="show"
        variants={STAGGER}
        className="max-w-3xl mx-auto px-6 pt-14 pb-4 text-center"
        style={{ containerType: 'inline-size' }}
      >
        <motion.div variants={POP} className="flex items-center justify-center gap-3">
          <img
            src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
            alt=""
            aria-hidden="true"
            className="w-6 h-6 object-contain opacity-85"
            draggable={false}
          />
          <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
          <span className="text-[12px] font-bold tracking-[0.24em] uppercase text-[#E8176D]">
            The Full Story
          </span>
          <span className="w-6 h-[1px] bg-[#E8176D]/60" aria-hidden="true" />
        </motion.div>

        <motion.h1
          variants={RISE}
          className="mt-8 uppercase leading-[0.94]"
          style={{ fontFamily: ARCHIVO, fontSize: 'min(15cqw, 132px)', letterSpacing: '-0.02em' }}
        >
          <span className="block text-[#E8176D]">Our</span>
          <span className="block text-[#3B2116]">Story</span>
        </motion.h1>

        <motion.p variants={RISE} className="mt-7 text-[#7A3B5E] text-lg">
          Cape Town’s first strawberries &amp; chocolate on tap — how a single trailer turned into
          the sweetest queue in the city.
        </motion.p>
      </motion.header>

      {/* Cup */}
      <motion.img
        src="/naughty-hero-cup.png"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.25 }}
        className="cup-img mx-auto mt-10 w-[46%] max-w-[280px] h-auto select-none"
        style={{ '--cup-shadow': 'drop-shadow(0 18px 30px rgba(80,30,55,0.28))' } as React.CSSProperties}
        draggable={false}
      />

      <div className="max-w-3xl mx-auto px-6">
        <StoryTags className="mt-12 justify-center" />
      </div>

      {/* Chapters */}
      <div className="max-w-3xl mx-auto px-6 py-20 space-y-16">
        {CHAPTERS.map((c, i) => (
          <motion.section
            key={c.no}
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-90px' }}
            transition={{ duration: 0.65, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="nb-card p-8 md:p-12"
          >
            <p className="text-[#E8176D] text-sm font-bold tracking-[0.2em]">{c.no}</p>
            <h2
              className="mt-4 uppercase leading-[1.04] text-[clamp(1.5rem,4.4vw,2.3rem)] text-[#3B2116]"
              style={{ fontFamily: ARCHIVO }}
            >
              {c.heading}
            </h2>
            <div className="mt-5 space-y-4">
              {c.body.map((p) => (
                <p key={p.slice(0, 24)} className="text-[#7A3B5E] leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Close */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl mx-auto px-6 pb-24 text-center"
      >
        <h2
          className="uppercase leading-[1.04] text-[clamp(1.6rem,5vw,2.8rem)]"
          style={{ fontFamily: ARCHIVO }}
        >
          <span className="text-[#E8176D]">Come find </span>
          <span className="text-[#3B2116]">the tap.</span>
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/#findus"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E8176D] text-white text-[12px] font-bold tracking-[0.18em] uppercase hover:bg-[#C01057] transition-colors"
          >
            This weekend’s pop-ups
          </a>
          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="nb-pill inline-flex items-center gap-2 px-8 py-4 text-[12px] font-bold tracking-[0.18em] uppercase text-[#E8176D] hover:text-[#C01057] transition-colors"
          >
            <Instagram size={15} />
            @naughtyberrycpt
          </a>
        </div>
      </motion.div>
    </div>
  )
}
