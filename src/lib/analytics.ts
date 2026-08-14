/**
 * Google Analytics 4 — consent-gated.
 *
 * ── The rule this file exists to enforce ────────────────────────────────────
 * gtag.js is never added to the document until the visitor has actively said
 * yes. Not loaded-then-disabled, not loaded in a cookieless mode: not loaded.
 * index.html deliberately carries no GA snippet, because a snippet there would
 * run on the first parse, long before anyone could be asked anything.
 *
 * Consent Mode is still set to "denied" on every axis before the script tag is
 * appended. That is belt and braces — by the time we append, consent is already
 * granted — but it means any future code path that loads the library early
 * fails closed instead of open.
 *
 * ── Google's terms, mapped to the code ──────────────────────────────────────
 *   • Disclosure — /privacy-policy §8 and /cookie-policy name Google Analytics,
 *     the cookies it sets, what it collects and how Google processes it.
 *   • Consent — POPIA s11 needs a lawful ground for placing a non-essential
 *     cookie, and for a tracking cookie that ground can only be consent. See
 *     src/lib/consent.ts and CookieBanner.tsx. Declining is one click, exactly
 *     like accepting, and is honoured by never loading the library.
 *   • No PII — GA's terms forbid sending anything that identifies a person.
 *     `track()` below refuses to send a parameter that looks like a name, an
 *     email address or a phone number, and page URLs are scrubbed the same way
 *     before they reach `page_location`. The quote form's contents never go
 *     near this file.
 *   • No opt-out bypass — withdrawing consent sets the library's own kill
 *     switch, flips Consent Mode back to denied and deletes the cookies GA set.
 *   • Google signals and ad personalisation are switched off. Turning either on
 *     turns this into an advertising product with a different set of terms, and
 *     both the policies and this comment would need revisiting first.
 */

import { hasAnalyticsConsent, subscribeToConsent } from './consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Set VITE_GA_MEASUREMENT_ID in the environment (Netlify → Site settings →
 * Environment variables, and .env locally). Absent or malformed, the whole
 * feature switches itself off — including the banner, because a consent
 * question nobody's answer changes anything about is just a click tax.
 */
const RAW_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID ?? '').trim()
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/i.test(RAW_ID) ? RAW_ID : ''

if (RAW_ID && !MEASUREMENT_ID && import.meta.env.DEV) {
  console.warn(
    `[analytics] VITE_GA_MEASUREMENT_ID is set to "${RAW_ID}", which is not a GA4 measurement ID ` +
      '(they look like G-XXXXXXXXXX). Analytics is disabled.',
  )
}

/** Whether analytics exists at all on this deploy. Drives the banner. */
export function isAnalyticsConfigured(): boolean {
  return MEASUREMENT_ID !== ''
}

/** GA's own kill switch: set on window, it stops the library sending anything. */
const DISABLE_FLAG = `ga-disable-${MEASUREMENT_ID}`

let scriptLoaded = false
let initialised = false

/* ─────────────────────────── gtag plumbing ─────────────────────────── */

/**
 * Google's snippet verbatim: gtag.js reads the `arguments` object positionally
 * off the queue, so this pushes `arguments` rather than a rest array.
 */
function gtagRaw() {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer!.push(arguments)
}

function gtag(...args: unknown[]): void {
  window.dataLayer = window.dataLayer ?? []
  ;(gtagRaw as (...a: unknown[]) => void)(...args)
}

/* ─────────────────────────── PII guards ─────────────────────────── */

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/
/** Seven or more digits in a row, however they are spaced — a phone number. */
const PHONE = /(?:\d[\s().-]*){7,}/
/** Parameter names that could only ever carry something personal. */
const PERSONAL_KEY =
  /(name|email|mail|phone|tel|mobile|cell|address|surname|contact|dob|birth|id_?number|passport)/i

/**
 * True if this value must never leave the browser. Deliberately blunt: a false
 * positive costs us one dimension on a chart, a false negative is a breach of
 * both GA's terms and our own privacy policy.
 */
function looksPersonal(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return EMAIL.test(value) || PHONE.test(value)
}

/**
 * Strips anything personal out of a URL before it becomes `page_location`.
 * Nothing on this site puts personal data in a query string today (the only
 * parameter in use is ?pkg= on the quote builder), so in practice this returns
 * the URL untouched — it is here so that adding, say, a mailto prefill or an
 * ?email= deep link later cannot quietly start feeding addresses to Google.
 */
