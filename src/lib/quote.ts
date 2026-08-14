/**
 * Shape of an event enquiry.
 *
 * The mapping onto Airtable column names deliberately does NOT live here — it
 * lives in netlify/functions/enquiry.mts, server-side. The client posts plain
 * answers ("pkg": "little") and the function decides which columns those may
 * touch. If the browser named the columns instead, anyone could POST any column
 * in the Leads table, because an Airtable token cannot be scoped to a subset of
 * fields. Prices are likewise recomputed server-side: a total sent by the client
 * is just a number the client chose.
 */

export type PackageId = 'little' | 'signature' | 'indulgent'

export interface Quote {
  occasion: string
  pkg: PackageId
  /** flavour id → cup count. Meaningless for the uncapped Indulgent spread. */
  mix: Record<string, number>
  /** topping id → how many cups wear it. Priced on top of the box, so unlike
   *  `mix` these do not add cups — they dress cups `mix` already counted, which
   *  is why the two toppings together cannot exceed the cup count. */
  toppings: Record<string, number>
  icedTeas: number
  guests: number
  name: string
  email: string
  phone: string
  date: string
  venue: string
  notes: string
  /** The single agreement tick: POPIA consent, the Terms of Use, and the
   *  confirmation that the details entered are correct. False can never reach
   *  the server — the details step will not advance without it and the function
   *  rejects it anyway. */
  consent: boolean
}

/**
 * The one thing the visitor ticks before the enquiry can be sent, and the
 * version stamp recorded alongside it.
 *
 * ── What this single tick carries ───────────────────────────────────────────
 *   1. POPIA s11(1)(a) consent to process what they entered.
 *   2. Acceptance of the Terms of Use.
 *   3. Confirmation that the details entered are correct — ECTA s43(2) wants
 *      the customer given a chance to review and fix mistakes before
 *      committing, and s43(3) lets them cancel if that chance was never given.
 * It writes to two separate Airtable columns (POPI Consent and T&Cs Agreement)
 * so the record still shows both were agreed to, even though the visitor made
 * one gesture.
 *
 * ── The trade-off, recorded honestly ────────────────────────────────────────
 * Splitting this into two boxes would be the stronger position: POPIA s11(1)(a)
 * wants consent that is voluntary and *specific*, and a single box meaning
 * "process my data AND I accept your contract" is arguably neither, since the
 * visitor cannot agree to one without the other. It was built as two and merged
 * to one deliberately, because two dense boxes at the end of a quote builder
 * read as intimidating and cost real enquiries. The mitigation is that the
 * wording below is short and plain, and both documents are one tap away.
 *
 * ── Versioning ──────────────────────────────────────────────────────────────
 * Consent is only worth anything as evidence if we can say *what* was agreed to
 * and *when*, so the wording lives in one exported constant rather than being
 * typed into the JSX, and every submission stores the version. Bump
 * CONSENT_VERSION — and EFFECTIVE_DATE in LegalLayout — whenever the substance
 * of this statement, of the Privacy Policy or of the Terms of Use changes, so
 * older records still point at the wording those people actually saw.
 */
export const CONSENT_VERSION = '2026-08-14'

export const CONSENT_STATEMENT =
  'I agree to the Privacy Policy and Terms of Use, and confirm the details above are correct.'

/** The one line under the tick. Says the only three things a visitor actually
 *  needs at this moment: what we do with it, that it is not a booking, and that
 *  they can undo it. Everything else is in the two linked documents. */
export const CONSENT_NOTE =
  'We use your details only to prepare your quote and reply to you — never sold, never shared for anyone else’s marketing. This is an enquiry, not a booking, and you can ask us to delete your details at any time.'

export const CUP_TARGET = 25
export const BASE_PRICE = 1675
/** Signature is the same "capped box" shape as Little Moments, just bigger —
 *  50 cups plus the on-site stand, staffed for the event. */
export const SIGNATURE_CUP_TARGET = 50
export const SIGNATURE_BASE_PRICE = 7750
/** Dubai and Cream are not menu cups — they are toppings, charged per cup you
 *  put one on, billed as an add-on rather than baked into the cup price. */
