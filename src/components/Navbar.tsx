import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Instagram, Menu, X } from 'lucide-react'

type NavbarProps = {
  isNaughtyMode: boolean
  onToggleNaughtyMode: () => void
}

const links = [
  { label: 'Menu', href: '#menu' },
  { label: 'Events', href: '#events' },
  { label: 'Find Us', href: '#findus' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ isNaughtyMode, onToggleNaughtyMode }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNavClick = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? isNaughtyMode
              ? 'backdrop-blur-xl bg-[#220A2C]/85 border-b border-[#8D2E7A]/70 shadow-lg shadow-fuchsia-900/35'
              : 'backdrop-blur-xl bg-white/90 border-b border-[#F9BDD4] shadow-lg shadow-pink-100/60'
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 md:h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 group"
            aria-label="Naughty Berry – home"
          >
            <NaughtyBerryLogo />
          </a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-7" role="list">
            {links.map(({ label, href }) => (
              <li key={label}>
                <button
                  onClick={() => handleNavClick(href)}
                  className={`text-[13px] font-bold tracking-widest uppercase transition-colors duration-200 cursor-pointer ${
                    isNaughtyMode
                      ? 'text-[#FFD4F0] hover:text-[#FF4DAE]'
                      : 'text-[#7A3B5E] hover:text-[#E8176D]'
                  }`}
                  aria-label={`Navigate to ${label}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.instagram.com/naughtyberrycpt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Naughty Berry on Instagram"
              className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 ${
                isNaughtyMode
                  ? 'text-[#FFD4F0] hover:text-[#FF4DAE]'
                  : 'text-[#7A3B5E] hover:text-[#E8176D]'
              }`}
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggleNaughtyMode}
              className={`hidden md:flex items-center px-5 py-2 text-[12px] tracking-widest uppercase font-bold rounded-full border transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isNaughtyMode
                  ? 'bg-[#FF2D9C] text-white border-[#FF8FD0] shadow-[0_0_28px_rgba(255,45,156,0.45)] focus:ring-[#FF2D9C] focus:ring-offset-[#220A2C]'
                  : 'bg-white/90 text-[#7A3B5E] border-[#F9BDD4] hover:border-[#E8176D] hover:text-[#E8176D] focus:ring-[#E8176D] focus:ring-offset-white'
              }`}
              aria-label="Get Naughty mode"
            >
              Dark
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleNavClick('#events')}
              className={`hidden md:flex items-center px-5 py-2 text-[12px] tracking-widest uppercase font-bold rounded-full text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isNaughtyMode
                  ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78] hover:shadow-[0_0_28px_rgba(255,45,156,0.45)] focus:ring-[#FF2D9C] focus:ring-offset-[#220A2C]'
                  : 'gradient-berry hover:shadow-[0_0_24px_rgba(232,23,109,0.5)] focus:ring-[#E8176D] focus:ring-offset-white'
              }`}
              aria-label="Book an event"
            >
              Book Event
            </motion.button>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden flex items-center justify-center w-10 h-10 transition-colors ${
                isNaughtyMode
                  ? 'text-[#FFD4F0] hover:text-[#FF4DAE]'
                  : 'text-[#7A3B5E] hover:text-[#E8176D]'
              }`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed inset-y-0 right-0 z-40 w-72 backdrop-blur-xl border-l flex flex-col pt-20 px-8 pb-10 ${
              isNaughtyMode
                ? 'bg-[#220A2C]/95 border-[#8D2E7A]/70'
                : 'bg-white/95 border-[#F9BDD4]'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-6" role="list">
              {links.map(({ label, href }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <button
                    onClick={() => handleNavClick(href)}
                    className={`text-[22px] font-display font-bold transition-colors cursor-pointer ${
                      isNaughtyMode
                        ? 'text-[#FFE4F5] hover:text-[#FF4DAE]'
                        : 'text-[#2D1225] hover:text-[#E8176D]'
                    }`}
                  >
                    {label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-4">
              <button
                onClick={onToggleNaughtyMode}
                className={`w-full py-3 rounded-full font-semibold text-sm tracking-widest uppercase border ${
                  isNaughtyMode
                    ? 'bg-[#FF2D9C] border-[#FF8FD0] text-white'
                    : 'bg-white border-[#F9BDD4] text-[#7A3B5E]'
                }`}
              >
                Get Naughty
              </button>
              <button
                onClick={() => handleNavClick('#events')}
                className={`w-full py-3 rounded-full text-white font-semibold text-sm tracking-widest uppercase ${
                  isNaughtyMode ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78]' : 'gradient-berry'
                }`}
              >
                Book Event
              </button>
              <a
                href="https://www.instagram.com/naughtyberrycpt"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${
                  isNaughtyMode ? 'text-[#FFD4F0]' : 'text-[#7A3B5E]'
                }`}
              >
                <Instagram size={16} />
                @naughtyberrycpt
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── SVG Logo ──────────────────────────────────── */
function NaughtyBerryLogo() {
  return (
    <img
      src="/naughty-berry-logo.png"
      alt="Naughty Berry"
      className="h-14 md:h-10 w-auto object-contain"
    />
  )
}
