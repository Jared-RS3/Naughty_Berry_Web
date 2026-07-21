import { motion, useReducedMotion } from 'framer-motion'

type HeroProps = {
  isNaughtyMode: boolean
  loaded?: boolean
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

  return (
    <section
      id="top"
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ background: c.bg }}
      aria-label="Hero — Naughty Berry"
    >
      <div
        className="relative w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10"
        style={{ containerType: 'inline-size' }}
      >
        {/* Stage — height tracks the reference 1100×618 ratio via cqw */}
        <div
          className="relative flex items-center justify-center"
          style={{ minHeight: 'clamp(430px, 56.2cqw, 800px)' }}
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
              fontSize: 'max(34px, 8.5cqw)',
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
          <div className="absolute left-0 top-[54%] -translate-y-1/2 z-30">
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
          <div className="absolute right-0 top-[54%] -translate-y-1/2 z-30">
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
            style={{ transform: 'translate(-50%, -50%)', width: 'clamp(176px, 25cqw, 390px)' }}
          >
            {/* Ground shadow — seats the cup on the floor plane */}
            <motion.div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={
                prefersReducedMotion
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

            {/* Float wrapper — slow bob sells the depth */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* No entrance of its own — the intro overlay zooms the cup down
                  onto this exact spot and cross-fades into it, so anything more
                  than a plain fade here would fight the hand-off. */}
              <motion.img
                src="/naughty-hero-cup.png"
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
                  WebkitMaskImage: 'url(/naughty-hero-cup.png)',
                  maskImage: 'url(/naughty-hero-cup.png)',
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
      </div>
    </section>
  )
}
