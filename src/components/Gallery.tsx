import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { X, Instagram, ZoomIn } from 'lucide-react'

// Placeholder gallery items — swap with real product photos
const GALLERY = [
  { id: 1, label: 'Classic Cup',     sub: 'The signature',      color: '#E8176D', emoji: '🍓', img: '/original.jpg',    tall: true  },
  { id: 2, label: 'Brownie Cup',     sub: 'Pure indulgence',    color: '#8B4513', emoji: '🍫', img: '/brownie.jpg',     tall: false },
  { id: 3, label: 'Dubai Chocolate', sub: 'The viral one',      color: '#E8176D', emoji: '✨', img: '/dubai.jpg',       tall: false },
  { id: 4, label: 'Market Day',      sub: 'Cape Town pop-up',   color: '#9B59B6', emoji: '🎪', img: '/market.jpg',     tall: false },
  { id: 5, label: 'Chocolate Dip',   sub: 'Hand-crafted',       color: '#E8176D', emoji: '🍬', img: '/brownie.jpg',    tall: true  },
  { id: 6, label: 'Strawberry Box',  sub: 'Gift-ready',         color: '#E8176D', emoji: '🎁', img: '/strawberry.jpg', tall: false },
  { id: 7, label: 'Event Setup',     sub: 'Wedding catering',   color: '#2D6A4F', emoji: '💍', img: '/setup.jpg',      tall: false },
  { id: 8, label: 'Team in Action',  sub: 'Behind the scenes',  color: '#E8176D', emoji: '👩‍🍳', img: '/team.jpg',     tall: true  },
]

interface GalleryItem {
  id: number
  label: string
  sub: string
  color: string
  emoji: string
  img?: string
  tall?: boolean
}

function PlaceholderImage({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="w-full relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{ aspectRatio: item.tall ? '3 / 4' : '4 / 3' }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      aria-label={`View ${item.label} – ${item.sub}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {item.img ? (
        <img
          src={item.img}
          alt={item.label}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${item.color}25 0%, #FDE8EF 100%)`,
            border: `1px solid ${item.color}20`,
          }}
        >
          <div
            className="absolute w-32 h-32 rounded-full opacity-20 blur-2xl"
            style={{ background: item.color }}
            aria-hidden="true"
          />
          <span
            className={`relative text-5xl mb-3 select-none ${prefersReducedMotion ? '' : 'animate-float-soft'}`}
            style={{ animationDuration: '3.6s' }}
          >
            {item.emoji}
          </span>
          <span className="relative text-xs font-bold tracking-widest uppercase text-[#2D1225]/30">
            Photo Placeholder
          </span>
        </div>
      )}

      {/* Hover overlay — CSS transition, no JS state */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `${item.color}BB`, backdropFilter: 'blur(4px)' }}
      >
        <ZoomIn size={28} className="text-white mb-2" />
        <p className="font-display font-bold text-white text-lg">{item.label}</p>
        <p className="text-white/70 text-xs">{item.sub}</p>
      </div>
    </motion.div>
  )
}

export default function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  return (
    <section id="gallery" className="py-24 lg:py-32 relative overflow-hidden bg-[#FFF0F6]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                alt=""
                aria-hidden="true"
                className="w-5 h-5 object-contain opacity-85"
                draggable={false}
              />
              <span className="w-8 h-[1px] bg-[#E8176D]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8176D]">
                Gallery
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] leading-tight">
              Fresh Off the <br />
              <span className="text-shimmer">Chocolate Drizzle.</span>
            </h2>
          </div>
          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 self-start shrink-0 text-[#2D1225]/50 text-sm hover:text-[#E8176D] transition-colors"
            aria-label="See more on Instagram"
          >
            <Instagram size={16} />
            More on @naughtyberrycpt
          </a>
        </motion.div>

        {/* Masonry columns grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0"
        >
          {GALLERY.map((item, i) => (
            <motion.div
              key={item.id}
              className="break-inside-avoid mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <PlaceholderImage item={item} onClick={() => setSelected(item)} />
            </motion.div>
          ))}
        </motion.div>

        {/* Instagram strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center"
        >
          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#F9BDD4] text-[#2D1225]/50 text-sm hover:border-[#E8176D]/40 hover:text-[#E8176D] transition-all"
          >
            <Instagram size={15} />
            See the full feed on @naughtyberrycpt
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`Photo: ${selected.label}`}
          >
            <motion.button
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-[#F9BDD4] rounded-2xl flex items-center justify-center text-[#2D1225]/70 hover:text-[#E8176D] transition-colors"
              onClick={() => setSelected(null)}
              aria-label="Close lightbox"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <X size={18} />
            </motion.button>
            <motion.div
              layoutId={`gallery-card-${selected.id}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {selected.img ? (
                <img
                  src={selected.img}
                  alt={selected.label}
                  className="w-full max-h-[70vh] object-cover rounded-3xl"
                  draggable={false}
                />
              ) : (
              <div
                className="w-full h-80 rounded-3xl flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${selected.color}30 0%, #FDE8EF 100%)`,
                  border: `1px solid ${selected.color}30`,
                }}
              >
                <span className="text-8xl mb-4">{selected.emoji}</span>
                <span className="text-xs tracking-[0.2em] uppercase text-[#2D1225]/30 font-semibold">
                  Add your photo here
                </span>
              </div>
              )}
              <div className="mt-4 text-center">
                <h3 className="font-display text-2xl font-bold text-[#2D1225]">{selected.label}</h3>
                <p className="text-[#2D1225]/50 text-sm mt-1">{selected.sub}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <WaveDivider variant="gallery" fill="#FDE8EF" height={60} />
    </section>
  )
}
