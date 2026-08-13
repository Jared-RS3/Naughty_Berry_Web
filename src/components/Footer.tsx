import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Heart,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { usePopupSchedule } from '../hooks/usePopupSchedule'
import { mapsHref, pickNext, shortWhen } from '../lib/nextStop'
import { EMAIL_RE } from '../lib/quote'

const EASE_OUT = [0.22, 1, 0.36, 1] as const
/** TODO: swap in Daybreak's live site — this is the only place it's referenced. */
const DAYBREAK_URL = 'https://daybreaktech.agency'
/** Alpha-only crop of the Daybreak wordmark, so the mark takes its colour from
 *  the link (and its hover) rather than carrying the plate the original PNG had. */
const DAYBREAK_MARK = 'url(/daybreak-mark.png) center / contain no-repeat'

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    title: 'Email us',
    description: 'We’ll reply within 24 hours.',
    value: 'naughtyberryinfo@gmail.com',
    href: 'mailto:naughtyberryinfo@gmail.com',
  },
  {
    icon: CalendarDays,
    title: 'Book an event',
    description: 'Planning something special?',
    value: 'Make it unforgettable.',
    href: '#events',
  },
  {
    icon: MapPin,
    title: 'Find us',
    description: 'See where we’ll be popping up next.',
    value: 'View upcoming locations.',
    href: '#events',
  },
  {
    icon: Instagram,
    title: 'DM us',
    description: 'Talk to us directly on Instagram.',
    value: '@naughtyberrycpt',
    href: 'https://www.instagram.com/naughtyberrycpt',
  },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  // Same shared Airtable fetch the hero and NextStop use, so the card on the
  // map below is the live stop rather than a hard-coded one that goes stale.
  const { schedule, loading, error } = usePopupSchedule()
  const next = error ? null : pickNext(schedule)

  const scrollTo = (href: string) => {
    if (!href.startsWith('#')) return

    document.querySelector(href)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handleContactClick = (href: string) => {
    if (href.startsWith('#')) {
      scrollTo(href)
    }
  }

  // NOTE: this form has no destination yet — nothing is stored or sent. It
  // validates and gives feedback so the input can't carry junk once it is
  // wired up, but until then a "subscriber" is not actually subscribed.
  const [newsletterError, setNewsletterError] = useState<string | null>(null)

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const value = email.trim().slice(0, 254)
    if (!EMAIL_RE.test(value)) {
      setNewsletterError('Please enter a valid email address.')
      return
    }

    setNewsletterError(null)
    setEmail('')
  }

  return (
    <>
      <section
        id="contact"
        className="relative overflow-hidden border-t border-[#E8176D]/10 bg-[#FFDCEA] scroll-mt-20"
      >
        <div className="pointer-events-none absolute left-[-10rem] top-16 h-[26rem] w-[26rem] rounded-full bg-[#FF8FBF]/22 blur-[110px]" />
        <div className="pointer-events-none absolute right-[-10rem] top-56 h-[30rem] w-[30rem] rounded-full bg-[#FFC0DC]/45 blur-[130px]" />

        <div className="relative mx-auto max-w-[1500px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          {/* Contact hero */}
          <div className="grid items-center gap-12 lg:min-h-[620px] lg:grid-cols-[0.78fr_1.22fr] lg:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="relative z-20 max-w-xl lg:pl-6 xl:pl-12"
            >
              <div className="mb-8 flex items-center justify-center gap-3 md:justify-start">
                <span className="text-lg" aria-hidden="true">
                  🍓
                </span>

                <span className="h-px w-8 bg-[#E8176D]/65" />

                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#A72A60]">
                  Contact us
                </p>
              </div>

              <h2
                className="mx-auto max-w-[560px] text-center uppercase leading-[0.9] tracking-[-0.045em] text-[#3B2116] md:mx-0 md:text-left"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <span className="block text-[clamp(1.9rem,9.2vw,7.6rem)]">
                  A Little Naughty.
                </span>

                <span className="block text-[clamp(1.9rem,9.2vw,7.6rem)] text-[#E8176D]">
                  A Lot Delicious.
                </span>
              </h2>

              <p className="mx-auto mt-8 max-w-sm text-center text-base leading-7 text-[#674255] sm:text-lg md:mx-0 md:text-left">
                Got a question, an idea or an event in mind? We’d love to hear
                from you.
              </p>
            </motion.div>

            {/* Trailer image */}
            <motion.div
              initial={{ opacity: 0, x: 55, scale: 0.97 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.85,
                delay: 0.08,
                ease: EASE_OUT,
              }}
              className="relative flex min-h-[240px] items-center justify-center sm:min-h-[460px] lg:min-h-[650px]"
            >
              <div className="pointer-events-none absolute inset-x-[12%] bottom-[7%] h-[25%] rounded-[50%] bg-[#AF416D]/15 blur-[60px]" />

              <div className="pointer-events-none absolute left-[8%] top-[16%] hidden lg:block">
                <div className="relative h-20 w-20">
                  {[0, 30, 60, 90, 120, 150].map((rotation) => (
                    <span
                      key={rotation}
                      className="absolute left-1/2 top-1/2 h-px w-16 origin-left bg-[#E8176D]/28"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <img
                src="/Naughty_Berry_Trailer.webp"
                alt="Naughty Berry pink dessert trailer"
                loading="lazy"
                decoding="async"
                className="relative z-10 h-auto max-h-[690px] w-full max-w-[900px] object-contain drop-shadow-[0_35px_50px_rgba(102,37,67,0.16)]"
              />
            </motion.div>
          </div>

          {/* Contact cards */}
          <div className="mt-8 grid grid-cols-1 overflow-hidden rounded-[28px] border border-[#E8176D]/12 bg-white/40 shadow-[0_25px_80px_rgba(116,49,77,0.06)] sm:bg-white/32 sm:backdrop-blur-sm sm:grid-cols-2 xl:grid-cols-4">
            {CONTACT_OPTIONS.map(
              ({ icon: Icon, title, description, value, href }, index) => {
                const isExternal = href.startsWith('http')
                const isAnchor = href.startsWith('#')

                return (
                  <motion.a
                    key={title}
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    onClick={
                      isAnchor
                        ? (event) => {
                            event.preventDefault()
                            handleContactClick(href)
                          }
                        : undefined
                    }
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.08,
                      ease: EASE_OUT,
                    }}
                    className="group relative flex min-h-[170px] flex-col items-center border-b border-[#E8176D]/10 p-7 text-center transition-colors duration-300 hover:bg-white/55 sm:min-h-[190px] sm:[&:nth-child(odd)]:border-r md:items-start md:text-left xl:border-b-0 xl:border-r xl:last:border-r-0"
                  >
                    <Icon
                      size={31}
                      strokeWidth={1.5}
                      className="mb-5 text-[#E8176D] sm:mb-9"
                    />

                    <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#D61362]">
                      {title}
                    </p>

                    <p className="mx-auto mt-4 max-w-[210px] text-sm leading-6 text-[#60404F] md:mx-0">
                      {description}
                    </p>

                    <p className="mx-auto mt-1 max-w-[230px] text-sm font-medium text-[#3B2116] md:mx-0">
                      {value}
                    </p>

                    <ArrowRight
                      size={16}
                      className="absolute bottom-7 right-7 hidden text-[#E8176D] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 md:block"
                    />
                  </motion.a>
                )
              },
            )}
          </div>

          {/* Pop-up map section */}
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: EASE_OUT }}
            className="relative mt-9 min-h-[390px] overflow-hidden rounded-[30px] border border-[#E8176D]/12 bg-[#F9DDE8]"
          >
            {/* Stylised map */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage: `
                  linear-gradient(32deg, transparent 47%, rgba(255,255,255,.75) 48%, rgba(255,255,255,.75) 50%, transparent 51%),
                  linear-gradient(-24deg, transparent 47%, rgba(255,255,255,.6) 48%, rgba(255,255,255,.6) 50%, transparent 51%)
                `,
                backgroundSize: '180px 130px, 230px 160px',
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#F7D6E2] via-[#F7D9E4]/60 to-[#F6D8E3]/30" />

            {/* Route */}
            <svg
              viewBox="0 0 800 400"
              className="pointer-events-none absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M445 35C360 90 530 110 455 165C385 217 570 230 490 350"
                fill="none"
                stroke="#E8176D"
                strokeWidth="2"
                strokeDasharray="7 8"
                strokeLinecap="round"
                opacity="0.72"
              />
            </svg>

            <div className="relative z-10 grid min-h-[390px] items-center gap-10 p-8 md:grid-cols-[0.75fr_1.25fr] md:p-12 lg:p-16">
              <div className="text-center md:text-left">
                <div className="mb-7 flex items-center justify-center gap-3 md:justify-start">
                  <span aria-hidden="true">🍓</span>
                  <span className="h-px w-8 bg-[#E8176D]/50" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#A92B60]">
                    Find Naughty Berry
                  </p>
                </div>

                <h3
                  className="uppercase leading-[0.92] tracking-[-0.04em] text-[#E8176D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="block text-[clamp(2rem,9vw,5.8rem)] md:text-[clamp(3rem,5vw,5.8rem)]">
                    We pop up.
                  </span>
                  <span className="block text-[clamp(2rem,9vw,5.8rem)] md:text-[clamp(3rem,5vw,5.8rem)]">
                    You pull up.
                  </span>
                  <span className="block text-[clamp(2rem,9vw,5.8rem)] md:text-[clamp(3rem,5vw,5.8rem)] text-[#3B2116]">
                    Simple.
                  </span>
                </h3>

                <p className="mx-auto mt-6 max-w-xs text-sm leading-6 text-[#654555] md:mx-0">
                  Check our upcoming locations and come say hi.
                </p>

                <button
                  type="button"
                  onClick={() => scrollTo('#events')}
                  className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#E8176D] px-6 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition duration-300 hover:-translate-y-1 hover:bg-[#D71062]"
                >
                  View our events
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="relative hidden min-h-[300px] md:block">
                <div className="absolute left-[39%] top-[42%]">
                  <div className="relative">
                    <div className="absolute -inset-5 rounded-full bg-[#E8176D]/12 blur-xl" />
                    <img
                      src="/Naughty_Berry_Trailer.webp"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="relative h-24 w-32 rounded-xl object-cover shadow-xl"
                    />
                  </div>
                </div>

                <MapPin
                  size={38}
                  strokeWidth={1.7}
                  className="absolute left-[28%] top-[12%] text-[#E8176D]"
                  fill="#E8176D"
                />

                <MapPin
                  size={38}
                  strokeWidth={1.7}
                  className="absolute bottom-[11%] left-[48%] text-[#E8176D]"
                  fill="#E8176D"
                />

                <MapPin
                  size={38}
                  strokeWidth={1.7}
                  className="absolute right-[13%] top-[45%] text-[#E8176D]"
                  fill="#E8176D"
                />

                <div className="absolute right-[7%] top-[5%] w-[260px] rounded-[22px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(113,48,75,0.12)] backdrop-blur-md">
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#E8176D]">
                    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8176D] opacity-70" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E8176D]" />
                    </span>
                    Next stop
                  </p>

                  {loading ? (
                    <div className="mt-3 space-y-2">
                      <div className="h-3 w-40 animate-pulse rounded-full bg-[#E8176D]/15" />
                      <div className="h-2.5 w-28 animate-pulse rounded-full bg-[#E8176D]/10" />
                    </div>
                  ) : next ? (
                    <>
                      <p className="mt-2 text-sm font-semibold text-[#3B2116]">
                        {next.slot.location}
                      </p>

                      <p className="mt-1 text-xs text-[#694653]">{shortWhen(next)}</p>

                      <a
                        href={mapsHref(next.slot)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E8176D]"
                      >
                        <Navigation size={13} />
                        Directions
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-sm font-semibold text-[#3B2116]">
                        Still being locked in
                      </p>

                      <p className="mt-1 text-xs text-[#694653]">
                        Locations drop every Thursday.
                      </p>

                      <a
                        href="https://www.instagram.com/naughtyberrycpt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#E8176D]"
                      >
                        <Instagram size={13} />
                        Follow for drops
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Newsletter */}
          <div className="relative mt-9 overflow-hidden rounded-[25px] border border-[#E8176D]/12 bg-white/35 px-6 py-7 sm:px-9">
            <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
                <Mail
                  size={27}
                  strokeWidth={1.6}
                  className="shrink-0 text-[#E8176D]"
                />

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D81464]">
                    Sign up to our newsletter - new flavours, pop-up dates, new products and more
                  </p>
                  <p className="mt-1 text-sm text-[#684756]">
                    New flavours, pop-up dates and sweet moments.
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleNewsletterSubmit}
                className="flex min-h-14 overflow-hidden rounded-full border border-[#E8176D]/12 bg-white/70 p-1.5"
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>

                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (newsletterError) setNewsletterError(null)
                  }}
                  placeholder="Your email address"
                  maxLength={254}
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={newsletterError ? true : undefined}
                  aria-describedby={newsletterError ? 'newsletter-error' : undefined}
                  className="min-w-0 flex-1 bg-transparent px-5 text-sm text-[#3B2116] outline-none placeholder:text-[#9B7586]/65"
                />

                <button
                  type="submit"
                  className="shrink-0 rounded-full bg-[#E8176D] px-6 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#D71062]"
                >
                  Subscribe
                </button>
              </form>
              {newsletterError && (
                <p id="newsletter-error" className="mt-2 pl-5 text-[12px] font-semibold text-[#C01057]">
                  {newsletterError}
                </p>
              )}

              {/* Says out loud what the NOTE above the handler says in code: this
                  form has no destination. /privacy-policy §4 states the same, and
                  both have to change on the day it is wired up. */}
              <p className="text-[11px] leading-relaxed text-[#7A3B5E]/60 lg:col-start-2">
                Sign-ups aren’t live yet — nothing is stored or sent. Follow{' '}
                <a
                  href="https://www.instagram.com/naughtyberrycpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-2 hover:text-[#C01057]"
                >
                  @naughtyberrycpt
                </a>{' '}
                for drops in the meantime. See our{' '}
                <a
                  href="/privacy-policy"
                  className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-2 hover:text-[#C01057]"
                >
                  Privacy Policy
                </a>
                .
              </p>
            </div>

            <div className="pointer-events-none absolute -bottom-11 right-5 hidden h-28 w-28 items-center justify-center rounded-full bg-[#3B2116]/5 md:flex">
              <span className="text-6xl">🍓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t border-[#E8176D]/10 bg-[#FFF8FB]"
        role="contentinfo"
      >
        <div className="mx-auto max-w-[1500px] px-6 py-10 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-4 md:items-start">
              <img
                src="/naughty-berry-logo.png"
                alt="Naughty Berry"
                className="h-12 w-auto object-contain"
              />

              <p className="max-w-sm text-center text-xs leading-5 text-[#7A3B5E]/65 md:text-left">
                Cape Town’s first strawberries and chocolate on tap.
              </p>
            </div>

            <nav
              aria-label="Footer navigation"
              className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
            >
              {[
                { label: 'Menu', href: '#menu' },
                { label: 'Events', href: '#events' },
                { label: 'About', href: '#about' },
                { label: 'Contact', href: '#contact' },
              ].map(({ label, href }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => scrollTo(href)}
                  className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E] transition-colors hover:text-[#E8176D]"
                >
                  {label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <a
                href="mailto:naughtyberryinfo@gmail.com"
                aria-label="Email Naughty Berry"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8176D]/18 text-[#E8176D] transition-colors hover:bg-[#E8176D] hover:text-white"
              >
                <Mail size={16} />
              </a>

              <a
                href="https://www.instagram.com/naughtyberrycpt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Naughty Berry on Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8176D]/18 text-[#E8176D] transition-colors hover:bg-[#E8176D] hover:text-white"
              >
                <Instagram size={16} />
              </a>

              <a
                href="https://www.instagram.com/naughtyberrycpt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Naughty Berry"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8176D]/18 text-[#E8176D] transition-colors hover:bg-[#E8176D] hover:text-white"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-[#E8176D]/10 pt-7 text-center md:flex-row md:text-left">
            <p className="text-[11px] text-[#7A3B5E]/50">
              © {new Date().getFullYear()} Naughty Berry. All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5">
              <a
                href="/privacy-policy"
                className="text-[11px] text-[#7A3B5E]/50 transition-colors hover:text-[#E8176D]"
              >
                Privacy Policy
              </a>

              <a
                href="/cookie-policy"
                className="text-[11px] text-[#7A3B5E]/50 transition-colors hover:text-[#E8176D]"
              >
                Cookie Policy
              </a>

              <a
                href="/terms"
                className="text-[11px] text-[#7A3B5E]/50 transition-colors hover:text-[#E8176D]"
              >
                Terms
              </a>
            </div>

            <p className="flex items-center gap-1.5 text-[11px] text-[#7A3B5E]/50">
              Made with
              <Heart
                size={10}
                className="text-[#E8176D]"
                fill="#E8176D"
                aria-hidden="true"
              />
              in Cape Town
            </p>
          </div>

          {/* Studio credit */}
          <div className="mt-9 flex justify-center">
            <a
              href={DAYBREAK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 text-[#7A3B5E]/75 transition-colors duration-300 hover:text-[#E8176D]"
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.22em]">
                Made by
              </span>

              <span
                className="h-5 w-px bg-current opacity-40"
                aria-hidden="true"
              />

              {/* Sized off the mark's own 214×42 ratio so it never distorts. */}
              <span
                role="img"
                aria-label="Daybreak"
                className="h-[23px] w-[117px] bg-current"
                style={{ mask: DAYBREAK_MARK, WebkitMask: DAYBREAK_MARK }}
              />
            </a>
          </div>
        </div>
      </footer>
    </>
  )
}
