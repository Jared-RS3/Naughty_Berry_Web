import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { EMAIL_MAX, normaliseEmail } from '../lib/email'
import { useMediaQuery } from '../hooks/useIsMobile'

/**
 * "You've got mail, babe." — the naughty-list sign-up.
 *
 * A small pink envelope arrives a beat after the intro has finished, so it
 * never stacks on top of the loader as a second interruption. Tapping it opens
 * the flap and the invitation slides out with the email field; a successful
 * sign-up stamps the card and folds it away.
 *
 * Where it lands:
 *  - Phones: in the hero, in the empty band between the "Next stop" pill and
 *    the headline. The bottom of a phone belongs to the cookie banner, which
 *    sat right over the envelope and hid the strawberry's whole entrance.
 *  - Larger screens: the bottom-right corner, lifted above the cookie banner
 *    (--nb-cookie-bar, published by CookieBanner) for as long as it is up.
 *
 * Sign-ups go to /api/subscribe (netlify/functions/subscribe.mts → Mailchimp).
 */

/** Flip to false to take the envelope off the site entirely. */
const SHOW_NEWSLETTER = true

/** How long after the intro overlay has gone before the envelope starts to
 *  peek in — a short beat so the hero lands first. */
const ARRIVE_MS = 1800

/** The strawberry's roll-in, bump, hop and pop, start to finish. */
const ARRIVE_S = 1.8

/** Someone who closed it isn't asked again for this long. */
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000

const STORAGE_KEY = 'nb-naughty-list'

type Stored = { subscribed: true } | { dismissedAt: number }

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Stored) : null
  } catch {
    return null
  }
}

function writeStored(value: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Private mode or blocked storage — it just asks again next visit.
  }
}

function shouldOffer(): boolean {
  const stored = readStored()
  if (!stored) return true
  if ('subscribed' in stored) return false
  return Date.now() - stored.dismissedAt > SNOOZE_MS
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const

type Stage = 'closed' | 'open' | 'done'

/** The hero's own mobile breakpoint — below `sm`, where the pill and headline
 *  stack and leave the band the envelope sits in. */
const HERO_BAND_QUERY = '(max-width: 639px)'

/** Height of the closed envelope pill, which is what has to fit the band. */
const LAUNCHER_H = 54

/**
 * Page-relative top for the envelope on phones: centred in the band between
 * the hero's pill (`data-mail-band="top"`) and whichever of the headline or
 * cup reaches highest (`data-mail-band="floor"`). Undefined until measured;
 * null when the hero isn't there to measure, which drops the envelope back to
 * its corner.
 */
function useHeroBandTop(enabled: boolean): number | null | undefined {
  const [top, setTop] = useState<number | null | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return
    const measure = () => {
      const pill = document.querySelector('[data-mail-band="top"]')
      const floors = [...document.querySelectorAll('[data-mail-band="floor"]')]
      if (!pill || !floors.length) return setTop(null)
      const bandTop = pill.getBoundingClientRect().bottom
      const bandBottom = Math.min(...floors.map((el) => el.getBoundingClientRect().top))
      const slack = Math.max(0, bandBottom - bandTop - LAUNCHER_H)
      setTop(Math.round(window.scrollY + bandTop + slack / 2))
    }
    measure()
    const ro = new ResizeObserver(measure)
    const hero = document.getElementById('top')
    if (hero) ro.observe(hero)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [enabled])

  return enabled ? top : undefined
}

