import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import WaveDivider from './WaveDivider'
import { Download, Star, Flame, Heart, Zap, Coffee } from 'lucide-react'

export const MENU_CATEGORIES = [
  {
    id: 'cups',
    label: 'Cups',
    icon: Coffee,
    color: '#E8143C',
    items: [
      {
        name: 'Classic Cup',
        desc: 'Fresh strawberries, silky chocolate drizzle, premium Chantilly cream',
        price: 'R65',
        tag: 'Fan Favourite',
      },
      {
        name: 'Brownie Cup',
        desc: 'Fudgy brownie base, fresh strawberries, chocolate drizzle, cream',
        price: 'R75',
        tag: 'Best Seller',
      },
      {
        name: 'Dark Chocolate Cup',
        desc: '70% dark chocolate drizzle, fresh strawberries, whipped cream',
        price: 'R70',
        tag: null,
      },
      {
        name: 'White Chocolate Cup',
        desc: 'White chocolate drizzle, strawberries, crushed biscuit crumble',
        price: 'R70',
        tag: null,
      },
    ],
  },
  {
    id: 'strawberries',
    label: 'Choc Strawberries',
    icon: Heart,
    color: '#FF6BAD',
    items: [
      {
        name: 'Milk Chocolate Dipped',
        desc: 'Whole strawberries hand-dipped in premium Belgian milk chocolate',
        price: 'R55',
        tag: 'Crowd Pleaser',
      },
      {
        name: 'Dark Chocolate Dipped',
        desc: '70% dark Belgian chocolate dipped whole strawberries',
        price: 'R55',
        tag: null,
      },
      {
        name: 'White Chocolate Dipped',
        desc: 'White chocolate coated with freeze-dried strawberry dust',
        price: 'R60',
        tag: null,
      },
      {
        name: 'Dubai Chocolate Strawberries',
        desc: 'Our viral special — Dubai pistachio chocolate with kunafa crunch',
        price: 'R95',
        tag: '🔥 Viral',
      },
    ],
  },
  {
    id: 'specials',
    label: 'Specials',
    icon: Flame,
    color: '#FF3D5A',
    items: [
      {
        name: 'Dubai Chocolate Box (6)',
        desc: 'Six Dubai chocolate strawberries presented in a luxury gift box',
        price: 'R160',
        tag: 'Limited',
      },
      {
        name: 'Mixed Box (12)',
        desc: 'Your choice of 12 chocolate-dipped strawberries',
        price: 'R250',
        tag: 'Popular',
      },
      {
        name: 'Seasonal Special',
        desc: 'Chef\'s weekly creation — follow @naughtyberrycpt for the drop',
        price: 'TBC',
        tag: 'New Weekly',
      },
    ],
  },
  {
    id: 'toppings',
    label: 'Add-ons',
    icon: Zap,
    color: '#9B59B6',
    items: [
      { name: 'Extra Drizzle', desc: 'Milk / dark / white chocolate boost', price: 'R10', tag: null },
      { name: 'Crushed Oreo', desc: 'Crumbled Oreo topping on any cup', price: 'R10', tag: null },
      { name: 'Caramel Sauce', desc: 'Salted caramel drizzle', price: 'R10', tag: null },
      { name: 'Sprinkles', desc: 'Festive rainbow or chocolate sprinkles', price: 'R5', tag: null },
    ],
  },
  {
    id: 'platters',
    label: 'Event Platters',
    icon: Star,
    color: '#FF6BAD',
    items: [
      {
        name: 'Small Platter (20 pax)',
        desc: '20 chocolate strawberries + 20 classic cups, beautifully presented',
        price: 'R1 800',
        tag: 'Events',
      },
      {
        name: 'Medium Platter (40 pax)',
        desc: '40 strawberries + 40 cups with mixed flavours, styled display',
        price: 'R3 200',
        tag: 'Events',
      },
      {
        name: 'Large Platter (80 pax)',
        desc: 'Full event service — 80 pax, custom flavours, styled setup, team on-site',
        price: 'From R5 500',
        tag: 'Premium',
      },
    ],
  },
]

const CONTAINER_VARIANTS: import('framer-motion').Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const CARD_VARIANTS: import('framer-motion').Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 24, stiffness: 200 } },
}

interface MenuCardProps {
  name: string
  desc: string
  price: string
  tag: string | null
  accent: string
  index: number
}

