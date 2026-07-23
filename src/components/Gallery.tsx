import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { X, Instagram } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

const GALLERY: GalleryItem[] = [
  { id: 2, label: 'Choc Drip Night', sub: 'Late night vibes', img: '/choc-drip-night.jpg' },
  { id: 3, label: 'Carry Bag', sub: 'Gift-ready', img: '/carry-bag.jpg' },
  { id: 4, label: 'Iced Tea Trio', sub: 'Sip with your crew', img: '/iced-tea-trio.jpg' },
  { id: 5, label: 'Service Window', sub: 'Straight to you', img: '/service-window.jpg' },
  { id: 6, label: 'Iced Tea Sports', sub: 'Refresh & refuel', img: '/iced-tea-sports.jpg' },
  { id: 7, label: 'Iced Tea Duo', sub: 'Better together', img: '/iced-tea-duo.jpg' },
  { id: 10, label: 'Team Trailer', sub: 'Behind the scenes', img: '/team-trailer.jpg' },
  { id: 11, label: 'Trailer Night', sub: 'Night market magic', img: '/trailer-night.jpg' },
  { id: 12, label: 'Trailer Day', sub: 'Come find us', img: '/trailer-day.jpg' },
  { id: 13, label: 'Wedding Event', sub: 'Special occasions', img: '/wedding-event.jpg' },
]

interface GalleryItem {
  id: number
  label: string
  sub: string
  img: string
}

export default function Gallery() {
  const prefersReducedMotion = useReducedMotion()
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  // Escape closes the lightbox, and the page stays put behind it.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  return (
    <section
      id="gallery"
      className="py-24 lg:py-32 relative overflow-hidden bg-[#FFDCEA] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Gallery"
          word="GALLERY"
          title={['','']}
          // title={['Fresh off the', 'chocolate drizzle.']}
          className="mb-14"
        />

        {/* Masonry */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6">
          {GALLERY.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              aria-label={`View ${item.label}`}
              className="block w-full break-inside-avoid mb-4 md:mb-6 rounded-[22px] overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA]"
              style={{ boxShadow: '0 18px 40px rgba(180, 40, 95, 0.12)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={prefersReducedMotion ? undefined : { y: -6 }}
              transition={{ duration: 0.55, delay: (i % 4) * 0.06, ease: EASE_OUT }}
            >
              <img
                src={item.img}
                alt={item.label}
                loading="lazy"
                className="w-full h-auto block"
                draggable={false}
              />
            </motion.button>
          ))}
        </div>

        {/* Instagram CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#E8176D] text-white text-[12px] font-bold tracking-[0.18em] uppercase hover:bg-[#C01057] transition-colors"
          >
            <Instagram size={16} />
            See the full feed
          </a>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#2D1225]/90 sm:bg-[#2D1225]/85 sm:backdrop-blur-md"
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo: ${selected.label}`}
          >
            <button
              type="button"
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white text-[#E8176D] flex items-center justify-center hover:bg-[#FFF0F6] transition-colors"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selected.img}
                alt={selected.label}
                className="w-full max-h-[70vh] object-cover rounded-[22px]"
                draggable={false}
              />
              <div className="mt-5 text-center">
                <h3
                  className="uppercase text-xl text-white"
                  style={{ fontFamily: "'Archivo Black', system-ui, sans-serif" }}
                >
                  {selected.label}
                </h3>
                <p className="text-white/55 text-sm mt-1">{selected.sub}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