export default function NewsletterEnvelope({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState<Stage>('closed')
  // With reduced motion there is no delivery — the envelope is simply there.
  const [arrived, setArrived] = useState(!!reduce)
  const handleArrived = useCallback(() => setArrived(true), [])
  const delivered = arrived || !!reduce

  // Measured only once it's about to show, by which point the hero's own
  // entrance has finished moving things.
  const phone = useMediaQuery(HERO_BAND_QUERY)
  const bandTop = useHeroBandTop(phone && visible)
  const inHero = typeof bandTop === 'number'
  // On a phone, hold off rendering until the band is measured, so the berry
  // doesn't start its roll in the corner and jump.
  const placed = !phone || bandTop !== undefined

  useEffect(() => {
    if (!SHOW_NEWSLETTER || !ready || !shouldOffer()) return
    const t = window.setTimeout(() => setVisible(true), ARRIVE_MS)
    return () => window.clearTimeout(t)
  }, [ready])

  const dismiss = () => {
    writeStored({ dismissedAt: Date.now() })
    setVisible(false)
  }

  const handleSubscribed = () => {
    writeStored({ subscribed: true })
    setStage('done')
    window.setTimeout(() => setVisible(false), 2600)
  }

  return (
    <AnimatePresence>
      {visible && placed && (
        <div
          key="naughty-list"
          // Phones: part of the page (it scrolls with the hero, like the mobile
          // nav). Closed, z-44 keeps it under the mobile menu's scrim (45) and
          // drawer (46) but over the flying cup (40). Open, it goes over the
          // cookie banner (300): on a short phone the card runs down behind
          // the banner, which would hide the very button it was opened for.
          className={
            inHero
              ? `pointer-events-none absolute inset-x-0 flex justify-center px-3 ${stage === 'closed' ? 'z-[44]' : 'z-[305]'}`
              : 'pointer-events-none fixed right-4 z-[90] transition-[bottom] duration-500 ease-out [--nb-corner-gap:1rem] sm:right-6 sm:[--nb-corner-gap:1.5rem]'
          }
          style={
            inHero
              ? { top: bandTop }
              : { bottom: 'calc(var(--nb-corner-gap) + var(--nb-cookie-bar, 0px))' }
          }
        >
        <motion.div
          exit={{ opacity: 0, y: reduce ? 0 : 40, transition: { duration: 0.35, ease: 'easeIn' } }}
          className="pointer-events-auto relative"
        >
          {/* The delivery: a chocolate-dipped strawberry rolls in with the
              mail, then pops into the envelope. Skipped for reduced motion. */}
          {!delivered && <BerryCourier onPop={handleArrived} />}
          {delivered && !reduce && <PopHearts />}
          <AnimatePresence mode="wait" initial={false}>
            {stage === 'closed' ? (
              <Launcher
                key="launcher"
                shown={delivered}
                reduce={!!reduce}
                onOpen={() => setStage('open')}
                onDismiss={dismiss}
              />
            ) : (
              <Invitation
                key="invitation"
                reduce={!!reduce}
                done={stage === 'done'}
                onClose={() => setStage('closed')}
                onDismiss={dismiss}
                onSubscribed={handleSubscribed}
              />
            )}
          </AnimatePresence>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ───────────────────────── The delivery ───────────────────────── */

const BERRY_SRC =
  '/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png'

/** Roll in, bump, squish, hop, pop — keyframe positions within ARRIVE_S. */
const BERRY_TIMES = [0, 0.5, 0.6, 0.7, 0.8, 0.88, 1]

/**
 * The strawberry rolls in from off the right edge of the screen, bumps to a
 * stop where the envelope will sit, squishes, does a little hop, then puffs up
 * and pops — and the envelope springs out of the pop. Three layers so each
 * motion pivots where it should: the roll around the berry's middle, the
 * squash from where it meets the ground, and the shadow stays on the ground.
 */
function BerryCourier({ onPop }: { onPop: () => void }) {
  useEffect(() => {
    // Hand over just as it starts to burst, so the envelope grows out of it.
    const t = window.setTimeout(onPop, ARRIVE_S * 0.9 * 1000)
    return () => window.clearTimeout(t)
  }, [onPop])

  return (
    <motion.span
      className="pointer-events-none absolute bottom-1 left-3 block h-[52px] w-[44px]"
      initial={{ x: 360 }}
      animate={{ x: [360, 0, -7, 0, 0, 0, 0] }}
      transition={{ duration: ARRIVE_S, times: BERRY_TIMES, ease: 'easeOut' }}
      aria-hidden="true"
    >
      <motion.span
        className="absolute -bottom-1 left-1/2 h-[6px] w-[34px] -translate-x-1/2 rounded-full bg-[#7A1B4A]/25 blur-[2px]"
        animate={{ opacity: [1, 1, 1, 0.5, 1, 1, 0], scaleX: [1, 1, 1.2, 0.6, 1.1, 1, 1.4] }}
        transition={{ duration: ARRIVE_S, times: BERRY_TIMES }}
      />
      <motion.span
        className="absolute inset-0 block"
        // Rolling left is anticlockwise, so it unwinds towards 0.
        animate={{ rotate: [620, 0, -12, 6, 0, 0, 0], y: [0, 0, 0, -18, 0, 0, 0] }}
        transition={{ duration: ARRIVE_S, times: BERRY_TIMES, ease: 'easeOut' }}
      >
        <motion.img
          src={BERRY_SRC}
          alt=""
          draggable={false}
          className="block h-full w-full object-contain drop-shadow-[0_4px_6px_rgba(122,27,74,0.25)]"
          style={{ transformOrigin: 'bottom center' }}
          animate={{
            scaleX: [1, 1, 1.24, 0.88, 1.08, 1, 1.6],
            scaleY: [1, 1, 0.78, 1.14, 0.93, 1, 1.6],
            opacity: [1, 1, 1, 1, 1, 1, 0],
          }}
          transition={{ duration: ARRIVE_S, times: BERRY_TIMES }}
        />
      </motion.span>
    </motion.span>
  )
}

/** The burst the envelope comes out of: hearts flung outwards, then gone. */
const HEARTS = [
  { x: -36, y: -40, size: 13, delay: 0, color: '#E8176D' },
  { x: -6, y: -62, size: 17, delay: 0.03, color: '#FF4D93' },
  { x: 26, y: -48, size: 12, delay: 0.06, color: '#C01057' },
  { x: 50, y: -20, size: 10, delay: 0.09, color: '#FF4D93' },
  { x: -52, y: -8, size: 10, delay: 0.05, color: '#FF8AB8' },
  { x: 38, y: 12, size: 9, delay: 0.1, color: '#FF8AB8' },
  { x: -26, y: 16, size: 8, delay: 0.08, color: '#E8176D' },
]

function PopHearts() {
  return (
    <span className="pointer-events-none absolute bottom-7 left-9 z-[1]" aria-hidden="true">
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="absolute block leading-none"
          style={{ fontSize: h.size, color: h.color }}
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.2 }}
          animate={{ opacity: [0, 1, 1, 0], x: h.x, y: h.y, scale: [0.2, 1.2, 1, 0.8], rotate: h.x / 2.5 }}
          transition={{ delay: h.delay, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          ♥
        </motion.span>
      ))}
    </span>
  )
}

/* ───────────────────────── Closed envelope ───────────────────────── */

function Launcher({
  shown,
  reduce,
  onOpen,
  onDismiss,
}: {
  /** False while the strawberry is still on its way — the pill keeps its
   *  size (so the berry knows where to stop) but isn't visible or tappable. */
  shown: boolean
  reduce: boolean
  onOpen: () => void
  onDismiss: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.3 }}
      animate={shown ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.3 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      // A jelly spring out of the pop, growing from where the berry was.
      transition={reduce ? { duration: 0.3 } : { type: 'spring', damping: 11, stiffness: 300, mass: 0.8 }}
      className={`flex items-end gap-2 ${shown ? '' : 'pointer-events-none'}`}
      style={{ transformOrigin: '30px 80%' }}
      aria-hidden={shown ? undefined : true}
    >
      <motion.button
        type="button"
        onClick={onOpen}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="nb-pill group flex items-center gap-3 py-2 pl-2 pr-4 text-left shadow-[0_14px_32px_rgba(192,16,87,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFDCEA]"
        aria-label="You've got mail — open the naughty list invitation"
      >
        {/* A little wiggle every few seconds, like it wants opening. */}
        <motion.span
          animate={reduce ? undefined : { rotate: [0, -8, 7, -5, 3, 0] }}
          transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, repeatDelay: 3.6, ease: 'easeInOut' }}
          className="block"
        >
          <EnvelopeIcon />
        </motion.span>
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C01057]">
            New mail
          </span>
          {/* One line, always: on a phone the pill sits in a band that is
              only just taller than it, and a wrapped line would overflow. */}
          <span
            className="whitespace-nowrap text-[13px] text-[#3B2116] min-[360px]:text-[14px]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            You’ve got mail, babe.
          </span>
        </span>
      </motion.button>

      <button
        type="button"
        onClick={onDismiss}
        className="nb-pill mb-1 flex h-7 w-7 items-center justify-center text-[#7A3B5E] shadow-[0_8px_18px_rgba(192,16,87,0.18)] transition-colors hover:text-[#E8176D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
        aria-label="Dismiss the invitation"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