function MenuItemCard({ name, desc, price, tag, accent, index }: MenuCardProps) {
  const [hovered, setHovered] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const smoothRotateX = useSpring(rotateX, { stiffness: 230, damping: 18, mass: 0.35 })
  const smoothRotateY = useSpring(rotateY, { stiffness: 230, damping: 18, mass: 0.35 })

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const xPct = x / rect.width
    const yPct = y / rect.height
    rotateY.set((xPct - 0.5) * 8)
    rotateX.set((0.5 - yPct) * 8)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      variants={CARD_VARIANTS}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={() => {
        setHovered(false)
        resetTilt()
      }}
      whileHover={prefersReducedMotion ? undefined : { y: -8 }}
      className="relative pink-card rounded-2xl p-5 transition-all duration-300 overflow-hidden group bg-white"
      style={{
        rotateX: prefersReducedMotion ? 0 : smoothRotateX,
        rotateY: prefersReducedMotion ? 0 : smoothRotateY,
        transformPerspective: 900,
        transformStyle: 'preserve-3d',
        boxShadow: hovered ? `0 20px 36px ${accent}30, 0 8px 18px rgba(0,0,0,0.06)` : '0 2px 12px rgba(0,0,0,0.06)',
        borderColor: hovered ? `${accent}50` : '#F9BDD4',
      }}
    >
      {/* Hover glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${accent}12, transparent 60%)` }}
      />

      <motion.div
        animate={{ opacity: hovered ? 1 : 0.45 }}
        className="absolute -inset-[1px] pointer-events-none motion-aurora"
        style={{ borderRadius: 'inherit' }}
      />

      {/* Number */}
      <span
        className="absolute top-4 right-5 text-[10px] font-bold tracking-widest opacity-20 font-display"
        style={{ color: accent }}
        aria-hidden="true"
      >
        0{index + 1}
      </span>

      <div className="relative z-10">
        {tag && (
          <span
            className="inline-block px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] uppercase rounded-full mb-2"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
          >
            {tag}
          </span>
        )}

        <h3 className="font-head font-bold text-lg text-[#2D1225] mb-1 leading-snug">{name}</h3>
        <p className="text-[#7A3B5E]/70 text-sm leading-relaxed mb-4">{desc}</p>

        <div className="flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: accent }}>{price}</span>
          {/* <motion.div
            animate={{ scaleX: hovered ? 1 : 0.3, opacity: hovered ? 1 : 0 }}
            className="text-[10px] uppercase tracking-widest font-bold text-[#E8176D]"
          >
            Add to order →
          </motion.div> */}
        </div>
      </div>
    </motion.div>
  )
}

export default function MenuPreview() {
  const [activeCategory, setActiveCategory] = useState('cups')
  const activeCat = MENU_CATEGORIES.find((c) => c.id === activeCategory)!

  return (
    <section id="menu" className="py-24 lg:py-32 relative overflow-hidden bg-[#FFF0F6]">
      {/* Subtle bg dots */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #E8176D 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center lg:items-start mb-14"
        >
          <div className="flex items-center gap-2 mb-4">
            <img
              src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
              alt=""
              aria-hidden="true"
              className="w-6 h-6 object-contain opacity-85"
              draggable={false}
            />
            <span className="w-8 h-[1px] bg-[#E8176D]" />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#E8176D]">
              The Menu
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#2D1225] leading-tight text-center md:text-left">
              Pure Naughty. <br />
              <span className="text-shimmer">Seriously Good.</span>
            </h2>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="/naughty-berry-menu.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 border-2 border-[#E8176D]/40 rounded-full text-[#E8176D] text-sm font-bold hover:bg-[#E8176D]/10 transition-all self-start"
              aria-label="Download menu PDF"
            >
              <Download size={14} />
              Download Menu (PDF)
            </motion.a>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-2 flex-wrap mb-10"
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
                className="relative isolate overflow-hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#FFF0F6]"
                style={{
                  background: 'rgba(232,23,109,0.08)',
                  color: isActive ? '#fff' : '#7A3B5E',
                  borderColor: isActive ? cat.color : '#F9BDD4',
                  border: '1.5px solid',
                  boxShadow: isActive ? `0 0 20px ${cat.color}44` : 'none',
                }}
              >
                <Icon size={13} />
                {cat.label}
                {isActive && (
                  <motion.span
                    layoutId="active-menu-tab"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: `${cat.color}` }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </motion.div>

        {/* Menu Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            id={`tab-panel-${activeCategory}`}
            role="tabpanel"
            aria-label={`${activeCat.label} menu items`}
            variants={CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.22 } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {activeCat.items.map((item, i) => (
              <MenuItemCard
                key={item.name}
                {...item}
                accent={activeCat.color}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 text-center"
        >
          <p className="text-[#7A3B5E]/60 text-sm mb-4">
            Want to order for pickup? Message us on Instagram or email us.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="https://www.instagram.com/naughtyberrycpt"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full gradient-berry text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(232,23,109,0.4)] transition-all inline-flex items-center gap-2"
            >
              <img
                src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
                alt=""
                aria-hidden="true"
                className="w-4 h-4 object-contain"
                draggable={false}
              />
              Order via Instagram
            </a>
            <a
              href="mailto:naughtyberryinfo@gmail.com"
              className="px-6 py-3 rounded-full border-2 border-[#E8176D]/30 text-[#E8176D] text-sm font-bold hover:bg-[#E8176D]/10 transition-all"
            >
              naughtyberryinfo@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
      <WaveDivider variant="menu" fill="#FFF0F6" height={56} />
    </section>
  )
}
