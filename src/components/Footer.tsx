import { motion } from 'framer-motion'
import { Instagram, Mail, MapPin, Heart } from 'lucide-react'
import SectionHeading from './SectionHeading'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const QUICK_LINKS = [
  { label: 'Menu', href: '#menu' },
  { label: 'Events', href: '#events' },
  { label: 'Find Us', href: '#findus' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const CONTACTS = [
  {
    icon: Mail,
    eyebrow: 'Email us',
    value: 'naughtyberryinfo@gmail.com',
    href: 'mailto:naughtyberryinfo@gmail.com',
    label: 'Email Naughty Berry',
  },
  {
    icon: Instagram,
    eyebrow: 'Instagram',
    value: '@naughtyberrycpt',
    href: 'https://www.instagram.com/naughtyberrycpt',
    label: 'Naughty Berry on Instagram',
  },
  {
    icon: MapPin,
    eyebrow: 'Based in',
    value: 'Cape Town, South Africa',
    href: null,
    label: null,
  },
]

export default function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ─── Contact ───────────────────── */}
      <section
        id="contact"
        className="py-24 lg:py-28 relative overflow-hidden bg-[#F6E3EB] scroll-mt-20"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <SectionHeading
            eyebrow="Get in Touch"
            word="CONTACT"
            title={['','']}
            // title={['Let’s talk', 'sweet.']}
            lead="For event bookings, press enquiries, or just to say hi — we love hearing from you."
            className="mb-14"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {CONTACTS.map(({ icon: Icon, eyebrow, value, href, label }, i) => {
                const inner = (
                  <>
                    <div
                      className="w-11 h-11 rounded-full bg-[#E8176D]/10 flex items-center justify-center shrink-0"
                      aria-hidden="true"
                    >
                      <Icon size={18} className="text-[#E8176D]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#7A3B5E]/50 mb-1">
                        {eyebrow}
                      </p>
                      <p className="text-[#3B2116] text-sm font-semibold break-words">{value}</p>
                    </div>
                  </>
                )
                return (
                  <motion.div
                    key={eyebrow}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * i, ease: EASE_OUT }}
                  >
                    {href ? (
                      <motion.a
                        href={href}
                        {...(href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.25, ease: EASE_OUT }}
                        className="nb-card flex items-center gap-4 px-6 py-5"
                        aria-label={label ?? undefined}
                      >
                        {inner}
                      </motion.a>
                    ) : (
                      <div className="nb-card flex items-center gap-4 px-6 py-5">{inner}</div>
                    )}
                  </motion.div>
                )
              })}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────── */}
      <footer className="bg-[#FFF0F6] py-14" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            {/* Brand */}
            <div>
              <img
                src="/naughty-berry-logo.png"
                alt="Naughty Berry"
                className="h-14 w-auto object-contain mb-5"
              />
              <p className="text-[#7A3B5E]/70 text-sm leading-relaxed max-w-xs">
                Cape Town’s first strawberries &amp; chocolate on tap. Pop-ups, markets and private
                events.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#E8176D] mb-5">
                Quick Links
              </p>
              <ul className="space-y-2.5" role="list">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollTo(href)}
                      className="text-[#7A3B5E] text-sm hover:text-[#E8176D] transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#E8176D] mb-5">
                Connect
              </p>
              <div className="space-y-2.5">
                <a
                  href="https://www.instagram.com/naughtyberrycpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#7A3B5E] text-sm hover:text-[#E8176D] transition-colors"
                >
                  <Instagram size={15} aria-hidden="true" />
                  @naughtyberrycpt
                </a>
                <a
                  href="mailto:naughtyberryinfo@gmail.com"
                  className="flex items-center gap-3 text-[#7A3B5E] text-sm hover:text-[#E8176D] transition-colors"
                >
                  <Mail size={15} aria-hidden="true" />
                  naughtyberryinfo@gmail.com
                </a>
                <p className="flex items-center gap-3 text-[#7A3B5E] text-sm">
                  <MapPin size={15} aria-hidden="true" />
                  Cape Town, South Africa
                </p>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-8 border-t border-[#E8176D]/12 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#7A3B5E]/50 text-xs">
              © {new Date().getFullYear()} Naughty Berry. All rights reserved. Cape Town, South
              Africa.
            </p>
            <p className="text-[#7A3B5E]/50 text-xs flex items-center gap-1.5">
              Made with{' '}
              <Heart size={10} className="text-[#E8176D]" fill="#E8176D" aria-hidden="true" /> in
              Cape Town
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