function EnvelopeIcon() {
  return (
    <span className="relative block h-[38px] w-[52px]" aria-hidden="true">
      <span className="absolute inset-0 rounded-[7px] bg-[#C01057]" />
      <span
        className="absolute inset-0 rounded-[7px] bg-[#E8176D]"
        style={{ clipPath: 'polygon(0 0, 50% 58%, 100% 0, 100% 100%, 0 100%)' }}
      />
      <span
        className="absolute inset-x-0 top-0 h-[60%] bg-[#FF4D93]"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
      />
      <span className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 text-[12px] text-white">
        ♡
      </span>
    </span>
  )
}

/* ───────────────────────── Open invitation ───────────────────────── */

function Invitation({
  reduce,
  done,
  onClose,
  onDismiss,
  onSubscribed,
}: {
  reduce: boolean
  done: boolean
  onClose: () => void
  onDismiss: () => void
  onSubscribed: () => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [startedAt] = useState(() => Date.now())
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Focus the field once the card has slid out, not while it's still inside.
  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus({ preventScroll: true }), reduce ? 0 : 900)
    return () => window.clearTimeout(t)
  }, [reduce])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const value = normaliseEmail(email)
    if (!value) {
      setError('That email doesn’t look quite right.')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, company, startedAt }),
        signal: AbortSignal.timeout(12_000),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: unknown }
        // Only show a short plain-string message; React escapes it either way.
        const message = typeof body.error === 'string' && body.error.length <= 200 ? body.error : null
        throw new Error(message ?? 'We couldn’t add you just now. Please try again.')
      }
      onSubscribed()
    } catch (err) {
      setError(
        err instanceof Error && err.name !== 'TimeoutError'
          ? err.message
          : 'We couldn’t add you just now. Please try again.'
      )
      setSending(false)
    }
  }

  // Timings for the opening sequence: flap lifts, then the card slides out.
  const flapDelay = reduce ? 0 : 0.1
  const cardDelay = reduce ? 0 : 0.42

  return (
    <motion.div
      role="dialog"
      aria-labelledby="naughty-list-title"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24, transition: { duration: 0.25 } }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="relative w-[min(360px,calc(100vw-32px))]"
      style={{ perspective: 900 }}
    >
      {/* Clip box: the card hides below its bottom edge until it slides out. */}
      <div className="relative isolate overflow-hidden px-2 pt-2">
        {/* Envelope back */}
        <div className="absolute inset-x-2 bottom-0 z-0 h-[118px] rounded-[18px] bg-[#C01057]" />

        {/* Flap — in front of the card while shut, behind it once lifted. */}
        <motion.div
          initial={{ rotateX: 0, zIndex: 3 }}
          animate={{ rotateX: 180, zIndex: 0 }}
          transition={{
            rotateX: { delay: flapDelay, duration: reduce ? 0 : 0.5, ease: EASE_OUT },
            zIndex: { delay: flapDelay + (reduce ? 0 : 0.25), duration: 0 },
          }}
          className="absolute inset-x-2 bottom-[46px] h-[72px] bg-[#FF4D93]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transformOrigin: 'top center',
            backfaceVisibility: 'visible',
          }}
          aria-hidden="true"
        />

        {/* The invitation card */}
        <motion.div
          initial={{ y: reduce ? 0 : '100%' }}
          animate={{ y: 0 }}
          transition={{ delay: cardDelay, duration: reduce ? 0 : 0.7, ease: EASE_OUT }}
          className="nb-card relative z-[1] mx-3 mb-4 px-5 pb-[84px] pt-5 text-center"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-[#7A3B5E] transition-colors hover:bg-[#E8176D]/10 hover:text-[#E8176D] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8176D]"
            aria-label="Close the invitation"
          >
            <X size={16} />
          </button>

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C01057]">
            A little invitation ♡
          </p>
          <h2
            id="naughty-list-title"
            className="mt-2 text-[clamp(1.5rem,6vw,1.85rem)] uppercase leading-[1] tracking-[-0.02em] text-[#3B2116]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The naughty list.
          </h2>
          <p className="mx-auto mt-3 max-w-[270px] text-[13px] leading-[1.55] text-[#6B4155]">
            Secret drops, new treats and first dibs on where we’re popping up next. Consider this
            your personal invitation.
          </p>

          <form onSubmit={submit} noValidate className="mt-4 text-left">
            <label htmlFor="naughty-list-email" className="sr-only">
              Email address
            </label>
            <input
              ref={inputRef}
              id="naughty-list-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={EMAIL_MAX}
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              disabled={sending || done}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'naughty-list-error' : undefined}
              className="w-full rounded-full border border-[#E8176D]/20 bg-white px-5 py-3 text-[14px] text-[#3B2116] placeholder:text-[#7A3B5E]/50 focus:border-[#E8176D] focus:outline-none focus:ring-2 focus:ring-[#E8176D]/20"
            />
            {/* Honeypot — hidden from people, irresistible to bots. */}
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              maxLength={100}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden="true"
            />
            {error && (
              <p id="naughty-list-error" role="alert" className="mt-2 pl-4 text-[12px] font-semibold text-[#C01057]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={sending || done}
              className="mt-3 w-full rounded-full bg-[#E8176D] py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-white shadow-[0_12px_26px_rgba(232,23,109,0.3)] transition-colors hover:bg-[#C01057] disabled:opacity-70"
            >
              {sending ? 'Sealing it…' : 'I’m in, babe ♡'}
            </button>
          </form>

          <p className="mt-3 text-[11px] leading-[1.5] text-[#7A3B5E]/80">
            No spam. Just the sweet stuff x · Unsubscribe any time.{' '}
            <a href="/privacy-policy#newsletter" className="underline underline-offset-2 hover:text-[#E8176D]">
              Privacy
            </a>
          </p>

          <button
            type="button"
            onClick={onDismiss}
            className="mt-1 text-[11px] font-semibold text-[#7A3B5E]/70 underline-offset-2 hover:text-[#E8176D] hover:underline"
          >
            Not now
          </button>

          {/* The stamp */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, scale: reduce ? 1 : 2.2, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -10 }}
                transition={{ type: 'spring', damping: 14, stiffness: 260 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[22px] bg-[#FFF9ED]/80"
                role="status"
              >
                <span
                  className="rounded-[14px] border-[3px] border-[#E8176D] px-5 py-3 text-[20px] uppercase leading-[1.05] tracking-[-0.01em] text-[#E8176D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  You’re on
                  <br />
                  the list x
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Envelope front pocket — covers the bottom of the card. */}
        <div
          className="pointer-events-none absolute inset-x-2 bottom-0 z-[2] h-[118px] rounded-b-[18px] bg-[#E8176D]"
          style={{ clipPath: 'polygon(0 0, 50% 52%, 100% 0, 100% 100%, 0 100%)' }}
          aria-hidden="true"
        />
        <p
          className="pointer-events-none absolute inset-x-0 bottom-4 z-[2] text-center text-[10px] font-bold uppercase tracking-[0.24em] text-white/90"
          aria-hidden="true"
        >
          Naughty Berry presents
        </p>
      </div>
    </motion.div>
  )
}