export const TOPPING_PRICE = 15
export const ICED_TEA_PRICE = 45
export const ICED_TEA_CAP = 40

/** Little Moments and Signature are both fixed-size boxes; Indulgent is sized
 *  to the guest list instead, so it has no cap. */
export function cupCapFor(pkg: PackageId): number | null {
  if (pkg === 'little') return CUP_TARGET
  if (pkg === 'signature') return SIGNATURE_CUP_TARGET
  return null
}

export function basePriceFor(pkg: PackageId): number {
  return pkg === 'signature' ? SIGNATURE_BASE_PRICE : BASE_PRICE
}

export function packageName(pkg: PackageId): string {
  if (pkg === 'little') return 'Little Moments'
  if (pkg === 'signature') return 'Signature'
  return 'Indulgent'
}

export interface Flavour {
  id: string
  name: string
  short: string
  img: string
  /** Which of the Leads table's cup buckets this flavour counts toward. */
  bucket: 'classic' | 'brownie'
  blurb: string
}

/** Every cup on the builder's menu costs the same now — what used to be the
 *  R95 Dubai and Cream cups moved out to TOPPINGS below. */
export const FLAVOURS: Flavour[] = [
  {
    id: 'classic',
    name: 'Naughty Classic',
    short: 'Classic',
    img: '/menu-cups/classic.webp',
    bucket: 'classic',
    blurb: 'Fresh strawberries drenched in creamy milk chocolate.',
  },
  {
    id: 'brownie',
    name: 'Naughty Brownie',
    short: 'Brownie',
    img: '/menu-cups/brownie.webp',
    bucket: 'brownie',
    blurb: 'Fudgey brownie bites folded through the chocolate.',
  },
]

export interface Topping {
  id: string
  name: string
  short: string
  img: string
  blurb: string
}

/** Paid add-ons, offered on all three packages. The image is the finished cup,
 *  because "Dubai topping" means nothing to anyone who hasn't seen one. */
export const TOPPINGS: Topping[] = [
  {
    id: 'dubai',
    name: 'Dubai topping',
    short: 'Dubai',
    img: '/menu-cups/dubai-choc.webp',
    blurb: 'Pistachio cream and toasted kataifi on top.',
  },
  {
    id: 'cream',
    name: 'Cream topping',
    short: 'Cream',
    img: '/menu-cups/cream-plain.webp',
    blurb: 'Velvety sweet cream, crowned with Biscoff crumb.',
  },
]

/**
 * The cut-outs in `img` are 1000px-tall masters, sized for the home page menu.
 * Nothing in the builder shows them anywhere near that big, so every screen here
 * asks for the derivative that matches what it actually paints — see
 * scripts/quote-cup-sizes.mjs, which generates them.
 *
 *   480  the cup carousel, 210–240px tall
 *   112  topping tabs, box chips, the iced-tea row, 24–48px tall
 */
export type CupSize = 480 | 112
export const cupSrc = (img: string, size: CupSize) =>
  img.replace(/\.webp$/, `-${size}.webp`)

export function totalCups(mix: Record<string, number>) {
  return Object.values(mix).reduce((a, b) => a + b, 0)
}

/**
 * Cups wearing a topping, across both toppings. A cup takes at most one, so
 * this can never exceed the number of cups in the order — the two toppings
 * share one budget rather than getting a full one each.
 */
export function totalToppings(toppings: Record<string, number>) {
  return TOPPINGS.reduce((sum, t) => sum + (toppings[t.id] ?? 0), 0)
}

/** The figure shown on screen. The server recomputes this independently before
 *  writing anything — this copy is for display only and is never posted. */
export function estimateTotal(
  pkg: PackageId,
  icedTeas: number,
  toppings: Record<string, number>
) {
  return (
    basePriceFor(pkg) +
    totalToppings(toppings) * TOPPING_PRICE +
    icedTeas * ICED_TEA_PRICE
  )
}

/** en-ZA groups thousands with a space — "R1 675". */
export const rands = (n: number) => `R${n.toLocaleString('en-ZA')}`

