import { motion } from 'framer-motion'
import { Instagram, Mail, MapPin, Heart } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Menu', href: '#menu' },
  { label: 'Events', href: '#events' },
  { label: 'Find Us', href: '#findus' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Footer() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* ─── Contact ───────────────────── */}
      <section id="contact" className="py-20 relative overflow-hidden border-t border-[#F9BDD4] bg-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, #E8176D, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-lg"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-[1px] bg-[#E8176D]" />
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
                  Get in Touch
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] mb-4">
                Let's Talk <span className="text-shimmer">Sweet.</span>
              </h2>
              <p className="text-[#2D1225]/50 text-lg">
                For event bookings, press enquiries, or just to say hi — we love hearing from you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              <a
                href="mailto:naughtyberryinfo@gmail.com"
                className="flex items-center gap-4 bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl px-6 py-5 hover:border-[#E8176D]/30 transition-all group"
                aria-label="Email Naughty Berry"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8176D]/10 flex items-center justify-center shrink-0 group-hover:bg-[#E8176D]/20 transition-colors">
                  <Mail size={18} className="text-[#E8176D]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#2D1225]/30 font-semibold mb-0.5">Email Us</p>
                  <p className="text-[#2D1225]/80 text-sm font-medium">naughtyberryinfo@gmail.com</p>
                </div>
              </a>

              <a
                href="https://www.instagram.com/naughtyberrycpt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl px-6 py-5 hover:border-[#E8176D]/30 transition-all group"
                aria-label="Naughty Berry Instagram"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8176D]/10 flex items-center justify-center shrink-0 group-hover:bg-[#E8176D]/20 transition-colors">
                  <Instagram size={18} className="text-[#E8176D]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#2D1225]/30 font-semibold mb-0.5">Instagram</p>
                  <p className="text-[#2D1225]/80 text-sm font-medium">@naughtyberrycpt</p>
                </div>
              </a>

              <div className="flex items-center gap-4 bg-white border border-[#F9BDD4] rounded-2xl rounded-2xl px-6 py-5">
                <div className="w-10 h-10 rounded-xl bg-[#E8176D]/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#E8176D]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#2D1225]/30 font-semibold mb-0.5">Based In</p>
                  <p className="text-[#2D1225]/80 text-sm font-medium">Cape Town, South Africa</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────── */}
      <footer className="border-t border-[#F9BDD4] py-12 bg-[#FFF0F6]" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <img
                  src="/naughty-berry-logo.png"
                  alt="Naughty Berry"
                  className="h-14 w-auto object-contain"
                />
              </div>
              <p className="text-[#2D1225]/40 text-sm leading-relaxed max-w-xs">
                Cape Town's first strawberries & chocolate on tap. Pop-ups, markets, private events.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2D1225]/30 mb-4">Quick Links</p>
              <ul className="space-y-2" role="list">
                {QUICK_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <button
                      onClick={() => scrollTo(href)}
                      className="text-[#2D1225]/50 text-sm hover:text-[#E8176D] transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social + Contact */}
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2D1225]/30 mb-4">Connect</p>
              <div className="space-y-3">
                <a
                  href="https://www.instagram.com/naughtyberrycpt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#2D1225]/50 text-sm hover:text-[#E8176D] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={15} />
                  @naughtyberrycpt
                </a>
                <a
                  href="mailto:naughtyberryinfo@gmail.com"
                  className="flex items-center gap-3 text-[#2D1225]/50 text-sm hover:text-[#E8176D] transition-colors"
                  aria-label="Email"
                >
                  <Mail size={15} />
                  naughtyberryinfo@gmail.com
                </a>
                <div className="flex items-center gap-3 text-[#2D1225]/50 text-sm">
                  <MapPin size={15} className="text-[#E8176D]" />
                  Cape Town, South Africa
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-8 border-t border-[#F9BDD4] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#2D1225]/25 text-xs">
              © {new Date().getFullYear()} Naughty Berry. All rights reserved. Cape Town, South Africa.
            </p>
            <p className="text-[#2D1225]/20 text-xs flex items-center gap-1">
              Made with <Heart size={10} className="text-[#E8176D]" fill="#E8176D" aria-hidden="true" /> in Cape Town
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
