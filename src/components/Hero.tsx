import { motion, useReducedMotion } from 'framer-motion'
import { MapPin, ArrowRight, ChevronRight } from 'lucide-react'
import { usePopupSchedule } from '../hooks/usePopupSchedule'
import { currentSlot, isScheduleOff, mapsHref, stopHeadline } from '../lib/nextStop'
import { useIsMobile } from '../hooks/useIsMobile'

type HeroProps = {
  isNaughtyMode: boolean
  loaded?: boolean
}

/**
 * Mobile location pill on/off switch.
 *
 * Set to false to take the pill off phones. It is hidden in place rather than
 * unmounted, so its box stays in the hero column and every other hero element —
 * the cup, the layered headline, the sub-copy, the CTA — keeps the exact
 * position it has while the pill is on. Deleting the pill's JSX instead of
 * using this flag is what makes the composition jump.
 *
 * Desktop's pill is absolutely positioned and is not governed by this.
 */
const SHOW_MOBILE_LOCATION_PILL = true

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
  show = true,
}: {
  isNaughtyMode: boolean
  loaded: boolean
  /** Mobile floats it above the title; desktop keeps it along the bottom. */
  placement?: 'top' | 'bottom'
  /** Switches the pill off *without* removing its box. The mobile pill is the
   *  first thing in the hero column's flow, so dropping it from the tree pulls
   *  the cup, the sub-copy and the CTA up the screen by its height plus its
   *  margin. Hiding it instead of unmounting it means it keeps occupying
   *  exactly its own space and nothing else in the hero moves. Desktop is
   *  absolutely positioned and never had this problem either way. */
  show?: boolean
}) {
  const prefersReducedMotion = useReducedMotion()
  const { schedule, loading, error } = usePopupSchedule()
  // `currentSlot`, not `pickNext`: the pill answers "what does the sheet say
  // right now?", and the sheet is a standing weekly answer whose Date field goes
  // stale the moment that day passes. `pickNext` ignores everything behind us,
  // so a row dated yesterday blanked the pill down to "See where we are next"
  // even though its Day of Week was still the live answer — while the Off check
  // below, which already read `currentSlot`, was looking at that very row. One
  // source for both halves now, so they cannot disagree.
  const slot = error ? null : currentSlot(schedule)
  const headline = slot ? stopHeadline(slot) : null

  // "Off" in the Day of Week dropdown is the sheet saying the trailer isn't out.
  // There is no stop to point at, and the generic "See where we are next" would
  // still read as a live sighting — so the pill leaves the hero entirely rather
  // than sitting there with nothing to say. Asked of the whole schedule, not of
  // `next`: an Off row whose date has passed is no longer the "next stop", but
  // it is still the sheet's current answer. It only disappears once the schedule
  // has actually loaded, so the placeholder still holds the space while fetching.
  if (!loading && isScheduleOff(schedule)) return null

  // Tapping the pill hands the venue address straight to the phone's maps app —
  // the Google Maps universal link deep-links into the native app on both iOS
  // and Android when it's installed, and opens the web map when it isn't. With
  // no row or no address to hand over there is nothing to point at, so it falls
  // back to scrolling down to the full schedule.
  const venueHref = slot && headline && slot.location ? mapsHref(slot) : null

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

  /* `invisible`, not `hidden`/unmounted: visibility:hidden stops the pill
     painting and taking taps while leaving its box in the layout, so the slot
     it reserves is by definition the pill's own size — there is no hard-coded
     placeholder height to drift out of sync when the pill's padding or type
     size changes. */
  const hiddenClass = show ? '' : ' invisible pointer-events-none'

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
      transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`z-30 ${wrapperClass}${hiddenClass}`}
      aria-hidden={!show || undefined}
    >
      {/* The headline is a whole sentence now ("Next stop drops Monday"), so the
          old "NEXT STOP" eyebrow and its divider would just say it twice — and
          the eyebrow was desktop-only, which would have left mobile reading a
          bare venue name. */}
      <motion.a
        href={venueHref ?? '#next-stop'}
        {...(venueHref ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label={
          venueHref && slot ? `${headline} — get directions to ${slot.location}` : undefined
        }
        whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
        /* `relative` so the "click me" doodle can hang off the pill itself
           rather than off the centring wrapper, whose width the pill doesn't
           fill — that keeps the arrow pointing at the real right-hand edge
           whatever the venue name does to the pill's width. */
        className={`group relative flex max-w-full items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2.5 transition-colors sm:gap-4 sm:px-6 sm:py-3 sm:backdrop-blur-md ${shell}`}
      >
        <span className={`relative flex h-2 w-2 shrink-0 ${accent}`} aria-hidden="true">
          {!prefersReducedMotion && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          )}
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>

        {loading ? (
          <span className="h-3 w-32 shrink animate-pulse rounded-full bg-current opacity-20 sm:w-40" />
        ) : (
          <span className={`min-w-0 truncate text-[12px] font-semibold sm:text-sm ${strong}`}>
            {headline ?? 'See where we are next'}
          </span>
        )}

        <MapPin size={14} className={`shrink-0 ${accent}`} aria-hidden="true" />
        {/* A disclosure chevron reads as "there's more here" without the
            CTA weight of the hero's arrow-on-hover buttons — full opacity at
            rest so it's obvious on first glance (and on touch, which never
            triggers hover), with the same nudge-right cue on top for mouse users. */}
        <ChevronRight
          size={15}
          strokeWidth={2.75}
          className={`shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 ${accent}`}
          aria-hidden="true"
        />

        {/* Hand-drawn "click me" — the pill states its business plainly, so the
            only thing left to say is that it's pressable, and a doodle says that
            without another button competing with View Menu for the eye. It hangs
            below the pill rather than beside it so it costs the venue name no
            width, and tucks inside the pill's right edge so it can't be clipped
            by the hero's overflow on a narrow phone. Hidden while the schedule
            loads — nothing to click at yet. */}
        {!loading && (
          <motion.span
            aria-hidden="true"
            className={`pointer-events-none absolute right-1 top-full flex translate-y-0.5 items-end gap-0.5 ${accent}`}
            animate={prefersReducedMotion ? undefined : { y: [0, 2.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* <span
              className="-rotate-3 text-[11px] font-extrabold italic leading-none sm:text-[12px]"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              click me
            </span> */}
            {/* Curls up and to the right, landing on the chevron. */}
            {/* <svg
              width="26"
              height="20"
              viewBox="0 0 34 26"
              fill="none"
              className="mb-0.5 shrink-0"
            >
              <path
                d="M3 22C12 21 24 18 29 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <path
                d="M30.7 16.4L29 6L20.5 12.2"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
          </motion.span>
        )}
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
            fixed distance below the nav. Desktop's pill is the pinned one below.

            To switch it off, flip SHOW_MOBILE_LOCATION_PILL at the top of this
            file rather than deleting or commenting out this line: the pill is
            in the column's flow, so removing it from the tree would lift the
            cup, the sub-copy and the CTA by its height plus its margin. The
            flag hides it in place, and the rest of the hero stays put. */}
        <HeroLocationStrip
          isNaughtyMode={isNaughtyMode}
          loaded={loaded}
          placement="top"
          show={SHOW_MOBILE_LOCATION_PILL}
        />

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
              fontFamily: 'var(--font-display)',
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
              Fresh Strawberries.
              <br />
              Chocolate on Tap.
              <br />
              Made to Remember.
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
              // its container-query sizing, but on very wide monitors it is nudged
              // a little smaller so the button has room to breathe beneath it.
              width: isMobile ? 'clamp(128px, 26svh, 176px)' : 'clamp(176px, 23cqw, 360px)',
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
        className="absolute inset-x-0 z-30 hidden justify-center sm:flex"
        style={{
          // Keep the CTA clear of the cup in reduced-height browser chrome and on
          // large desktop monitors where the three-line headline composition sits
          // very close beneath the glass. The fixed offset used before was too
          // tight for those conditions.
          bottom: 'clamp(3.5rem, 9svh, 7.5rem)',
        }}
      >
        {menuCta}
      </motion.div>

      {/* Desktop keeps the live-location pill pinned along the hero. The mobile
          pill now lives in the column above (in flow). */}
      <HeroLocationStrip isNaughtyMode={isNaughtyMode} loaded={loaded} placement="bottom" />
    </section>
  )
}
