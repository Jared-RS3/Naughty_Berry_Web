import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Instagram, Menu, X, Moon, Sun } from 'lucide-react'

type NavbarProps = {
  isNaughtyMode: boolean
  onToggleNaughtyMode: () => void
}

const links = [
  { label: 'Menu', href: '#menu' },
  { label: 'Events', href: '#events' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const mobileLinks = [
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

  const linkClass = isNaughtyMode
    ? 'text-[#FFD4F0] hover:text-[#FF4DAE]'
    : 'text-[#9A2C58] hover:text-[#E8176D]'

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        /* Solid, not translucent-with-blur. A backdrop-filter on a fixed,
           full-width bar forces the browser to re-blur the strip behind it on
           every single scroll frame — it was the largest raster cost on the
           page. At 90% opacity the blur was barely readable anyway, so an
           opaque bar looks the same and costs nothing to scroll past. */
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? isNaughtyMode
              ? 'bg-[#241030] border-b border-[#8D2E7A]/70 shadow-lg shadow-fuchsia-900/35'
              : 'bg-[#FFE6F0] border-b border-[#FFC2DA] shadow-lg shadow-pink-100/60'
            : 'bg-transparent'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="relative max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 h-20 md:h-16 flex items-center justify-between">
          {/* Desktop Links (left) */}
          <ul className="hidden md:flex items-center gap-8" role="list">
            {links.map(({ label, href }) => (
              <li key={label}>
                <button
                  onClick={() => handleNavClick(href)}
                  className={`text-[13px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 cursor-pointer ${linkClass}`}
                  aria-label={`Navigate to ${label}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>

          {/* Center Logo (absolutely centred) */}
          <a
            href="#top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center group"
            aria-label="Naughty Berry – home"
          >
            <img
              src="/naughty-berry-logo.png"
              alt="Naughty Berry"
              className="h-11 md:h-12 w-auto object-contain"
            />
          </a>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto md:ml-0">
            {/* Naughty / light toggle — subtle icon */}
            <button
              onClick={onToggleNaughtyMode}
              aria-label={isNaughtyMode ? 'Switch to light mode' : 'Get Naughty (dark mode)'}
              className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 ${linkClass}`}
            >
              {isNaughtyMode ? <Sun size={17} strokeWidth={1.6} /> : <Moon size={17} strokeWidth={1.6} />}
            </button>

            <a
              href="https://www.instagram.com/naughtyberrycpt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Naughty Berry on Instagram"
              className={`hidden md:flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 ${linkClass}`}
            >
              <Instagram size={19} strokeWidth={1.6} />
            </a>

            {/* The bar's primary action downloads the menu rather than
                scrolling to it — the "Menu" nav link above already does that. */}
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="/naughty-berry-menu.pdf"
              download="Naughty-Berry-Menu.pdf"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-2 px-6 py-2.5 text-[12px] tracking-[0.16em] uppercase font-bold rounded-full text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isNaughtyMode
                  ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78] hover:shadow-[0_0_28px_rgba(255,45,156,0.45)] focus:ring-[#FF2D9C] focus:ring-offset-[#220A2C]'
                  : 'bg-[#C9366B] hover:bg-[#E8176D] hover:shadow-[0_0_24px_rgba(232,23,109,0.4)] focus:ring-[#E8176D] focus:ring-offset-[#FFDCEA]'
              }`}
              aria-label="Download the menu as a PDF"
            >
              <Download size={14} />
              Menu PDF
            </motion.a>

            {/* Mobile hamburger */}
            <button
              className={`md:hidden flex items-center justify-center w-10 h-10 transition-colors ${linkClass}`}
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
                : 'bg-[#FFDCEA]/95 border-[#FFC2DA]'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <ul className="flex flex-col gap-6" role="list">
              {mobileLinks.map(({ label, href }, i) => (
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
                    : 'bg-white border-[#FFB8D2] text-[#7A3B5E]'
                }`}
              >
                {isNaughtyMode ? 'Light Mode' : 'Get Naughty'}
              </button>
              <a
                href="/naughty-berry-menu.pdf"
                download="Naughty-Berry-Menu.pdf"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className={`flex w-full items-center justify-center gap-2 py-3 rounded-full text-white font-semibold text-sm tracking-widest uppercase ${
                  isNaughtyMode ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78]' : 'bg-[#C9366B]'
                }`}
              >
                <Download size={15} />
                Menu PDF
              </a>
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
