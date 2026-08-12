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

export type PackageId = 'little' | 'indulgent'

export interface Quote {
  occasion: string
  pkg: PackageId
  /** flavour id → cup count. Only meaningful for the Little Moments box. */
  mix: Record<string, number>
  icedTeas: number
  guests: number
  addons: string[]
  name: string
  email: string
  phone: string
  date: string
  venue: string
  notes: string
}

export const CUP_TARGET = 25
export const BASE_PRICE = 1675
/** Menu gap between a R75 cup and a R95 Dubai/Cream, charged per upgraded cup. */
export const UPGRADE = 20
export const ICED_TEA_PRICE = 45
export const ICED_TEA_CAP = 40

export interface Flavour {
  id: string
  name: string
  short: string
  img: string
  upcharge: number
  /** Which of the Leads table's four cup buckets this flavour counts toward. */
  bucket: 'classic' | 'brownie' | 'dubai' | 'cream'
  blurb: string
}

export const FLAVOURS: Flavour[] = [
  {
    id: 'classic',
    name: 'Naughty Classic',
    short: 'Classic',
    img: '/menu-cups/classic.webp',
    upcharge: 0,
    bucket: 'classic',
    blurb: 'Fresh strawberries drenched in creamy milk chocolate.',
  },
  {
    id: 'brownie',
    name: 'Naughty Brownie',
    short: 'Brownie',
    img: '/menu-cups/brownie.webp',
    upcharge: 0,
    bucket: 'brownie',
    blurb: 'Fudgey brownie bites folded through the chocolate.',
  },
  {
    id: 'dubai',
    name: 'Dubai Chocolate',
    short: 'Dubai',
    img: '/menu-cups/dubai-choc.webp',
    upcharge: UPGRADE,
    bucket: 'dubai',
    blurb: 'Pistachio cream and toasted kataifi on top.',
  },
  {
    id: 'dubai-brownie',
    name: 'Dubai Brownie',
    short: 'Dubai + Brownie',
    img: '/menu-cups/dubai.webp',
    upcharge: UPGRADE,
    bucket: 'dubai',
    blurb: 'The kunafeh, with brownie bites underneath.',
  },
  {
    id: 'cream',
    name: 'Naughty Cream',
    short: 'Cream',
    img: '/menu-cups/cream-plain.webp',
    upcharge: UPGRADE,
    bucket: 'cream',
    blurb: 'Velvety sweet cream, crowned with Biscoff crumb.',
  },
  {
    id: 'cream-brownie',
    name: 'Cream Brownie',
    short: 'Cream + Brownie',
    img: '/menu-cups/cream.webp',
    upcharge: UPGRADE,
    bucket: 'cream',
    blurb: 'Cream and brownie, layered through the berries.',
  },
]

export const ADDONS = [
  { id: 'choc-tap', name: 'Chocolate Tap', desc: 'Our signature flowing tap, poured live.' },
  { id: 'dubai-station', name: 'Dubai Kunafeh Bar', desc: 'Pistachio cream & kataifi, on the side.' },
  { id: 'cream-station', name: 'Naughty Cream Bar', desc: 'Sweet cream and Biscoff crumb station.' },
  { id: 'iced-tea-bar', name: 'Iced Tea Bar', desc: 'Strawberry-peach over ice, all night.' },
]

export function totalCups(mix: Record<string, number>) {
  return Object.values(mix).reduce((a, b) => a + b, 0)
}

/** The figure shown on screen. The server recomputes this independently before
 *  writing anything — this copy is for display only and is never posted. */
export function estimateTotal(mix: Record<string, number>, icedTeas: number) {
  const upgraded = FLAVOURS.reduce(
    (sum, f) => sum + (f.upcharge > 0 ? (mix[f.id] ?? 0) : 0),
    0
  )
  return BASE_PRICE + upgraded * UPGRADE + icedTeas * ICED_TEA_PRICE
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
/** Leading digit/+/( then 8–31 more, i.e. 9–32 characters total. Sized off a
 *  local mobile written plainly — "0821234567" is ten characters, so a stricter
 *  minimum silently rejects the most common number on the form. */
export const PHONE_RE = /^[+()\d][\d\s()+-]{8,31}$/

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

  if (name.length < 2) errors.name = 'Please tell us your name.'
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`

  if (!email && !phone) {
    errors.email = 'Give us an email or a phone number so we can reply.'
  } else {
    if (email && !EMAIL_RE.test(email)) errors.email = 'That email address doesn’t look right.'
    if (email.length > LIMITS.email) errors.email = 'That email address is too long.'
    if (phone && !PHONE_RE.test(phone)) errors.phone = 'That phone number doesn’t look right.'
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
    icedTeas: q.icedTeas,
    guests: q.guests,
    addons: q.addons,
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
