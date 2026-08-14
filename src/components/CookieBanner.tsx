import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import {
  clearConsent,
  hasAnalyticsConsent,
  readConsent,
  setConsent,
  subscribeToConsent,
} from '../lib/consent'
import { isAnalyticsConfigured } from '../lib/analytics'
import { COOKIE_SETTINGS_EVENT, cookieSettingsAvailable, openCookieSettings } from '../lib/cookieSettings'

/**
 * The consent gate for Google Analytics.
 *
 * ── What makes this a real choice rather than a dark pattern ────────────────
 * POPIA s1 requires consent to be voluntary, specific and informed, and s11(2)
 * lets it be withdrawn at any time. In practice that means:
 *
 *   • Nothing loads before a decision. Analytics is not running while the
 *     banner is on screen — see src/lib/analytics.ts. Dismissing the banner
 *     without answering is not consent, so there is no ✕ that means "yes".
 *   • Declining is exactly as easy as accepting: same row, same size, same
 *     weight, one click each. No greyed-out "reject", no second screen.
 *   • The toggle in Preferences starts OFF. A pre-ticked box is not consent.
 *   • It is reversible from any page, forever, through the "Cookie settings"
 *     link in the footer — which is why this component owns an event-driven
 *     `openCookieSettings()` rather than only appearing once.
 *   • The banner does not block the page. Nobody is held hostage over a
 *     dessert menu, and consent extracted by making the site unusable is not
 *     voluntary anyway.
 *
 * ── When it appears ─────────────────────────────────────────────────────────
 * Only when there is genuinely something to ask about: if no GA4 measurement ID
 * is configured for the deploy, nothing renders at all. A banner for cookies
 * that do not exist is the theatre /cookie-policy used to complain about.
 *
 * And late. See SETTLE_MS.
 *
 * ── Why the copy is this short ──────────────────────────────────────────────
 * This is the first layer of a layered notice, which is the shape regulators
 * actually expect: enough to make the decision on the spot — who (Google
 * Analytics), what (cookies on your device), and that it is off unless you say
 * yes — with the full detail one click away in Preferences and the Cookie
 * Policy. A visitor who reads nothing still cannot be tracked without an
 * affirmative click, and a paragraph nobody finishes reading informs nobody.
 */

/**
 * How long to wait after the page is ready before the bar slides in.
 *
 * The home page opens on a film, and a consent bar sliding over it while the
 * hero is still arriving reads as a popup ad on someone's own website. Waiting
 * costs nothing in either direction: analytics cannot load before a decision
 * regardless (src/lib/analytics.ts), and nothing is being placed on the
 * visitor's device in the meantime — so the only thing the delay changes is
 * that the question is asked once the visitor has actually landed.
 */
const SETTLE_MS = 3000

/* ────────────────────────── Component ────────────────────────── */

