import type { Config, Context } from '@netlify/functions'

/**
 * Writes a quote-builder enquiry into the Airtable **Leads** table.
 *
 * ── Why this function exists ────────────────────────────────────────────────
 * The write happens server-side so the credential stays server-side. The site's
 * read-only schedule token is bundled into the client on purpose
 * (VITE_AIRTABLE_TOKEN), but a token that can *write* must never be — anyone
 * could then create, and depending on scopes edit, records in the base. This
 * function reads the write token from the Netlify environment, where the
 * browser cannot see it, and the client only ever talks to this endpoint.
 *
 * ── Trust model ─────────────────────────────────────────────────────────────
 * Everything arriving here is hostile until proven otherwise. The client sends
 * a flat answer object, NOT Airtable field names — the mapping onto real
 * columns happens below, from a fixed allowlist. That is the single most
 * important control in this file: without it, anyone who can POST could write
 * to any column in the Leads table (Status, linked records, anything) simply by
 * naming it, because the Airtable token cannot scope itself to a subset of
 * fields.
 *
 * Required Netlify environment variables:
 *   NAUGHTY_WRITE         — PAT with data.records:write on the base
 *                           (AIRTABLE_WRITE_TOKEN is accepted as a fallback)
 *   AIRTABLE_BASE_ID      — optional, defaults to the production base
 *   AIRTABLE_LEADS_TABLE  — optional, defaults to the Leads table id
 *   ALLOWED_ORIGINS       — optional, comma-separated; defaults to the site
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'appIfLyWzGV0npV6U'
const TABLE_ID = process.env.AIRTABLE_LEADS_TABLE ?? 'tblPgWOeVzs9TJOlt'

const DEFAULT_ORIGINS = [
  'https://naughtyberry.co.za',
  'https://www.naughtyberry.co.za',
]

/** Refuse to even read a body larger than this. The largest legitimate enquiry
 *  is well under 4 kB; anything bigger is someone probing. */
const MAX_BODY_BYTES = 16 * 1024

/** Per-field caps. Airtable would accept far longer, which is exactly why we
 *  don't let it — an unbounded field is free storage for whoever finds it. */
const LIMITS = {
  name: 80,
  email: 254, // RFC 5321 practical maximum
  phone: 32,
  venue: 120,
  notes: 2000,
  occasion: 60,
} as const

/** A form completed faster than this was not completed by a person. */
const MIN_FILL_MS = 2_500

type Json = Record<string, unknown>

const json = (status: number, body: Json, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  })

/* ─────────────────────────── Sanitisation ─────────────────────────── */

/**
 * Strips C0/C1 control characters (except newline and tab), normalises unicode,
 * collapses runs of whitespace and trims. Control characters are the cheap way
 * to smuggle misleading content past a human reviewer reading the record.
 */
function clean(value: unknown, max: number, { multiline = false } = {}): string {
  if (typeof value !== 'string') return ''
  let s = value.normalize('NFKC')
  // eslint-disable-next-line no-control-regex
  s = s.replace(multiline ? /[\x00-\x08\x0B-\x1F\x7F-\x9F]/g : /[\x00-\x1F\x7F-\x9F]/g, '')
  // Zero-width and bidi-override characters — used to make text render as
  // something other than what is stored.
  s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '')
  s = multiline ? s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ')
  return s.trim().slice(0, max)
}

/**
 * Neutralises spreadsheet formula injection. Airtable records get exported to
 * CSV and opened in Excel/Sheets, where a cell beginning `=`, `+`, `-`, `@` or
 * a control character is evaluated as a formula — which is a live code-execution
 * path on a colleague's laptop, triggered by a form on the website. Prefixing
 * an apostrophe makes the cell inert while still reading correctly to a human.
 */
