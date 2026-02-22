import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X } from 'lucide-react'

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
          role="region"
          aria-label="Quick actions"
        >
          {/* Expanded menu */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="flex flex-col gap-2"
              >
                {/* Book Event */}
                <motion.button
                  whileHover={{ scale: 1.04, x: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })
                    setExpanded(false)
                  }}
                  className="flex items-center gap-3 px-5 py-3 rounded-full gradient-berry text-white text-sm font-semibold shadow-lg shadow-[#E8176D]/30"
                  aria-label="Book Naughty Berry for an event"
                >
                  <Calendar size={15} />
                  Book an Event
                </motion.button>

                {/* WhatsApp (placeholder — add number when available) */}
                {/* <motion.a
                  whileHover={{ scale: 1.04, x: -4 }}
                  whileTap={{ scale: 0.97 }}
                  href="https://wa.me/27000000000?text=Hi%20Naughty%20Berry!%20I%27d%20like%20to%20enquire%20about%20an%20event."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 rounded-full text-white text-sm font-semibold shadow-lg"
                  style={{ background: '#25D366', boxShadow: '0 0 20px rgba(37,211,102,0.3)' }}
                  aria-label="Chat on WhatsApp"
                >
                  <MessageCircle size={15} />
                  WhatsApp Us
                </motion.a> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setExpanded((p) => !p)}
            className="relative w-14 h-14 rounded-full gradient-berry flex items-center justify-center text-white shadow-xl animate-pulse-glow focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FDE8EF]"
            aria-expanded={expanded}
            aria-label={expanded ? 'Close quick actions' : 'Open quick actions'}
          >
            <img
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-2 -left-2 w-5 h-5 object-contain"
              draggable={false}
            />
            <motion.div
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expanded ? <X size={22} /> : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 2C9 2 6.5 4.5 6.5 7c0 1.5.7 2.8 1.8 3.7L3 16h6v1c0 1.7 1.3 3 3 3s3-1.3 3-3v-1h6l-5.3-5.3C15.8 9.8 16.5 8.5 16.5 7 16.5 4.5 14 2 12 2z" />
                </svg>
              )}
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