export default function CookieBanner({ ready = true }: { ready?: boolean }) {
  const configured = isAnalyticsConfigured()

  // Read once on mount: whether the visitor has already decided.
  const [undecided, setUndecided] = useState(() => configured && readConsent() === null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(() => hasAnalyticsConsent())
  const [saved, setSaved] = useState(false)
  /** Flips once SETTLE_MS has passed since the page was ready. */
  const [settled, setSettled] = useState(false)

  const panelRef = useRef<HTMLDivElement | null>(null)
  const savedTimer = useRef<number | null>(null)

  /* The footer link, from any route. */
  useEffect(() => {
    if (!configured) return

    const onOpen = () => {
      // Reflect the current decision, so the panel opens showing the truth
      // rather than whatever it was last left on.
      setAnalyticsOn(hasAnalyticsConsent())
      setSaved(false)
      setPanelOpen(true)
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpen)
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpen)
  }, [configured])

  /* A decision made in another tab should not leave this one showing the bar. */
  useEffect(() => subscribeToConsent(() => setUndecided(readConsent() === null)), [])

  /* The settle delay. Starts counting only once there is actually a question to
   * ask and the page is ready to be looked at, so the timer cannot burn down
   * behind an intro film and have the bar appear the instant it lifts. */
  useEffect(() => {
    if (!configured || !undecided || !ready) return
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS)
    return () => window.clearTimeout(t)
  }, [configured, undecided, ready])

  useEffect(() => {
    return () => {
      if (savedTimer.current) window.clearTimeout(savedTimer.current)
    }
  }, [])

  /* Escape closes the panel — but only the panel. If the visitor has not
   * decided yet, the bar stays: closing a dialog is not answering a question. */
  useEffect(() => {
    if (!panelOpen) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [panelOpen])

  /* Send focus into the panel when it opens, so a keyboard or screen-reader
   * user is not left behind on the page underneath. */
  useEffect(() => {
    if (!panelOpen) return
    panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [panelOpen])

  const decide = useCallback((granted: boolean) => {
    setConsent(granted ? 'granted' : 'denied')
    setAnalyticsOn(granted)
    setUndecided(false)
  }, [])

  const acceptAll = useCallback(() => {
    decide(true)
    setPanelOpen(false)
  }, [decide])

  const declineAll = useCallback(() => {
    decide(false)
    setPanelOpen(false)
  }, [decide])

  const savePreferences = useCallback(() => {
    decide(analyticsOn)

    // Confirm in place rather than closing instantly: someone who has just
    // switched analytics off deserves to see that it took.
    setSaved(true)
    if (savedTimer.current) window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => {
      setSaved(false)
      setPanelOpen(false)
      savedTimer.current = null
    }, 900)
  }, [analyticsOn, decide])

  const askAgain = useCallback(() => {
    clearConsent()
    setAnalyticsOn(false)
    setUndecided(true)
    setPanelOpen(false)
  }, [])

  if (!configured) return null

  const barVisible = undecided && ready && settled && !panelOpen

  return (
    <>
      {/* ── The bar ── */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label="Cookie consent"
            className="fixed inset-x-0 bottom-0 z-[300] px-3 pb-3 sm:px-4 sm:pb-4"
          >
            {/* max-w-4xl rather than 3xl purely so the sentence and the buttons
                share one line on desktop — a wider bar that is half the height
                is less intrusive than a narrow one that wraps. */}
            <div className="nb-card mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-5 sm:py-3">
              <p className="flex-1 text-[12.5px] leading-[1.55] text-[#6B4155]">
                <Cookie
                  size={13}
                  aria-hidden="true"
                  className="mr-1.5 inline-block align-[-1px] text-[#C01057]"
                />
                {/* "how this site is used" rather than "count visits": GA4's
                    enhanced measurement also records scroll depth, outbound
                    clicks and form starts, so the narrower phrase would promise
                    less than the thing actually does. First layer of a layered
                    notice still has to be true of all of it. */}
                We’d like to use <strong>Google Analytics</strong> cookies to see how this site is
                used. Off unless you accept.{' '}
                <a
                  href="/cookie-policy"
                  className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] hover:text-[#C01057]"
                >
                  Details
                </a>
              </p>

              {/* Accept and decline are the same button, twice. That is the
                  point — equal size, equal weight, one click each. */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={declineAll}
                  className="rounded-full border border-[#E8176D]/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C01057] transition-colors hover:bg-[#E8176D]/8"
                >
                  Decline
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-full bg-[#E8176D] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C01057]"
                >
                  Accept
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnalyticsOn(hasAnalyticsConsent())
                    setPanelOpen(true)
                  }}
                  className="ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#7A3B5E] underline underline-offset-[3px] transition-colors hover:text-[#E8176D]"
                >
                  Options
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Preferences panel ── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[310] flex items-end justify-center bg-[#2D1225]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
            onClick={(e) => {
              // Click-away closes the panel without deciding anything.
              if (e.target === e.currentTarget) setPanelOpen(false)
            }}
          >
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cookie-settings-title"
              className="nb-card max-h-[85vh] w-full max-w-xl overflow-y-auto px-6 py-7 sm:px-8 sm:py-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C01057]">
                    Cookie settings
                  </p>
                  <h2
                    id="cookie-settings-title"
                    className="mt-2 uppercase leading-[1.05] tracking-[-0.02em] text-[clamp(1.4rem,4vw,2rem)] text-[#3B2116]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    Your choice
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close cookie settings"
                  className="-mr-1 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#7A3B5E] transition-colors hover:bg-[#E8176D]/10 hover:text-[#E8176D]"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="mt-4 text-[14.5px] leading-[1.75] text-[#6B4155]">
                Nothing here is switched on unless you switch it on. Full detail is in our{' '}
                <a
                  href="/cookie-policy"
                  className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] hover:text-[#C01057]"
                >
                  Cookie Policy
                </a>{' '}
                and{' '}
                <a
                  href="/privacy-policy"
                  className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] hover:text-[#C01057]"
                >
                  Privacy Policy
                </a>
                .
              </p>

              {/* Essential — listed for completeness, and honest about being
                  one line of storage rather than a cookie. */}
              <div className="mt-6 rounded-[18px] border border-[#E8176D]/12 bg-white/40 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-bold text-[#3B2116]">Strictly necessary</p>
                  <span className="rounded-full bg-[#E8176D]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#C01057]">
                    Always on
                  </span>
                </div>
                <p className="mt-2 text-[13.5px] leading-[1.7] text-[#6B4155]">
                  The only thing in this category is the record of the choice you make right here —
                  one line in your browser’s local storage, so we do not have to ask you again on
                  every page. It identifies nobody and is never sent to us.
                </p>
              </div>

              {/* Analytics — off by default, always. */}
              <div className="mt-3 rounded-[18px] border border-[#E8176D]/12 bg-white/40 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* A <label htmlFor> cannot name a button, so the switch takes
                      its accessible name from this element by id instead. */}
                  <span id="consent-analytics-label" className="text-[14px] font-bold text-[#3B2116]">
                    Analytics — Google Analytics 4
                  </span>

                  <button
                    type="button"
                    data-autofocus
                    role="switch"
                    aria-checked={analyticsOn}
                    aria-labelledby="consent-analytics-label"
                    onClick={() => setAnalyticsOn((on) => !on)}
                    className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                      analyticsOn ? 'bg-[#E8176D]' : 'bg-[#7A3B5E]/25'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] duration-200 ${
                        analyticsOn ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <p className="mt-2 text-[13.5px] leading-[1.7] text-[#6B4155]">
                  Counts visits, which pages are read and roughly where in the world people are, so
                  we know which flavours and pop-ups people actually care about. Sets Google’s{' '}
                  <code className="rounded bg-[#E8176D]/8 px-1 text-[12.5px]">_ga</code> cookies,
                  which last up to two years, and sends your IP address and page details to Google
                  in the United States. We never send Google your name, email or phone number.
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={declineAll}
                  className="rounded-full border border-[#E8176D]/30 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-[#C01057] transition-colors hover:bg-[#E8176D]/8 sm:flex-1"
                >
                  Decline all
                </button>

                <button
                  type="button"
                  onClick={savePreferences}
                  className="rounded-full bg-[#E8176D] px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C01057] sm:flex-1"
                >
                  {saved ? 'Saved ✓' : 'Save my choice'}
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-full border border-[#E8176D]/30 px-6 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-[#C01057] transition-colors hover:bg-[#E8176D]/8 sm:flex-1"
                >
                  Accept all
                </button>
              </div>

              <button
                type="button"
                onClick={askAgain}
                className="mt-4 text-[12px] font-semibold text-[#7A3B5E]/70 underline underline-offset-[3px] transition-colors hover:text-[#E8176D]"
              >
                Forget my choice and ask me again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/* ────────────────────────── Footer link ────────────────────────── */

/**
 * The permanent way back in — both footers, and the couple of places in the
 * cookie policy that offer the choice mid-sentence. Withdrawal has to be
 * reachable from every page, which in practice means the place every page ends.
 *
 * With no analytics configured there is no panel to open, so by default this
 * renders nothing rather than a link that does nothing. `asProse` is for the
 * policy page, where the words are part of a sentence: there it degrades to
 * plain text so the sentence still reads.
 */
export function CookieSettingsLink({
  className,
  asProse = false,
}: {
  className?: string
  asProse?: boolean
}) {
  if (!cookieSettingsAvailable()) {
    return asProse ? <span>cookie settings</span> : null
  }

  return (
    <button type="button" onClick={openCookieSettings} className={className}>
      Cookie settings
    </button>
  )
}