function deFormula(s: string): string {
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

const field = (value: unknown, max: number, opts?: { multiline?: boolean }) =>
  deFormula(clean(value, max, opts))

/* ─────────────────────────── Validation ─────────────────────────── */

// Deliberately permissive on the local part, strict on shape. Full RFC 5322 is
// not worth implementing; rejecting a valid address costs a real lead.
const EMAIL_RE = /^[^\s@,;:<>()[\]\\]{1,64}@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/
/** Mirrors PHONE_RE in src/lib/quote.ts — ten digits starting 0, or the same
 *  number as +27/27 plus nine. Matched after punctuation is stripped, and kept
 *  independent of the client copy because this is the one that actually holds. */
const PHONE_RE = /^(?:\+?27|0)\d{9}$/
const normalisePhone = (s: string) => s.replace(/[\s()\-.]/g, '')
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
/** Mirrors TIME_RE in src/lib/quote.ts. Anchored and range-checked rather than
 *  `\d{2}:\d{2}`, so "99:99" cannot reach the base as a plausible-looking time.
 *  Kept independent of the client copy for the same reason as PHONE_RE. */
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

const PACKAGES = new Set(['little', 'signature', 'indulgent'])
const OCCASIONS = new Set([
  'Wedding', 'Birthday', 'Corporate Event', 'Graduation',
  'Baby Shower', 'Year End', 'Girls Night', 'Something Else',
])
const FLAVOUR_IDS = new Set(['classic', 'brownie'])

const BUCKET: Record<string, 'classic' | 'brownie'> = {
  classic: 'classic',
  brownie: 'brownie',
}

/** Dubai and Cream left the cup menu and came back as paid toppings. They still
 *  land in the same two Leads columns, so the reporting side is unchanged — the
 *  number now means "cups wearing this topping" rather than "cups of this kind". */
const TOPPING_IDS = new Set(['dubai', 'cream'])

const FLAVOUR_LABEL: Record<string, string> = {
  classic: 'Naughty Classic',
  brownie: 'Naughty Brownie',
}

const TOPPING_LABEL: Record<string, string> = {
  dubai: 'Dubai topping',
  cream: 'Cream topping',
}

const CUP_TARGET = 25
const SIGNATURE_CUP_TARGET = 50
const MAX_CUPS_PER_FLAVOUR = 500
const MAX_TOTAL_CUPS = 2000
const MAX_ICED_TEAS = 40
const MAX_GUESTS = 5000

/** Little Moments and Signature are both fixed-size boxes; Indulgent is sized
 *  to the guest list instead, so it has no cap. Mirrors cupCapFor in
 *  src/lib/quote.ts — kept independent because this file is the one that
 *  actually enforces it. */
function cupCapFor(pkg: string): number | null {
  if (pkg === 'little') return CUP_TARGET
  if (pkg === 'signature') return SIGNATURE_CUP_TARGET
  return null
}

function basePriceFor(pkg: string): number {
  return pkg === 'signature' ? 7750 : 1675
}

function intIn(value: unknown, min: number, max: number, fallback: number): number {
  // Only ever coerce a number or a string. `Number({ toString: 1 })` throws
  // rather than returning NaN, so passing an arbitrary object here would turn a
  // crafted body into an unhandled crash — a free denial-of-service.
  if (typeof value !== 'number' && typeof value !== 'string') return fallback
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

/** "Event type" offers only these four; anything else rides along in the notes
 *  rather than being flattened into a wrong answer. */
function eventType(occasion: string): string {
  if (occasion === 'Wedding') return 'Wedding'
  if (occasion === 'Birthday') return 'Birthday'
  if (occasion === 'Corporate Event') return 'Private Event'
  return 'other'
}

type Validated = {
  fields: Json
  problems: string[]
}

function validate(input: Json): Validated | { error: string } {
  const problems: string[] = []

  const name = field(input.name, LIMITS.name)
  const email = field(input.email, LIMITS.email).toLowerCase()
  const phone = field(input.phone, LIMITS.phone)

  if (name.length < 2) return { error: 'Please give us a name we can use.' }
  // Both contact routes are required, not either-or as before.
  if (!email) return { error: 'We need an email address.' }
  if (!EMAIL_RE.test(email)) return { error: 'That email address does not look right.' }
  if (!phone) return { error: 'We need a contact number.' }
  if (!PHONE_RE.test(normalisePhone(phone))) {
    return { error: 'Enter a valid 10-digit number, like 082 123 4567.' }
  }

  const pkg = typeof input.pkg === 'string' && PACKAGES.has(input.pkg) ? input.pkg : null
  if (!pkg) return { error: 'Please choose a package.' }
  const cap = cupCapFor(pkg)
  const capped = cap !== null
  // Kept for the branches below that only ever meant "the little box" —
  // Signature now shares that shape, just at a different size.
  const little = pkg === 'little'

  // Unknown occasions are recorded verbatim in the notes rather than rejected —
  // the picker may gain options before this function is redeployed.
  const rawOccasion = field(input.occasion, LIMITS.occasion)
  if (!rawOccasion) return { error: 'Please tell us what the occasion is.' }
  if (!OCCASIONS.has(rawOccasion)) problems.push('occasion not in the known list')

  // Cup mix: only known flavour ids survive, each clamped.
  const mixIn = (input.mix && typeof input.mix === 'object' && !Array.isArray(input.mix))
    ? (input.mix as Json)
    : {}
  const mix: Record<string, number> = {}
  let totalCups = 0
  for (const [id, raw] of Object.entries(mixIn)) {
    if (!FLAVOUR_IDS.has(id)) continue
    const n = intIn(raw, 0, MAX_CUPS_PER_FLAVOUR, 0)
    if (n > 0) {
      mix[id] = n
      totalCups += n
    }
  }
  if (totalCups > MAX_TOTAL_CUPS) return { error: 'That is more cups than we can quote online.' }
  if (capped && totalCups !== cap) {
    return { error: `A ${little ? 'Little Moments' : 'Signature'} box is exactly ${cap} cups.` }
  }

  // Iced tea rides along as a simple quantity add-on on every package, not
  // just the capped boxes.
  const icedTeas = intIn(input.icedTeas, 0, MAX_ICED_TEAS, 0)
  const guests = capped ? cap : intIn(input.guests, 1, MAX_GUESTS, 80)

  // Toppings dress cups that `mix` already counted, so they add no cups of their
  // own — which is exactly why they need their own ceiling. It is the number of
  // cups there are to put a topping on, and the two toppings SHARE it: a 25-cup
  // box cannot carry 25 Dubai and 25 Cream. Over-count is clamped rather than
  // rejected, since the builder already bounds it and a larger number means a
  // crafted body rather than a typo. Fixed id order keeps the trim deterministic.
  const toppingsIn = (input.toppings && typeof input.toppings === 'object' && !Array.isArray(input.toppings))
    ? (input.toppings as Json)
    : {}
  const toppingCap = capped ? cap : guests
  const toppings: Record<string, number> = {}
  let totalToppings = 0
  let toppingRoom = toppingCap
  for (const id of TOPPING_IDS) {
    const n = Math.min(
      intIn(toppingsIn[id], 0, MAX_CUPS_PER_FLAVOUR, 0),
      Math.max(0, toppingRoom)
    )
    if (n > 0) {
      toppings[id] = n
      totalToppings += n
      toppingRoom -= n
    }
  }

  // The agreement tick. One box on screen, carrying three things: POPIA
  // s11(1)(a) consent, acceptance of the Terms of Use, and confirmation that
  // the entered details are correct (ECTA s43(2)'s review-and-correct
  // opportunity, which s43(3) lets the customer cancel over if never given).
  // It is the lawful ground for everything below it, so an enquiry without it
  // is not a validation nicety to be papered over — it is a record we are not
  // allowed to create. Strictly `true`: a string "false", a 0 or a missing key
  // all mean no.
  if (input.consent !== true) {
    return { error: 'Please tick the box to let us use your details to quote you.' }
  }
  // Which wording they agreed to. Recorded rather than trusted — it proves what
  // was on screen only in combination with the deploy that served it, and a
  // client-chosen string is never allowed near a select field.
  const consentVersion = field(input.consentVersion, 20)

  const venue = field(input.venue, LIMITS.venue)
  const notes = field(input.notes, LIMITS.notes, { multiline: true })

  if (!venue) return { error: 'Please tell us where the event is.' }

  // Date is required, and must be a real calendar date that is not in the past
  // and not absurdly far out. A bad date is refused rather than quietly dropped
  // into `problems`, which is what it used to be: once the field is mandatory,
  // silently storing a record without it would defeat the point of asking.
  const rawDate = clean(input.date, 10)
  if (!rawDate) return { error: 'Please pick the date of your event.' }
  if (!DATE_RE.test(rawDate)) return { error: 'That date isn’t valid.' }
  const d = new Date(`${rawDate}T00:00:00Z`)
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const maxAhead = new Date(today)
  maxAhead.setUTCFullYear(maxAhead.getUTCFullYear() + 3)
  if (Number.isNaN(d.getTime())) return { error: 'That date isn’t valid.' }
  if (d < today) return { error: 'Please pick a date in the future.' }
  if (d > maxAhead) return { error: 'We can only book up to three years ahead.' }
  const date = rawDate

  // The one field here that is still optional alongside the notes. A malformed
  // value is dropped with a note rather than rejecting the whole enquiry: the
  // time is the least important thing on the form and losing a real lead over
  // it would be the worse trade. `HH:MM:SS` is trimmed to `HH:MM` first,
  // because a couple of browsers volunteer seconds.
  let time = ''
  const rawTime = clean(input.time, 8).slice(0, 5)
  if (rawTime) {
    if (TIME_RE.test(rawTime)) time = rawTime
    else problems.push('unparseable time discarded')
  }

  // Money is computed here, never accepted from the client — a posted total is
  // just a number an attacker chose.
  //
  // These MUST match TOPPING_PRICE / ICED_TEA_PRICE in src/lib/quote.ts. They
  // are duplicated rather than imported because this file is the authority and
  // must not depend on client code — but that independence is exactly what lets
  // them drift silently, and they did: the builder was moved to R15 a topping
  // while this stayed at R20, so for a while the customer was shown one figure
  // on screen and staff saw a different "Estimated total" in Airtable, with
  // nothing anywhere to say which was right. Change one, change the other.
  const TOPPING_PRICE = 15
  const ICED_TEA_PRICE = 45
  const toppingsPrice = totalToppings * TOPPING_PRICE
  const estimate =
    basePriceFor(pkg) + toppingsPrice + icedTeas * ICED_TEA_PRICE
  const rands = (n: number) => `R${n.toLocaleString('en-ZA')}`

  // The Dubai and Cream columns count topped cups rather than cups of that
  // flavour, so they are filled from `toppings`, not from the mix. The cups
  // themselves still count under Classic/Brownie — a topped cup is one of those
  // wearing a topping, and counting it twice would overstate the box.
  const counts = { classic: 0, brownie: 0, dubai: 0, cream: 0 }
  for (const [id, n] of Object.entries(mix)) counts[BUCKET[id]] += n
  counts.dubai = toppings.dubai ?? 0
  counts.cream = toppings.cream ?? 0

  const mixLine = Object.entries(mix)
    .map(([id, n]) => `${n}× ${FLAVOUR_LABEL[id]}`)
    .join(', ')

  const toppingLine = Object.entries(toppings)
    .map(([id, n]) => `${n}× ${TOPPING_LABEL[id]}`)
    .join(', ')

  const specialRequests = [
    `Occasion: ${rawOccasion}`,
    mixLine
      ? `${capped ? 'Cup mix' : 'Requested spread'}: ${mixLine}`
      : capped
        ? null
        : 'Spread: not specified — suggest a mix',
    toppingLine ? `Toppings (${rands(TOPPING_PRICE)} per cup): ${toppingLine}` : null,
    icedTeas > 0 ? `Iced teas: ${icedTeas}` : null,
    capped
      ? `Estimated total (cups only, excl. travel/setup/other fees): ${rands(estimate)} — final quote still to be emailed`
      : null,
    phone ? `Phone: ${phone}` : null,
    notes ? `\n${notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const PACKAGE_LABEL: Record<string, string> = {
    little: 'Little moments ',
    signature: 'Signature ',
    indulgent: 'Indulgent ',
  }

  // ── The allowlist. Only these columns are ever written. ──
  const fields: Json = {
    'Name': name,
    'Contact Details': [email, phone].filter(Boolean).join(' · '),
    'Email Address': email,
    'Source': 'Website',
    'Event type': eventType(rawOccasion),
    'Status': 'New Lead',
    'Date Captured': new Date().toISOString().slice(0, 10),
    'Estimated Headcount': guests,
    'Package selected': PACKAGE_LABEL[pkg],
    'Classic cups': counts.classic,
    'Brownie cups': counts.brownie,
    'Dubai topping cups': counts.dubai,
    'Cream topping cups': counts.cream,
    'Iced teas': icedTeas,
    // The toppings on their own, in rands. Written on every package — unlike
    // "Estimated total" below, which only the capped boxes get, because an
    // Indulgent spread has no base price to add it to. Toppings are the one part
    // of an Indulgent order that is already priced, so this is the figure staff
    // can use before the custom quote is written. On the capped boxes it is a
    // component of "Estimated total", not an extra on top of it.
    'Toppings price': toppingsPrice,
    // The exact answer, alongside the four-way "Event type" this collapses into.
    'Occasion': OCCASIONS.has(rawOccasion) ? rawOccasion : 'Something Else',
    'Special Requests': field(specialRequests, 4000, { multiline: true }),
    // Proof of consent: the tick, the moment, and the wording it was given
    // against. POPIA s11(2)(a) puts the burden of proving consent on us, and a
    // bare boolean proves nothing without a time and a version. Written here
    // rather than trusted from the client — the request only got this far
    // because `input.consent` was exactly `true`.
    'POPI Consent': true,
    // Terms of Use accepted and details confirmed correct. The same tick as
    // above — the wording the visitor agreed to covers both — but kept as its
    // own column so the base can still answer "did they accept the terms?"
    // without anyone having to know the two were merged in the UI. Written
    // here, never read from the client: the request only reached this line
    // because `input.consent` was exactly `true`.
    'T&Cs Agreement': true,
    'Consent captured': new Date().toISOString(),
    'Consent wording version': consentVersion,
  }
  // Only the capped boxes have a figure worth storing — an Indulgent spread is
  // priced around the event, so writing a base price there would read as a quote
  // nobody gave.
  if (capped) fields['Estimated total'] = estimate
  // Phone, date and venue are mandatory above, so they are always present by the
  // time we get here — no `if` needed. Only the optional start time is guarded.
  fields['Phone'] = phone
  fields['Event Date'] = date
  fields['Venue / Location'] = venue
  if (time) fields['Time'] = time

  return { fields, problems }
}

/* ─────────────────────────── Rate limiting ─────────────────────────── */

/**
 * Second line of defence only. The durable limit is the platform one declared
 * in `config.rateLimit` below, which runs at Netlify's edge before this function
 * is even invoked. This in-process counter catches bursts that share a warm
 * instance; it is intentionally not treated as a guarantee, because serverless
 * instances are ephemeral and do not share memory.
 */
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  HITS.set(ip, recent)
  // Bound the map so a spray of spoofed IPs cannot grow it without limit.
  if (HITS.size > 5_000) {
    for (const [k, v] of HITS) {
      if (v.every((t) => now - t >= WINDOW_MS)) HITS.delete(k)
      if (HITS.size <= 2_500) break
    }
  }
  return recent.length > MAX_PER_WINDOW
}

/* ─────────────────────────── Handler ─────────────────────────── */

async function handle(req: Request, context: Context): Promise<Response> {
  if (req.method === 'OPTIONS') return json(204, {})
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' })

  // Same-origin only. Browsers send Origin on cross-origin POSTs, so a missing
  // Origin is a non-browser client — allowed, since it cannot read the response
  // and everything below is validated anyway, but a *wrong* Origin is refused.
  const allowed = new Set(
    (process.env.ALLOWED_ORIGINS?.split(',').map((s) => s.trim()).filter(Boolean) ?? DEFAULT_ORIGINS)
      .concat(process.env.URL ?? [], process.env.DEPLOY_PRIME_URL ?? [])
  )
  const origin = req.headers.get('origin')
  if (origin && !allowed.has(origin)) {
    return json(403, { error: 'Forbidden.' })
  }

  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return json(415, { error: 'Unsupported content type.' })
  }

  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) return json(413, { error: 'That request is too large.' })

  const ip = context.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown'
  if (rateLimited(ip)) {
    return json(429, { error: 'Too many enquiries. Please try again in a minute.' }, { 'Retry-After': '60' })
  }

  // NAUGHTY_WRITE is the name the token is actually stored under; the original
  // AIRTABLE_WRITE_TOKEN is kept as a fallback so an existing deploy configured
  // under that name does not break. Either satisfies this check — a mismatch
  // between the two is silent in every way except a 503 on every enquiry, which
  // is a miserable thing to debug from the outside.
  const token = process.env.NAUGHTY_WRITE ?? process.env.AIRTABLE_WRITE_TOKEN
  if (!token) {
    console.error('No Airtable write token — set NAUGHTY_WRITE (or AIRTABLE_WRITE_TOKEN)')
    return json(503, { error: 'Enquiries are not configured yet.' })
  }

  // Read the body ourselves so an undeclared or lying Content-Length cannot
  // stream something huge into memory.
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'That request is too large.' })

  let input: Json
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    input = parsed as Json
  } catch {
    return json(400, { error: 'Invalid request.' })
  }

  // Honeypot: a field no human sees and no real browser fills.
  if (typeof input.company === 'string' && input.company.trim() !== '') {
    console.warn('enquiry rejected: honeypot filled', { ip })
    // 200 on purpose — a bot that learns it was caught just tries again.
    return json(200, { ok: true })
  }

  // Timing: the client stamps when the form was rendered.
  const elapsed = Date.now() - intIn(input.startedAt, 0, Number.MAX_SAFE_INTEGER, 0)
  if (intIn(input.startedAt, 0, Number.MAX_SAFE_INTEGER, 0) > 0 && elapsed < MIN_FILL_MS) {
    console.warn('enquiry rejected: submitted too fast', { ip, elapsed })
    return json(200, { ok: true })
  }

  const result = validate(input)
  if ('error' in result) return json(422, { error: result.error })
  if (result.problems.length) {
    console.warn('enquiry accepted with problems', { ip, problems: result.problems })
  }

  const upstream = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    // No typecast: every select value is already one this code chose from a
    // fixed list, so coercion could only ever paper over a bug. Note the flip
    // side — adding a package or cup here means adding the matching option in
    // the base too, or every submission 422s. That is what happened to
    // Signature, whose option the table was missing until it was added.
    body: JSON.stringify({ records: [{ fields: result.fields }] }),
    signal: AbortSignal.timeout(10_000),
  }).catch((e: unknown) => {
    console.error('Airtable request failed', e)
    return null
  })

  if (!upstream || !upstream.ok) {
    // Log the upstream detail; never return it — it names columns and ids.
    console.error('Airtable write failed', upstream?.status, await upstream?.text().catch(() => ''))
    return json(502, { error: 'We could not save that enquiry. Please try again shortly.' })
  }

  const data = (await upstream.json().catch(() => ({}))) as { records?: { id: string }[] }
  return json(200, { ok: true, id: data.records?.[0]?.id ?? null })
}

/**
 * Last line of defence. Any unexpected throw becomes a plain 500 with no
 * detail — a stack trace in a response body tells an attacker the runtime, the
 * file layout and often the shape of the data.
 */
export default async (req: Request, context: Context) => {
  try {
    return await handle(req, context)
  } catch (e) {
    console.error('unhandled error in /api/enquiry', e)
    return json(500, { error: 'Something went wrong. Please try again.' })
  }
}

export const config: Config = {
  path: '/api/enquiry',
  method: ['POST', 'OPTIONS'],
  // Enforced at Netlify's edge, before the function is invoked — this is the
  // limit that actually holds, since it does not depend on instance reuse.
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowSize: 60,
    windowLimit: 10,
  },
}
