import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, ArrowRight } from 'lucide-react'
import { usePopupSchedule } from '../hooks/usePopupSchedule'
import { mapsHref, pickNext, stopHeadline } from '../lib/nextStop'
import { useIsMobile } from '../hooks/useIsMobile'

type HeroProps = {
  isNaughtyMode: boolean
  loaded?: boolean
}

/**
 * Live location strip along the bottom of the hero. The full NextStop panel is
 * one scroll away, but "where are you right now?" is the first thing a visitor
 * wants from a roaming trailer — so it gets answered inside the first screen.
 * The pill keeps its footprint in every state (loading, nothing booked) so the
 * hero composition never shifts underneath the cup.
 */
function HeroLocationStrip({
  isNaughtyMode,
  loaded,
  placement = 'bottom',
}: {
  isNaughtyMode: boolean
  loaded: boolean
  /** Mobile floats it above the title; desktop keeps it along the bottom. */
  placement?: 'top' | 'bottom'
}) {
  const prefersReducedMotion = useReducedMotion()
  const { schedule, loading, error } = usePopupSchedule()
  const next = error ? null : pickNext(schedule)
  const headline = next ? stopHeadline(next.slot) : null

  // Tapping the pill hands the venue address straight to the phone's maps app —
  // the Google Maps universal link deep-links into the native app on both iOS
  // and Android when it's installed, and opens the web map when it isn't. With
  // no row or no address to hand over there is nothing to point at, so it falls
  // back to scrolling down to the full schedule.
  const venueHref = next && headline && next.slot.location ? mapsHref(next.slot) : null

  const shell = isNaughtyMode
    ? 'border-white/20 bg-white/10 text-[#FFD6EC] hover:bg-white/16'
    : 'border-[#E8176D]/15 bg-white/70 text-[#7A3B5E] hover:bg-white'
  const accent = isNaughtyMode ? 'text-[#FF4DAE]' : 'text-[#E8176D]'
  const strong = isNaughtyMode ? 'text-white' : 'text-[#3B2116]'

  // Mobile ('top') now rides in the document flow at the head of the hero
  // column — with the pill pinned and the rest of the hero centred, the nav→pill
  // and pill→product gaps drifted with every screen height; in flow they're
  // fixed. A small bottom margin sets the gap down to the product. Desktop
  // ('bottom') stays pinned across the hero, unchanged.
  const wrapperClass =
    placement === 'top'
      ? 'flex justify-center mb-[clamp(12px,3svh,24px)] sm:hidden'
      : 'absolute inset-x-4 top-34 justify-center hidden sm:flex'

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
      transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`z-30 ${wrapperClass}`}
    >
      {/* The headline is a whole sentence now ("Next stop drops Monday"), so the
          old "NEXT STOP" eyebrow and its divider would just say it twice — and
          the eyebrow was desktop-only, which would have left mobile reading a
          bare venue name. */}
      <motion.a
        href={venueHref ?? '#next-stop'}
        {...(venueHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label={
          venueHref && next
            ? `${headline} — open ${next.slot.location} in maps`
            : undefined
        }
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        className={`flex max-w-full items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 transition-colors sm:gap-4 sm:px-6 sm:py-3 sm:backdrop-blur-md ${shell}`}
      >
        <span className={`relative flex h-2 w-2 shrink-0 ${accent}`} aria-hidden="true">
          {!prefersReducedMotion && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>

        {loading ? (
          <span className="h-3 w-40 animate-pulse rounded-full bg-current opacity-20" />
        ) : (
          <span className={`min-w-0 truncate text-[12px] font-semibold sm:text-sm ${strong}`}>
            {headline ?? 'See where we are next'}
          </span>
        )}

        <MapPin size={14} className={`shrink-0 ${accent}`} aria-hidden="true" />
      </motion.a>
    </motion.div>
  )
}

/**
 * Hero — editorial layered-type layout.
 * Giant STRAWBERRY / STRAWBERRY / CHOCOLATE / CHOCOLATE headline stacked behind
 * a centred cup cut-out, flanked by two micro-copy blocks. Matches New_Hero.png.
 *
 * The whole composition is sized in container-query units (`cqw`) off the padded
 * stage, so it scales as one piece from mobile to desktop while keeping the exact
 * proportions of the reference. Positioning wrappers are kept separate from the
 * Framer-Motion elements so entrance transforms never fight the layout transforms.
 */
export default function Hero({ isNaughtyMode, loaded = true }: HeroProps) {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const c = isNaughtyMode
    ? {
        bg: 'radial-gradient(ellipse at 50% 46%, #34103A 0%, #1B0823 60%, #120019 100%)',
        pink: '#FF4DAE',
        brown: '#C98A63',
        copy: 'rgba(255, 214, 236, 0.82)',
      }
    : {
        bg: '#FFDCEA',
        pink: '#E8176D',
        brown: '#3B2116',
        copy: '#7A3B5E',
      }

  const rise = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] as const },
    }),
  }

  const menuCta = (
    <a
      href="#menu"
      className={`group inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors ${
        isNaughtyMode
          ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78] hover:shadow-[0_0_28px_rgba(255,45,156,0.45)]'
          : 'bg-[#E8176D] hover:bg-[#C01057] shadow-[0_14px_32px_rgba(232,23,109,0.32)]'
      }`}
      aria-label="View the menu"
    >
      View Menu
      <ArrowRight
        size={15}
        className="transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  )

  return (
    <section
      id="top"
      /* Mobile: top-anchored column (items-start) so the nav → pill → product →
         copy → CTA rhythm is fixed on every height. pt = the 64px nav + a gap
         that eases from 60px (tall) down to 28px (short), so short screens spend
         that space on the product and CTA instead of an air gap. pb clears the
         iPhone toolbar via the safe-area inset. min-h-svh fills the small
         viewport so nothing hides behind the browser chrome. Every vertical
         value below is svh-aware for the same reason, which keeps the whole
         composition — including the CTA — on screen down to ~480px tall.
         Desktop resets to the centred layout. */
      className="relative min-h-svh w-full overflow-hidden flex items-start justify-center pt-[calc(64px_+_clamp(28px,8svh,60px))] pb-[calc(16px_+_env(safe-area-inset-bottom))] sm:items-center sm:pt-0 sm:pb-0"
      style={{ background: c.bg }}
      aria-label="Hero — Naughty Berry"
    >
      <div
        className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10"
        style={{ containerType: 'inline-size' }}
      >
        {/* Mobile announcement pill — first in the hero column so it sits a
            fixed distance below the nav. Desktop's pill is the pinned one below. */}
        <HeroLocationStrip isNaughtyMode={isNaughtyMode} loaded={loaded} placement="top" />

        {/* Stage — desktop height tracks the reference 1100×618 ratio via cqw;
            mobile is height-aware (svh) and bounded so it hugs the cup instead
            of reserving a fixed 430px that left a dead gap beneath it. */}
        <div
          className="relative flex items-center justify-center"
          style={{
            minHeight: isMobile
              ? 'clamp(176px, 38svh, 272px)'
              : 'clamp(430px, 56.2cqw, 800px)',
          }}
        >
          {/* ── Layered headline ── */}
          <motion.div
            initial="hidden"
            animate={loaded ? 'visible' : 'hidden'}
            className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center select-none pointer-events-none"
            style={{
              fontFamily: "'Archivo Black', system-ui, sans-serif",
              lineHeight: 0.9,
              letterSpacing: '-0.012em',
              // On mobile the words read big and bold behind the cup but leave
              // a margin down each side and never overflow a 320px screen; the
              // clamp trims them a touch so the cup stays the clear focal point.
              // Desktop scaling is unchanged.
              fontSize: isMobile ? 'clamp(30px, 11.6cqw, 46px)' : 'max(34px, 8.5cqw)',
            }}
            aria-hidden="true"
          >
            {[
              { t: 'STRAWBERRY', col: c.pink },
              { t: 'STRAWBERRY', col: c.pink },
              { t: 'CHOCOLATE', col: c.brown },
              { t: 'CHOCOLATE', col: c.brown },
            ].map((row, i) => (
              <motion.span key={i} custom={i} variants={rise} className="block" style={{ color: row.col }}>
                {row.t}
              </motion.span>
            ))}
          </motion.div>

          {/* Accessible headline for SEO / screen readers */}
          <h1 className="sr-only">Strawberry Strawberry Chocolate Chocolate — Naughty Berry Cape Town</h1>

          {/* ── Left micro-copy ── */}
          <div className="hidden sm:block absolute left-0 top-[54%] -translate-y-1/2 z-30">
            <motion.p
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -14 }}
              animate={loaded ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="text-left font-semibold"
              style={{ color: c.copy, fontSize: 'clamp(11px, 1.42cqw, 19px)', lineHeight: 1.42 }}
            >
              Hand-dipped.
              <br />
              Fresh strawberries.
              <br />
              Made to delight.
            </motion.p>
          </div>

          {/* ── Right micro-copy ── */}
          <div className="hidden sm:block absolute right-0 top-[54%] -translate-y-1/2 z-30">
            <motion.p
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 14 }}
              animate={loaded ? { opacity: 1, x: 0 } : { opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-left font-semibold"
              style={{ color: c.copy, fontSize: 'clamp(11px, 1.42cqw, 19px)', lineHeight: 1.42 }}
            >
              Pop-ups, markets
              <br />
              &amp; private events
              <br />
              across Cape Town.
            </motion.p>
          </div>

          {/* ── Cup cut-out (positioning wrapper is separate from motion) ──
              data-cup-anchor: ScrollCup's first stop; cup-static hides the
              static cup while the flying cup renders in its place. ── */}
          <div
            data-cup-anchor="hero"
            className="cup-static absolute left-1/2 top-[56%] z-20 pointer-events-none"
            style={{
              transform: 'translate(-50%, -50%)',
              // Mobile: full 176px on normal/tall phones, easing down on short
              // screens (via svh) so the whole composition and the CTA stay on
              // screen without the cup ever overflowing the stage. Desktop keeps
              // its container-query sizing.
              width: isMobile ? 'clamp(128px, 26svh, 176px)' : 'clamp(176px, 25cqw, 390px)',
            }}
          >
            {/* Ground shadow — seats the cup on the floor plane */}
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={
                prefersReducedMotion || isMobile
                  ? { opacity: 1 }
                  : { opacity: 1, scaleX: [1, 0.92, 1], transition: { opacity: { duration: 0.9, delay: 0.3 }, scaleX: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } } }
              }
              style={{
                bottom: '-3.5%',
                width: '74%',
                height: '7%',
                borderRadius: '50%',
                filter: 'blur(7px)',
                background: isNaughtyMode
                  ? 'radial-gradient(ellipse at center, rgba(255,45,156,0.45) 0%, rgba(255,45,156,0.18) 45%, transparent 72%)'
                  : 'radial-gradient(ellipse at center, rgba(90,32,58,0.38) 0%, rgba(90,32,58,0.14) 45%, transparent 72%)',
              }}
            />

            {/* Float wrapper — slow bob sells the depth. Off on mobile: the
                flyer replaces this cup there, so the bob would run forever on a
                hidden element and cost main-thread rAF during every scroll. */}
            <motion.div
              animate={prefersReducedMotion || isMobile ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* No entrance of its own — the intro overlay zooms the cup down
                  onto this exact spot and cross-fades into it, so anything more
                  than a plain fade here would fight the hand-off. */}
              <motion.img
                src="/naughty-hero-cup.webp"
                alt="Naughty Berry cup — chocolate-dipped strawberries"
                fetchPriority="high"
                initial={{ opacity: 0 }}
                animate={{ opacity: loaded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'linear' }}
                className="cup-img w-full h-auto select-none"
                style={
                  {
                    '--cup-shadow': isNaughtyMode
                      ? 'drop-shadow(0 10px 14px rgba(0,0,0,0.42)) drop-shadow(0 32px 56px rgba(255,45,156,0.34))'
                      : 'drop-shadow(0 10px 14px rgba(80,30,55,0.30)) drop-shadow(0 30px 52px rgba(112,45,80,0.22))',
                  } as React.CSSProperties
                }
                draggable={false}
              />

              {/* Glass sheen — clipped to the cup silhouette via mask */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  WebkitMaskImage: 'url(/naughty-hero-cup.webp)',
                  maskImage: 'url(/naughty-hero-cup.webp)',
                  WebkitMaskSize: '100% 100%',
                  maskSize: '100% 100%',
                  background:
                    'linear-gradient(112deg, transparent 40%, rgba(255,255,255,0.30) 49%, rgba(255,255,255,0.10) 55%, transparent 63%)',
                  mixBlendMode: 'screen',
                }}
              />
            </motion.div>
          </div>
        </div>

        {/* ── Mobile subtitle — the flanking blocks overlap the cup below sm, so
            one centred line stands in for them and lets the big title lead ── */}
        <motion.p
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
          animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="sm:hidden mx-auto mt-[clamp(10px,2.5svh,20px)] max-w-[clamp(232px,80vw,300px)] text-balance text-center font-semibold"
          style={{ color: c.copy, fontSize: 'clamp(13px, 3.7vw, 15px)', lineHeight: 1.55 }}
        >
          Fresh strawberries, Chocolate on Tap
          <br />
          Made to Remember.
        </motion.p>

        {/* Mobile CTA — in flow, centred under the composition. Its own button
            (not the shared desktop one) so it can carry the 56px touch height,
            capped width and press feedback without touching desktop. */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
          animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-[clamp(14px,3svh,28px)] flex justify-center sm:hidden"
        >
          <motion.a
            href="#menu"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
            className={`group inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full px-9 text-[13px] font-bold uppercase tracking-[0.18em] text-white transition-colors ${
              isNaughtyMode
                ? 'bg-gradient-to-r from-[#FF2D9C] to-[#7A1B78]'
                : 'bg-[#E8176D] shadow-[0_14px_32px_rgba(232,23,109,0.32)]'
            }`}
            aria-label="View the menu"
          >
            View Menu
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-active:translate-x-1"
              aria-hidden="true"
            />
          </motion.a>
        </motion.div>
      </div>

      {/* Desktop CTA — floated just above the location pill so it doesn't fight
          the full-bleed composition; on mobile the in-flow button above is used. */}
      <motion.div
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 14 }}
        animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 bottom-24 z-30 hidden justify-center sm:flex"
      >
        {menuCta}
      </motion.div>

      {/* Desktop keeps the live-location pill pinned along the hero. The mobile
          pill now lives in the column above (in flow). */}
      <HeroLocationStrip isNaughtyMode={isNaughtyMode} loaded={loaded} placement="bottom" />
    </section>
  )
}
