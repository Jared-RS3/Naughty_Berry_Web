import { useEffect, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
// ArrowRight comes back with the "Book for an Event" button below.
import { ArrowLeft, Instagram, MapPin } from 'lucide-react'
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

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** The intro sits directly under the headline — the longest run of copy on the
 *  page, paired with the stand itself so the opening band has something to look
 *  at while the reader works through three paragraphs. */
const INTRO = [
  'Naughty Berry is all about fun, flavour, and community. Inspired by our love for strawberries, chocolate, and everything pink, we brought it all together to create an experience that’s playful, welcoming, and a little bit indulgent.',
  'At the heart of Naughty Berry is connection, from our friendly, energetic team to the way we engage with every customer. We’re not just serving desserts, we’re creating moments. Think fresh, juicy locally sourced strawberries topped with smooth, premium chocolate, poured right in front of you and served with a smile.',
  'We pop up on select dates at markets and events, with all upcoming locations shared on our website and social media pages. We also bring the Naughty Berry experience to any occasion, from weddings and year-end functions to baby showers, birthdays, and private parties. Naughty Berry adds a pop of fun, colour, and exceptional service to every event.',
]

const CHAPTERS = [
  {
    heading: 'Made with Love',
    image: '/made_with_love.jpg',
    alt: 'Melted couverture chocolate being poured over a cup of strawberries',
    focus: 'center 45%',
    body: [
      'Each cup is carefully prepared by hand and completed in front of you, combining freshness with a fun, interactive experience. From the first pour to the final touch, it’s all about great flavour, quality ingredients, and a little bit of showmanship and, of course, lots of love.',
    ],
  },
  {
    heading: 'Sweet, Simple, Premium',
    image: '/Chocolate_Tap.webp',
    alt: 'A strawberry being dipped into premium melted chocolate',
    focus: 'center 55%',
    body: [
      'We use premium chocolate and locally sourced strawberries, because we believe dessert should always feel a little more exciting than the usual.',
    ],
  },
  {
    heading: 'The Naughty Berry Club',
    image: '/market.jpg',
    alt: 'The pink Naughty Berry trailer parked at a Cape Town weekend market',
    // Both outdoor shots are landscape; cropping them to the column's portrait
    // frame from the centre fills the top half with empty sky.
    focus: 'center 78%',
    body: [
      'Naughty Berry started with just one table, a chocolate melter, and a big dream at local Cape Town markets. From those humble beginnings, our community showed up for us in the best way possible and helped turn that dream into something much bigger. Because of their support, we’ve grown into three trailers, each one built on the same love for strawberries, chocolate, and shared moments that started it all. Our community is the backbone of everything we do, and the Naughty Berry Club continues to grow every day, one cup, one smile, and one pop-up at a time.',
    ],
  },
]

/** Slim standalone header. The home page's Navbar is scroll-spy driven against
 *  sections that do not exist here, so this route gets its own. */
function StoryNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8176D]/10 bg-[#FFDCEA]/95 sm:bg-[#FFDCEA]/85 sm:backdrop-blur-md">
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
            <motion.img
              variants={POP}
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="mx-auto h-8 w-8 object-contain opacity-85 md:mx-0"
              draggable={false}
            />

            {/* Three lines of headline, so this is sized off the longest of them
                rather than the two-word title it replaced. */}
            <motion.h1
              variants={RISE}
              className="mt-6 uppercase leading-[0.95]"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'min(8.8cqw, 62px)',
                letterSpacing: '-0.02em',
              }}
            >
              <span className="block text-[#E8176D]">Cape Town’s First</span>
              <span className="block text-[#3B2116]">Strawberries &amp;</span>
              <span className="block text-[#E8176D]">Chocolate on Tap.</span>
            </motion.h1>
          </div>

          <motion.div variants={RISE} className="relative">
            <div className="overflow-hidden rounded-[26px] shadow-[0_28px_60px_rgba(180,40,95,0.22)]">
              <img
                src="/brownie.jpg"
                alt="Customers queuing at the pink Naughty Berry trailer"
                fetchPriority="high"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>

            {/* The cup breaks the photo's corner so the two halves of the hero
                overlap instead of sitting in separate boxes. */}
            <motion.img
              src="/naughty-hero-cup.webp"
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

      {/* ── Intro: the stand, the three opening paragraphs, then the calls to
             action. Photo on the left, which sets the alternation the chapters
             below pick up from. ── */}
      <section className="bg-[#FFF9ED]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-90px' }}
          transition={{ duration: 0.65, ease: EASE_OUT }}
          className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-[0.88fr_1.12fr] md:gap-16 md:py-20"
        >
          {/* Capped on mobile so the portrait crop doesn't push the copy a
              full screen down the page. */}
          <div className="mx-auto w-full max-w-sm md:max-w-none">
            <div className="overflow-hidden rounded-[26px] shadow-[0_24px_55px_rgba(180,40,95,0.2)]">
              <img
                src="/Stand.webp"
                alt="A Naughty Berry team member serving cups of strawberries from the branded stand"
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>

          <div>
            <div className="space-y-6">
              {INTRO.map((p) => (
                <p key={p.slice(0, 24)} className="text-[17px] leading-[1.75] text-[#7A3B5E]">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              {/* <a
                href="/#events"
                className="group inline-flex items-center gap-2 rounded-full bg-[#E8176D] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#C01057]"
              >
                Book for an Event
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </a> */}

              <a
                href="https://www.instagram.com/naughtyberrycpt"
                target="_blank"
                rel="noopener noreferrer"
                className="nb-pill inline-flex items-center gap-2 px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition-colors hover:text-[#C01057]"
              >
                <Instagram size={15} />
                Follow Our Journey
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Chapters ── */}
      {CHAPTERS.map((c, i) => {
        // The intro above ends on a photo-left, cream band, so the chapters take
        // over the alternation from the opposite side: photos start on the right
        // and the cream band lands on the odd ones. The two run out of phase on
        // purpose — that way neither the layout nor the background ever repeats
        // itself twice in a row down the page.
        const flipped = i % 2 === 0
        const cream = i % 2 === 1

        return (
          <section key={c.heading} className={cream ? 'bg-[#FFF9ED]' : undefined}>
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
                <span
                  className="mx-auto block h-[3px] w-12 rounded-full bg-[#E8176D]/40 md:mx-0"
                  aria-hidden="true"
                />

                <h2
                  className="mt-6 uppercase leading-[1.02] text-[clamp(1.75rem,3.8vw,2.7rem)] text-[#3B2116]"
                  style={{ fontFamily: 'var(--font-display)' }}
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

      {/* ── Close: the sign-off, on the berry card so the page ends on colour ── */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <motion.section
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

          <MapPin size={22} className="relative mx-auto mb-6 text-white/70" aria-hidden="true" />

          <h2
            className="relative uppercase leading-[1.08] text-white text-[clamp(1.6rem,4vw,2.6rem)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            From Cape Town, with Love
          </h2>

          <p className="relative mx-auto mt-6 max-w-2xl text-[17px] leading-[1.75] text-white/85">
            Proudly rooted in the Mother City, we’re here to add a little more fun, colour, and
            sweetness to Cape Town’s dessert scene one strawberry at a time.
          </p>
        </motion.section>
      </div>

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
