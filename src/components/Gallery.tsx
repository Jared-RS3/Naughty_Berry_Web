import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import SectionHeading from './SectionHeading'
import { X, Instagram } from 'lucide-react'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * Every tile is cropped to the same 4:5 portrait so the wall reads as one grid
 * instead of a ragged masonry — the source photos are a mix of 2:3, 3:2 and 1:1.
 * `focus` shifts the crop window where centring would clip the subject.
 */
const GALLERY: GalleryItem[] = [
  { id: 2, label: 'Cups In Hand', sub: 'Served at your event', img: '/gallery_1.JPG' },
  { id: 3, label: 'The Cart', sub: 'Rolls right in', img: '/gallery_2.JPG' },
  { id: 4, label: 'Iced Tea Trio', sub: 'Sip with your crew', img: '/gallery_3.JPG', focus: '50% 42%' },
  { id: 5, label: 'Carry Bag', sub: 'Gift-ready', img: '/gallery_4.JPG', focus: '50% 60%' },
  { id: 7, label: 'Wedding Days', sub: 'Sweeter together', img: '/gallery_5.JPG', focus: '50% 35%' },
  { id: 11, label: 'Choc Drip Night', sub: 'Night market magic', img: '/gallery_6.JPG', focus: '50% 40%' },
]

interface GalleryItem {
  id: number
  label: string
  sub: string
  img: string
  /** object-position for the 4:5 crop; defaults to centre. */
  focus?: string
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
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <SectionHeading
          eyebrow="Gallery"
          word="GALLERY"
          title={['','']}
          // title={['Fresh off the', 'chocolate drizzle.']}
          className="mb-14"
        />

        {/* Even 2×3 grid — six photos land as two full rows, no ragged edge */}
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {GALLERY.map((item, i) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setSelected(item)}
              aria-label={`View ${item.label}`}
              className="group relative block aspect-[4/5] w-full overflow-hidden rounded-[22px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA]"
              style={{ boxShadow: '0 18px 40px rgba(180, 40, 95, 0.12)' }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              whileHover={prefersReducedMotion ? undefined : { y: -6 }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: EASE_OUT }}
            >
              <img
                src={item.img}
                alt={item.label}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                style={{ objectPosition: item.focus ?? '50% 50%' }}
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2D1225]/75 to-transparent px-4 pb-4 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                <p
                  className="uppercase text-white text-[13px] sm:text-[15px] leading-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {item.label}
                </p>
                <p className="mt-0.5 text-[11px] text-white/70">{item.sub}</p>
              </div>
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
              className="w-full max-w-[820px]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Uncropped here — the grid already shows the 4:5 version */}
              <img
                src={selected.img}
                alt={selected.label}
                className="mx-auto block max-h-[74vh] w-auto max-w-full rounded-[22px] object-contain"
                draggable={false}
              />
              <div className="mt-5 text-center">
                <h3
                  className="uppercase text-xl text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
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
