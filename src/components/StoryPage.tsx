import { useEffect, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Instagram, MapPin } from 'lucide-react'
import { STAGGER, POP, RISE } from '../motionPresets'

/**
 * /story — the long version of Our Story, reached from the "Read Full Story"
 * link on the home page. It is a real URL, served by the SPA fallback in
 * public/_redirects, so it can be linked and shared on its own.
 *
 * Laid out as an article: each chapter is a photo paired with its text, sides
 * alternating down the page, and the alternate chapters sit on a full-bleed
 * cream band so the scroll has a rhythm instead of being one unbroken sheet of
 * pink. Because this route never mounts Navbar or Footer it carries its own
 * slim versions of both — a page reached from a share link has to look like
 * part of the site on its own.
 */

const ARCHIVO = "'Archivo Black', system-ui, sans-serif"
const EASE_OUT = [0.22, 1, 0.36, 1] as const

const CHAPTERS = [
  {
    no: '01',
    heading: 'It started with a tap.',
    image: '/chocolate-pour.jpg',
    alt: 'Melted couverture chocolate being poured over a cup of strawberries',
    focus: 'center 45%',
    body: [
      'Naughty Berry began with one stubborn idea: that a strawberry tastes better the second it leaves the chocolate. Not an hour before, not sitting in a fridge under cling film — right then, still warm, still moving.',
      'So we built the tap. Real couverture chocolate, flowing all night, and a queue of people watching their cup get made in front of them. It turned out we were not the only ones who cared about that thirty-second window.',
    ],
  },
  {
    no: '02',
    heading: 'Cape Town made it ours.',
    image: '/market.jpg',
    alt: 'The pink Naughty Berry trailer parked at a Cape Town weekend market',
    // Both outdoor shots are landscape; cropping them to the column's portrait
    // frame from the centre fills the top half with empty sky.
    focus: 'center 78%',
    body: [
      'What began as a single trailer at a weekend market became a fixture. Different suburb every Saturday, the same faces finding us each time, telling their friends where we would be before we had even posted it.',
      'We buy our strawberries locally and pick them over by hand. The ones that do not make the cup do not leave the kitchen. It is slower, and it is the only version of this we are interested in running.',
    ],
  },
  {
    no: '03',
    heading: 'Now we bring it to you.',
    image: '/setup.jpg',
    alt: 'A Naughty Berry cart set up on location for a private event',
    focus: 'center 80%',
    body: [
      'Weddings, birthdays, year-end functions, a Tuesday because someone deserved it — the tap travels. Our team sets up, styles the station, and serves your guests the same cup we serve at the market.',
      'Still made in front of you. Still handed over while the chocolate is setting. That has not changed since the first night, and it is not going to.',
    ],
  },
]

const FACTS = ['Cape Town', 'Every weekend', 'Chocolate on tap']

/** Slim standalone header. The home page's Navbar is scroll-spy driven against
 *  sections that do not exist here, so this route gets its own. */
function StoryNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8176D]/10 bg-[#FFDCEA]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition-colors hover:text-[#C01057]"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Back to Naughty Berry</span>
          <span className="sm:hidden">Back</span>
        </a>

        <a href="/" aria-label="Naughty Berry home">
          <img
            src="/naughty-berry-logo.png"
            alt="Naughty Berry"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </a>

        <a
          href="https://www.instagram.com/naughtyberrycpt"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Naughty Berry on Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#E8176D] transition-colors hover:bg-[#E8176D] hover:text-white"
        >
          <Instagram size={17} />
        </a>
      </div>
    </header>
  )
}

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
    <div className="min-h-screen bg-[#FFDCEA] text-[#2D1225]">
      <StoryNav />

      {/* ── Hero: type on the left, the trailer on the right. The headline needs
             something to sit against, otherwise it floats in flat pink. ── */}
      <section className="mx-auto max-w-6xl px-6 pb-14 pt-10 md:pb-20 md:pt-12">
        <motion.div
          initial="hidden"
          animate="show"
          variants={STAGGER}
          className="grid items-center gap-12 md:grid-cols-[1.08fr_0.92fr] md:gap-14"
        >
          <div className="text-center md:text-left" style={{ containerType: 'inline-size' }}>
            <motion.div variants={POP} className="flex items-center justify-center gap-3 md:justify-start">
              <img
                src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                alt=""
                aria-hidden="true"
                className="h-6 w-6 object-contain opacity-85"
                draggable={false}
              />
              <span className="h-[1px] w-6 bg-[#E8176D]/60" aria-hidden="true" />
              <span className="text-[12px] font-bold uppercase tracking-[0.24em] text-[#E8176D]">
                The Full Story
              </span>
            </motion.div>

            <motion.h1
              variants={RISE}
              className="mt-6 uppercase leading-[0.9]"
              style={{
                fontFamily: ARCHIVO,
                fontSize: 'min(22cqw, 158px)',
                letterSpacing: '-0.03em',
              }}
            >
              <span className="block text-[#E8176D]">Our</span>
              <span className="block text-[#3B2116]">Story</span>
            </motion.h1>

            <motion.p
              variants={RISE}
              className="mx-auto mt-7 max-w-md text-[17px] leading-[1.7] text-[#7A3B5E] md:mx-0"
            >
              Cape Town’s first strawberries &amp; chocolate on tap — how a single trailer turned
              into the sweetest queue in the city.
            </motion.p>

            <motion.div variants={RISE} className="mt-8 flex flex-wrap justify-center gap-2.5 md:justify-start">
              {FACTS.map((f) => (
                <span
                  key={f}
                  className="nb-pill px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#E8176D]"
                >
                  {f}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div variants={RISE} className="relative">
            <div className="overflow-hidden rounded-[26px] shadow-[0_28px_60px_rgba(180,40,95,0.22)]">
              <img
                src="/trailer-day.jpg"
                alt="Customers queuing at the pink Naughty Berry trailer"
                fetchPriority="high"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>

            {/* The cup breaks the photo's corner so the two halves of the hero
                overlap instead of sitting in separate boxes. */}
            <motion.img
              src="/naughty-hero-cup.png"
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 90, damping: 16, delay: 0.35 }}
              className="cup-img absolute -bottom-8 -left-6 w-[34%] max-w-[150px] select-none sm:-bottom-10 sm:-left-10"
              style={
                { '--cup-shadow': 'drop-shadow(0 18px 30px rgba(80,30,55,0.34))' } as React.CSSProperties
              }
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Chapters ── */}
      {CHAPTERS.map((c, i) => {
        // Odd chapters flip the photo to the right and sit on a cream band, so
        // the alternation is carried by the background as well as the layout.
        const flipped = i % 2 === 1

        return (
          <section key={c.no} className={flipped ? 'bg-[#FFF9ED]' : undefined}>
            <motion.div
              initial={{ opacity: 0, y: 34 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-90px' }}
              transition={{ duration: 0.65, ease: EASE_OUT }}
              className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:gap-16 md:py-24"
            >
              <div className={flipped ? 'md:order-2' : undefined}>
                <div className="overflow-hidden rounded-[26px] shadow-[0_24px_55px_rgba(180,40,95,0.2)]">
                  <img
                    src={c.image}
                    alt={c.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover md:aspect-[5/6]"
                    style={{ objectPosition: c.focus }}
                  />
                </div>
              </div>

              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-4 md:justify-start">
                  <span
                    className="leading-none text-[#E8176D] text-[clamp(2.2rem,4vw,3.1rem)]"
                    style={{ fontFamily: ARCHIVO }}
                  >
                    {c.no}
                  </span>
                  <span className="h-px w-10 bg-[#E8176D]/30" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#E8176D]/70">
                    Chapter
                  </span>
                </div>

                <h2
                  className="mt-5 uppercase leading-[1.02] text-[clamp(1.75rem,3.8vw,2.7rem)] text-[#3B2116]"
                  style={{ fontFamily: ARCHIVO }}
                >
                  {c.heading}
                </h2>

                <div className="mt-6 space-y-5">
                  {c.body.map((p) => (
                    <p key={p.slice(0, 24)} className="text-[17px] leading-[1.75] text-[#7A3B5E]">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </section>
        )
      })}

      {/* ── Pull quote — the one line from the copy worth stopping on ── */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <motion.blockquote
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
          className="nb-card-berry relative overflow-hidden px-8 py-14 text-center md:px-20 md:py-16"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/12 blur-3xl"
          />

          <p
            className="relative mx-auto max-w-3xl uppercase leading-[1.14] text-white text-[clamp(1.3rem,2.9vw,2.1rem)]"
            style={{ fontFamily: ARCHIVO }}
          >
            “Still made in front of you. Still handed over while the chocolate is setting.”
          </p>

          <footer className="relative mt-6 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
            Naughty Berry, since night one
          </footer>
        </motion.blockquote>
      </div>

      {/* ── Close ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="mx-auto max-w-3xl px-6 pb-24 text-center"
      >
        <h2
          className="uppercase leading-[1.04] text-[clamp(1.7rem,5vw,2.8rem)]"
          style={{ fontFamily: ARCHIVO }}
        >
          <span className="text-[#E8176D]">Come find </span>
          <span className="text-[#3B2116]">the tap.</span>
        </h2>

        <p className="mx-auto mt-5 max-w-md text-[#7A3B5E]">
          We roam Cape Town every weekend. New locations drop on Instagram every Thursday.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/#findus"
            className="group inline-flex items-center gap-2 rounded-full bg-[#E8176D] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#C01057]"
          >
            <MapPin size={15} />
            This weekend’s pop-ups
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </a>

          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="nb-pill inline-flex items-center gap-2 px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition-colors hover:text-[#C01057]"
          >
            <Instagram size={15} />
            @naughtyberrycpt
          </a>
        </div>
      </motion.div>

      {/* ── Slim footer, so the page ends rather than just stopping ── */}
      <footer className="border-t border-[#E8176D]/10 bg-[#FFF8FB]" role="contentinfo">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-8 text-center sm:flex-row sm:text-left">
          <img
            src="/naughty-berry-logo.png"
            alt="Naughty Berry"
            className="h-10 w-auto object-contain"
          />

          <p className="text-[11px] text-[#7A3B5E]/55">
            © {new Date().getFullYear()} Naughty Berry. Made in Cape Town.
          </p>

          <a
            href="/#contact"
            className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E] transition-colors hover:text-[#E8176D]"
          >
            Get in touch
          </a>
        </div>
      </footer>
    </div>
  )
}
