/**
 * Cookie-consent state for the whole site.
 *
 * One category only — analytics — because that is the only non-essential thing
 * the site loads. Adding a second category (advertising, personalisation, a
 * chat widget) means adding it to `ConsentRecord`, to the preferences panel in
 * CookieBanner, and to /cookie-policy in the same commit, and bumping
 * CONSENT_VERSION so everyone is asked again.
 *
 * ── Why the record looks like this ──────────────────────────────────────────
 * POPIA s1 defines consent as "voluntary, specific and informed", and s11(2)(a)
 * puts the burden of proving it on us. A bare boolean cannot do that, so every
 * decision is stored with the version of the wording it was given against and
 * the moment it was made. If the wording changes materially, the version bump
 * invalidates the old record and the banner asks again rather than silently
 * carrying an agreement to something the visitor never read.
 *
 * ── Why localStorage ────────────────────────────────────────────────────────
 * Storing the choice is itself storage on the visitor's device, and it is the
 * one thing that never needs consent: it is strictly necessary for giving
 * effect to a preference the visitor expressly asked for. It is deliberately
 * NOT a cookie — a cookie would be sent to the server on every request for no
 * reason. Nothing about it identifies anyone; it is one word and a date.
 *
 * Storage can throw (Safari private browsing, embedded webviews, blocked
 * third-party contexts). Every access is guarded, and when persistence fails
 * the choice still applies for the rest of the session via `memory` — a
 * visitor who declines must not be re-asked three times on their way through
 * the site just because their browser refused us a write.
 */

export type ConsentChoice = 'granted' | 'denied'

export interface ConsentRecord {
  /** The wording version this decision was made against. */
  version: number
  /** Analytics (Google Analytics 4). Everything else on the site is essential. */
  analytics: ConsentChoice
  /** ISO 8601 timestamp of the moment the visitor decided. */
  decidedAt: string
}

/**
 * Bump this whenever the categories change or the banner's description of what
 * analytics does changes materially. Everyone is then asked again — an old
 * "accept" cannot carry forward onto something new.
 */
export const CONSENT_VERSION = 1

const STORAGE_KEY = 'nb.cookie-consent'

/** Survives a failed write so the decision still holds for this page view. */
let memory: ConsentRecord | null = null

type Listener = (record: ConsentRecord | null) => void
const listeners = new Set<Listener>()

function isChoice(value: unknown): value is ConsentChoice {
  return value === 'granted' || value === 'denied'
}

/**
 * The visitor's stored decision, or `null` if they have not made one — which is
 * the state the banner exists to resolve. A record from an older
 * CONSENT_VERSION reads as `null`: it is an answer to a different question.
 */
export function readConsent(): ConsentRecord | null {
  if (memory) return memory

  let raw: string | null = null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    const record = parsed as Partial<ConsentRecord>
    if (record.version !== CONSENT_VERSION) return null
    if (!isChoice(record.analytics)) return null

    memory = {
      version: CONSENT_VERSION,
      analytics: record.analytics,
      decidedAt: typeof record.decidedAt === 'string' ? record.decidedAt : '',
    }
    return memory
  } catch {
    // Corrupt or hand-edited. Treat as undecided rather than guessing, since
    // guessing here means guessing "granted" for someone who may have declined.
    return null
  }
}

/** True when analytics may load. Undecided is not consent. */
export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === 'granted'
}

/**
 * Records a decision and tells everyone listening. Both answers are stored:
 * "denied" is a real decision, not the absence of one, and storing it is what
 * stops us asking again every visit.
 */
export function setConsent(analytics: ConsentChoice): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  }

  memory = record
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // Persistence failed; `memory` still carries the choice for this session.
  }

  for (const listener of listeners) listener(record)
  return record
}

/**
 * Wipes the decision so the banner asks again from scratch. Used by the
 * "ask me again" path in the preferences panel.
 */
export function clearConsent(): void {
  memory = null
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to do — there was nothing stored to begin with.
  }

  for (const listener of listeners) listener(null)
}

/** Subscribe to decisions. Returns an unsubscribe function. */
export function subscribeToConsent(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
