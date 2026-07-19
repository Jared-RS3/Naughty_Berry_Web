import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { Download, Star, Coffee, GlassWater, ArrowLeft, ArrowRight } from 'lucide-react'

/**
 * Per-flavour backdrop (taken straight from the flavour-card reference
 * designs): `base` is the exact background colour sampled from the card,
 * `decor` are the card's own corner illustrations (strawberries, chocolate
 * swirls, brownies, pistachios, biscuits) cropped into /menu-decor/, and
 * `glow` seats the centre cup. The wash blends back into the site pink
 * (#F6E3EB) at the section edges so neighbouring sections stay seamless.
 */
export type CupTheme = {
  id: string
  base: string
  glow: string
  decor?: { tl: string; tr: string; bl: string; br: string }
}

const decorSet = (flav: string) => ({
  tl: `/menu-decor/${flav}-tl.png`,
  tr: `/menu-decor/${flav}-tr.png`,
  bl: `/menu-decor/${flav}-bl.png`,
  br: `/menu-decor/${flav}-br.png`,
})

const THEME_CLASSIC: CupTheme = {
  id: 'classic',
  base: '#FDEAF1',
  glow: '#F8C9DD',
  decor: decorSet('classic'),
}
const THEME_BROWNIE: CupTheme = {
  id: 'brownie',
  base: '#FCE3E0',
  glow: '#EBC3AE',
  decor: decorSet('brownie'),
}
const THEME_DUBAI: CupTheme = {
  id: 'dubai',
  base: '#E4E1B7',
  glow: '#F0EECB',
  decor: decorSet('dubai'),
}
const THEME_CREAM: CupTheme = {
  id: 'cream',
  base: '#FDEEDA',
  glow: '#F7DDB9',
  decor: decorSet('cream'),
}
const THEME_ICED_TEA: CupTheme = {
  id: 'iced-tea',
  base: '#FBE8D8',
  glow: '#FFD9B5',
}

/** Corner placement, edge-fade mask and entrance pose for each decor slot. */
const DECOR_SLOTS = [
  {
    key: 'tl' as const,
    style: { top: 0, left: 0, width: 'clamp(80px, 10.5vw, 185px)' },
    mask: 'radial-gradient(145% 145% at 0% 0%, black 42%, transparent 72%)',
    from: { x: -46, y: -46, rotate: -8 },
  },
  {
    key: 'tr' as const,
    style: { top: 0, right: 0, width: 'clamp(105px, 12.5vw, 225px)' },
    mask: 'radial-gradient(145% 145% at 100% 0%, black 42%, transparent 72%)',
    from: { x: 46, y: -46, rotate: 8 },
  },
  {
    key: 'bl' as const,
    style: { bottom: '4%', left: 0, width: 'clamp(80px, 10.5vw, 185px)' },
    mask: 'radial-gradient(145% 145% at 0% 100%, black 42%, transparent 72%)',
    from: { x: -46, y: 46, rotate: 6 },
  },
  {
    key: 'br' as const,
    style: { bottom: '4%', right: 0, width: 'clamp(105px, 12.5vw, 225px)' },
    mask: 'radial-gradient(145% 145% at 100% 100%, black 42%, transparent 72%)',
    from: { x: 46, y: 46, rotate: -6 },
  },
]

