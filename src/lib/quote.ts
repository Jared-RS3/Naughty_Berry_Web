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
}

export const CUP_TARGET = 25
export const BASE_PRICE = 1675
/** Signature is the same "capped box" shape as Little Moments, just bigger —
 *  50 cups plus the on-site stand, staffed for the event. */
export const SIGNATURE_CUP_TARGET = 50
export const SIGNATURE_BASE_PRICE = 7750
/** Dubai and Cream are not menu cups — they are toppings, charged per cup you
 *  put one on. Same R20 gap the old R95 cups carried, just billed as an add-on. */
export const TOPPING_PRICE = 20
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

export type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'date' | 'venue' | 'notes', string>>

/** Validates the contact step. Same rules as the server, phrased for a human. */
export function validateDetails(f: {
  name: string
  email: string
  phone: string
  date: string
  venue: string
  notes: string
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
    startedAt,
    company: honeypot,
  }
}