function scrubUrl(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }

  // The fragment is never sent anywhere by us, and can carry anything.
  url.hash = ''

  for (const key of [...url.searchParams.keys()]) {
    if (PERSONAL_KEY.test(key) || looksPersonal(url.searchParams.get(key))) {
      url.searchParams.set(key, '[redacted]')
    }
  }

  return url.toString()
}

/**
 * Drops event parameters that look like they carry a person. Returns the safe
 * subset — an event with a bad parameter still sends, minus that parameter,
 * because losing the event entirely would hide the problem.
 */
function scrubParams(params: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(params)) {
    if (PERSONAL_KEY.test(key) || looksPersonal(value)) {
      if (import.meta.env.DEV) {
        console.warn(
          `[analytics] dropped event parameter "${key}" — it looks like personal information, ` +
            'which Google Analytics terms forbid sending.',
        )
      }
      continue
    }
    safe[key] = value
  }

  return safe
}

/* ─────────────────────────── Loading ─────────────────────────── */

function loadGtag(): void {
  if (scriptLoaded || !MEASUREMENT_ID) return
  scriptLoaded = true

  window.dataLayer = window.dataLayer ?? []

  // Fail closed. Everything denied until the update below grants the one axis
  // the visitor actually agreed to.
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
  })

  gtag('js', new Date())
  gtag('config', MEASUREMENT_ID, {
    // Keep this a measurement product, not an advertising one. Both of these
    // default to true and would enable remarketing audiences and demographic
    // profiling — neither of which our policies declare or our visitors agreed
    // to.
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: scrubUrl(window.location.href),
  })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
  document.head.appendChild(script)
}

/* ─────────────────────────── Withdrawal ─────────────────────────── */

/**
 * Expires a cookie across every domain scope it could have been set on. GA sets
 * `_ga` on the registrable domain, which is not something a browser will tell
 * us, so we walk the hostname from most to least specific and let the browser
 * ignore the scopes we do not own.
 */
function expireCookie(name: string): void {
  const parts = window.location.hostname.split('.')
  const scopes = ['']

  for (let i = 0; i < parts.length - 1; i++) {
    scopes.push(`; domain=.${parts.slice(i).join('.')}`)
  }

  for (const scope of scopes) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax${scope}`
  }
}

/** Every cookie Google Analytics is known to set, plus whatever is actually there. */
function deleteAnalyticsCookies(): void {
  const found = document.cookie
    .split(';')
    .map((pair) => pair.split('=')[0]?.trim() ?? '')
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name.startsWith('_gat'))

  for (const name of new Set([...found, '_ga', '_gid'])) {
    expireCookie(name)
  }
}

/**
 * Honours a withdrawal on the spot, without a reload. Three separate brakes,
 * because the library may already be running: its own kill switch stops it
 * sending, Consent Mode stops it storing, and the cookies it already set are
 * removed.
 */
function disableAnalytics(): void {
  if (!MEASUREMENT_ID) return

  ;(window as unknown as Record<string, unknown>)[DISABLE_FLAG] = true

  if (scriptLoaded) {
    gtag('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    })
  }

  deleteAnalyticsCookies()
}

function enableAnalytics(): void {
  if (!MEASUREMENT_ID) return

  ;(window as unknown as Record<string, unknown>)[DISABLE_FLAG] = false

  loadGtag()
  gtag('consent', 'update', { analytics_storage: 'granted' })
}

/* ─────────────────────────── Public API ─────────────────────────── */

/**
 * Called once from main.tsx. Applies whatever the visitor decided on a previous
 * visit, then keeps following their decisions for the rest of this one.
 */
export function initAnalytics(): void {
  if (initialised || !MEASUREMENT_ID) return
  initialised = true

  if (hasAnalyticsConsent()) {
    enableAnalytics()
  } else {
    // Not merely "do nothing": a visitor who declines mid-session may already
    // be carrying _ga from an earlier accept.
    ;(window as unknown as Record<string, unknown>)[DISABLE_FLAG] = true
  }

  subscribeToConsent((record) => {
    if (record?.analytics === 'granted') enableAnalytics()
    else disableAnalytics()
  })
}

/**
 * Sends a custom event, if and only if the visitor consented.
 *
 * Pass counts, categories and labels — never anything a person typed about
 * themselves. `scrubParams` is a backstop, not a licence: the rule is that
 * names, addresses, phone numbers and free-text notes do not come near here.
 */
export function track(eventName: string, params: Record<string, unknown> = {}): void {
  if (!MEASUREMENT_ID || !hasAnalyticsConsent() || !scriptLoaded) return

  gtag('event', eventName, scrubParams(params))
}