export const MENU_CATEGORIES = [
  {
    id: 'cups',
    label: 'Cups',
    word: 'CUPS',
    icon: Coffee,
    color: '#E8143C',
    items: [
      {
        name: 'Naughty Classic Cup',
        desc: 'Fresh strawberries drenched in creamy milk chocolate, finished in front of you for a simple, indulgent treat that never misses.',
        price: 'R75',
        tag: null,
        cutout: '/menu-cups/classic.png',
        theme: THEME_CLASSIC,
      },
      {
        name: 'Naughty Brownie Cup',
        desc: 'Fresh strawberries with fudgey brownie bites, drenched in creamy milk chocolate for the perfect mix of fudgy and fresh.',
        price: 'R75',
        tag: null,
        cutout: '/menu-cups/brownie.png',
        theme: THEME_BROWNIE,
      },
      {
        name: 'Dubai Chocolate Strawberries',
        desc: 'Our classic or brownie cup topped with our decadent kunafeh mixture of creamy pistachio cream and toasted kataifi pastry, drenched in creamy milk chocolate.',
        price: 'R95',
        tag: 'Best Seller',
        cutout: '/menu-cups/dubai.png',
        theme: THEME_DUBAI,
      },
      {
        name: 'New Naughty Cream Cup',
        desc: 'Fresh strawberries layered in a velvety sweetened cream, crowned with crunchy Lotus Biscoff crumbs.',
        price: 'R95',
        tag: 'New',
        cutout: '/menu-cups/cream.png',
        theme: THEME_CREAM,
      },
    ],
  },
  {
    id: 'iced-tea',
    label: 'Iced Tea',
    word: 'ICED TEA',
    icon: GlassWater,
    color: '#FF8C42',
    items: [
      {
        name: 'Strawberry Peach Iced Tea',
        desc: 'A smooth mix of sun-kissed strawberry and peach, served over ice. Simple, refreshing, and full of flavour.',
        price: 'R45',
        tag: 'New',
        photo: '/iced-tea-duo.jpg',
        theme: THEME_ICED_TEA,
      },
    ],
  },
  {
    id: 'platters',
    label: 'Combos',
    word: 'COMBOS',
    icon: Star,
    color: '#FF6BAD',
    items: [
      {
        name: 'Small Combo (20 pax)',
        desc: '20 chocolate strawberries + 20 classic cups, beautifully presented',
        price: 'R1 800',
        tag: 'Events',
        photo: '/carry-bag.jpg',
      },
      {
        name: 'Medium Combo (40 pax)',
        desc: '40 strawberries + 40 cups with mixed flavours, styled display',
        price: 'R3 200',
        tag: 'Events',
        photo: '/setup.jpg',
      },
      {
        name: 'Large Combo (80 pax)',
        desc: 'Full event service — 80 pax, custom flavours, styled setup, team on-site',
        price: 'From R5 500',
        tag: 'Premium',
        photo: '/market.jpg',
      },
    ],
  },
]

type CarouselItem = {
  name: string
  desc: string
  price: string
  tag: string | null
  cutout?: string
  photo?: string
  theme?: CupTheme
}

/**
 * Slot geometry for the 3-across product carousel (matches Menu.png):
 * a big upright cup front-centre, the neighbours smaller + tilted behind it,
 * any remaining items parked invisible behind the centre. x/y are relative
 * to the fixed-size slot wrapper so every cup travels the same path.
 */
const SLOT_POSE = {
  center: { x: '-50%', y: '0%', scale: 1, rotate: 0, opacity: 1, zIndex: 30 },
  left: { x: '-181%', y: '8%', scale: 0.76, rotate: -11, opacity: 1, zIndex: 20 },
  right: { x: '81%', y: '8%', scale: 0.76, rotate: 11, opacity: 1, zIndex: 20 },
  hidden: { x: '-50%', y: '4%', scale: 0.55, rotate: 0, opacity: 0, zIndex: 10 },
} as const

function slotFor(rel: number, count: number): keyof typeof SLOT_POSE {
  if (rel === 0) return 'center'
  if (rel === 1) return 'right'
  if (rel === count - 1) return 'left'
  return 'hidden'
}