/** Client-side field limits. These mirror the caps the Netlify function
 *  enforces — the browser copy exists to give a helpful message, the server
 *  copy is the one that counts. */
export const LIMITS = {
  name: 80,
  email: 254,
  phone: 32,
  venue: 120,
  notes: 2000,
} as const

export const EMAIL_RE =
  /^[^\s@,;:<>()[\]\\]{1,64}@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/
/**
 * South African numbers, matched after the punctuation people naturally type is
 * stripped: ten digits starting 0 ("082 123 4567"), or the same number written
 * internationally as +27 / 27 followed by nine. Punctuation is removed rather
 * than rejected — bouncing a correct number over a bracket costs a real lead,
 * and the stored value is normalised anyway.
 */
export const PHONE_RE = /^(?:\+?27|0)\d{9}$/

/** Drops spaces, dashes, dots and brackets so the pattern above sees digits. */
export const normalisePhone = (s: string) => s.replace(/[\s()\-.]/g, '')

export type FieldErrors = Partial<
  Record<'name' | 'email' | 'phone' | 'date' | 'venue' | 'notes' | 'consent', string>
>

/** Validates the contact step. Same rules as the server, phrased for a human. */
export function validateDetails(f: {
  name: string
  email: string
  phone: string
  date: string
  venue: string
  notes: string
  consent: boolean
}): FieldErrors {
  const errors: FieldErrors = {}
  const name = f.name.trim()
  const email = f.email.trim()
  const phone = f.phone.trim()

  if (name.length < 2) errors.name = 'Please enter your name — at least 2 characters.'
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`

  // One contact route is required, not both. Each is still validated on its own
  // so a visitor who fills only the phone still gets told when it is malformed.
  if (!email && !phone) {
    errors.email = 'Enter an email address or a phone number so we can reply.'
    errors.phone = 'Enter an email address or a phone number so we can reply.'
  }
  if (email) {
    if (email.length > LIMITS.email) errors.email = 'That email address is too long.'
    else if (!EMAIL_RE.test(email)) {
      errors.email = 'Enter a valid email address, like you@example.com.'
    }
  }
  if (phone && !PHONE_RE.test(normalisePhone(phone))) {
    errors.phone = 'Enter a valid 10-digit number, like 082 123 4567.'
  }

  if (f.date) {
    const d = new Date(`${f.date}T00:00:00`)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxAhead = new Date(today)
    maxAhead.setFullYear(maxAhead.getFullYear() + 3)
    if (Number.isNaN(d.getTime())) errors.date = 'That date isn’t valid.'
    else if (d < today) errors.date = 'Please pick a date in the future.'
    else if (d > maxAhead) errors.date = 'We can only book up to three years ahead.'
  }

  if (f.venue.length > LIMITS.venue) errors.venue = `Keep it under ${LIMITS.venue} characters.`
  if (f.notes.length > LIMITS.notes) errors.notes = `Keep it under ${LIMITS.notes} characters.`

  // Consent is not a nicety we can infer from someone pressing Send — POPIA
  // s11(1)(a) wants it voluntary, specific and informed, which means an unticked
  // box has to block the enquiry the same way a missing name does.
  if (!f.consent) {
    errors.consent = 'Please tick the box so we can use your details to quote you.'
  }

  return errors
}

/**
 * The request body. Plain answers only — no Airtable column names, no totals.
 * `startedAt` and `company` are anti-bot signals the server checks: a form
 * submitted implausibly fast, or with the hidden honeypot filled, is dropped.
 */
export function toEnquiryPayload(q: Quote, startedAt: number, honeypot: string) {
  return {
    occasion: q.occasion,
    pkg: q.pkg,
    mix: q.mix,
    toppings: q.toppings,
    icedTeas: q.icedTeas,
    guests: q.guests,
    name: q.name,
    email: q.email,
    phone: q.phone,
    date: q.date,
    venue: q.venue,
    notes: q.notes,
    // The tick, and which wording it was given against. The server refuses the
    // enquiry outright if this is not exactly `true`.
    consent: q.consent,
    consentVersion: CONSENT_VERSION,
    startedAt,
    company: honeypot,
  }
}