function CupCarousel({
  items,
  word,
  onThemeChange,
}: {
  items: CarouselItem[]
  word: string
  onThemeChange: (theme: CupTheme) => void
}) {
  const prefersReducedMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const count = items.length
  const current = items[index]
  const go = (dir: number) => setIndex((i) => (i + dir + count) % count)

  useEffect(() => {
    onThemeChange(current.theme ?? THEME_CLASSIC)
  }, [current, onThemeChange])

  const spring = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 200, damping: 26 }

  return (
    <div style={{ containerType: 'inline-size' }}>
      {/* ── Stage ── */}
      <div className="relative" style={{ minHeight: 'clamp(300px, 34cqw, 520px)' }}>
        {/* Giant category word behind the cups — top half stays visible above the rims */}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none whitespace-nowrap"
          style={{
            fontFamily: "'Archivo Black', system-ui, sans-serif",
            fontSize: `${Math.min(16.5, 68 / word.length)}cqw`,
            letterSpacing: '-0.02em',
            color: '#D75A92',
            zIndex: 0,
          }}
        >
          {word}
        </span>

        {/* Ghost of the centre slot — ScrollCup's dock target. Invisible but
            measurable, so the flying cup always lands on the centre-cup
            position no matter which item the carousel is showing. */}
        <div
          aria-hidden="true"
          data-cup-anchor="menu"
          className="absolute left-1/2 bottom-0 -translate-x-1/2 pointer-events-none opacity-0"
          style={{ width: 'clamp(150px, 21cqw, 315px)', height: 'clamp(195px, 25.5cqw, 380px)' }}
        />

        {/* Cups */}
        {items.map((item, i) => {
          const slot = slotFor((i - index + count) % count, count)
          const pose = SLOT_POSE[slot]
          return (
            <motion.div
              key={item.name}
              className="absolute left-1/2 bottom-0 pointer-events-none"
              initial={false}
              animate={{ ...pose }}
              transition={spring}
              style={{ width: 'clamp(150px, 21cqw, 315px)', height: 'clamp(195px, 25.5cqw, 380px)' }}
            >
              {/* cup-menu-center: hidden until the flying cup docks here */}
              <div
                className={`w-full h-full flex items-end justify-center ${
                  slot === 'center' ? 'cup-menu-center' : ''
                }`}
              >
                {item.cutout ? (
                  <img
                    src={item.cutout}
                    alt={item.name}
                    className="max-h-full w-auto select-none"
                    style={{
                      filter:
                        'drop-shadow(0 10px 12px rgba(80,30,55,0.22)) drop-shadow(0 30px 46px rgba(112,45,80,0.18))',
                    }}
                    draggable={false}
                  />
                ) : (
                  <img
                    src={item.photo}
                    alt={item.name}
                    className="h-full w-full object-cover rounded-3xl select-none"
                    style={{ boxShadow: '0 24px 48px rgba(112,45,80,0.28)' }}
                    draggable={false}
                  />
                )}
              </div>
            </motion.div>
          )
        })}

        {/* Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous flavour"
              className="absolute left-0 top-[59%] -translate-y-1/2 z-40 w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#E8176D]/30 flex items-center justify-center text-[#E8176D] bg-white/30 backdrop-blur-[2px] hover:bg-[#E8176D] hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FFF0F6]"
            >
              <ArrowLeft size={18} strokeWidth={1.8} />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next flavour"
              className="absolute right-0 top-[59%] -translate-y-1/2 z-40 w-11 h-11 md:w-14 md:h-14 rounded-full border border-[#E8176D]/30 flex items-center justify-center text-[#E8176D] bg-white/30 backdrop-blur-[2px] hover:bg-[#E8176D] hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E8176D] focus:ring-offset-2 focus:ring-offset-[#FFF0F6]"
            >
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {/* ── Current item info ── */}
      <div className="relative z-10 text-center mt-4 min-h-[136px]" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {current.tag && (
              <span className="inline-block mb-2 px-3 py-1 rounded-full bg-[#E8176D]/10 border border-[#E8176D]/25 text-[#E8176D] text-[10px] font-bold tracking-[0.14em] uppercase">
                {current.tag}
              </span>
            )}
            <h3 className="font-display font-bold uppercase tracking-[0.16em] text-[#C2255C] text-lg md:text-xl">
              {current.name}
            </h3>
            <p className="mt-2 max-w-sm mx-auto text-[#7A3B5E]/75 text-sm md:text-[15px] leading-relaxed">
              {current.desc}
            </p>
            <p className="mt-3 font-display font-bold text-[#E8176D] text-xl md:text-2xl">{current.price}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Pagination + PDF ── */}
      <div className="mt-5 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3" aria-label={`Item ${index + 1} of ${count}`}>
          <span className="font-display font-bold text-[#E8176D] text-lg leading-none">
            0{index + 1}
          </span>
          <span className="relative block h-[2px] w-24 sm:w-40 bg-[#E8176D]/15 overflow-hidden rounded-full">
            <motion.span
              className="absolute inset-y-0 left-0 bg-[#E8176D]"
              animate={{ width: `${((index + 1) / count) * 100}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span className="text-xs font-bold text-[#B0698C] leading-none">0{count}</span>
        </div>

        <motion.a
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          href="/naughty-berry-menu.pdf"
          download="Naughty-Berry-Menu.pdf"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 border border-[#E8176D]/30 rounded-full text-[#E8176D] text-xs font-bold hover:bg-[#E8176D]/10 transition-all whitespace-nowrap"
          aria-label="Download menu PDF"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Download Menu (PDF)</span>
          <span className="sm:hidden">Menu PDF</span>
        </motion.a>
      </div>
    </div>
  )
}

export default function MenuPreview() {
  const prefersReducedMotion = useReducedMotion()
  const [activeCategory, setActiveCategory] = useState('cups')
  const [theme, setTheme] = useState<CupTheme>(THEME_CLASSIC)
  const activeCat = MENU_CATEGORIES.find((c) => c.id === activeCategory)!

  return (
    <section id="menu" className="scroll-mt-20 md:scroll-mt-16 py-14 lg:py-16 relative overflow-hidden bg-[#F6E3EB]">
      {/* Flavour backdrop — the reference card's colours and corner artwork.
          On switch, the new world wipes out from behind the cup in an
          expanding circle while the decor pops in staggered; the old layer
          holds beneath until it's covered. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={theme.id}
            className="absolute inset-0"
            initial={prefersReducedMotion ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 58%)' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { clipPath: 'circle(142% at 50% 58%)' }}
            exit={{ opacity: 0, transition: { duration: 0.25, delay: prefersReducedMotion ? 0 : 0.8 } }}
            transition={{ duration: 1.05, ease: [0.65, 0, 0.35, 1] }}
          >
            <div className="absolute inset-0" style={{ background: theme.base }} />

            {/* Corner artwork lifted from the flavour card */}
            {theme.decor &&
              DECOR_SLOTS.map((slot, i) => (
                <motion.img
                  key={slot.key}
                  src={theme.decor?.[slot.key]}
                  alt=""
                  className="absolute h-auto select-none"
                  initial={
                    prefersReducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.82, ...slot.from }
                  }
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{
                    delay: prefersReducedMotion ? 0 : 0.3 + i * 0.09,
                    duration: 0.65,
                    ease: [0.34, 1.4, 0.64, 1],
                  }}
                  style={{
                    ...slot.style,
                    WebkitMaskImage: slot.mask,
                    maskImage: slot.mask,
                  }}
                  draggable={false}
                />
              ))}

            {/* Soft glow seating the centre cup */}
            <div
              className="absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 'min(56vw, 820px)',
                height: 'min(56vw, 820px)',
                background: `radial-gradient(circle, ${theme.glow} 0%, transparent 62%)`,
                opacity: 0.55,
              }}
            />

            {/* Blend into the site pink at the section edges */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, #F6E3EB 0%, transparent 9%, transparent 91%, #F6E3EB 100%)',
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Warm the cache for every flavour's artwork so switches never pop */}
      <div className="hidden" aria-hidden="true">
        {MENU_CATEGORIES.flatMap((c) => c.items as CarouselItem[])
          .flatMap((i) => (i.theme?.decor ? Object.values(i.theme.decor) : []))
          .map((src) => (
            <img key={src} src={src} alt="" />
          ))}
      </div>

      {/* Subtle bg dots */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #E8176D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <h2 className="sr-only">The Menu — Naughty Berry Cape Town</h2>

        {/* Header — centred eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-center gap-3 mb-5"
        >
          <img
            src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
            alt=""
            aria-hidden="true"
            className="w-6 h-6 object-contain opacity-85"
            draggable={false}
          />
          <span className="w-6 h-[1px] bg-[#E8176D]/60" />
          <span className="text-[12px] font-bold tracking-[0.24em] uppercase text-[#E8176D]">
            The Menu
          </span>
          <span className="w-6 h-[1px] bg-[#E8176D]/60" />
        </motion.div>

        {/* Category Tabs — centred pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-2 flex-wrap mb-5 justify-center"
          role="tablist"
          aria-label="Menu categories"
        >
          {MENU_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <motion.button
                key={cat.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tab-panel-${cat.id}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveCategory(cat.id)}
                className="relative isolate overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF0F6]"
                style={{
                  background: 'rgba(232,23,109,0.08)',
                  color: isActive ? '#fff' : '#E8176D',
                  borderColor: isActive ? '#E8176D' : '#F9BDD4',
                  border: '1.5px solid',
                  boxShadow: isActive ? '0 0 20px rgba(232,23,109,0.27)' : 'none',
                }}
              >
                <Icon size={13} />
                {cat.label}
                {isActive && (
                  <motion.span
                    layoutId="active-menu-tab"
                    className="absolute inset-0 rounded-full -z-10 bg-[#E8176D]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Carousel — keyed by category so the index resets on switch */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            id={`tab-panel-${activeCategory}`}
            role="tabpanel"
            aria-label={`${activeCat.label} menu items`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <CupCarousel items={activeCat.items} word={activeCat.word} onThemeChange={setTheme} />
          </motion.div>
        </AnimatePresence>
      </div>
      <WaveDivider variant="menu" fill="#F6E3EB" height={56} />
    </section>
  )
}
