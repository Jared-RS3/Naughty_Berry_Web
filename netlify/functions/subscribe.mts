import { createHash } from 'node:crypto'
import type { Config, Context } from '@netlify/functions'
import { normaliseEmail } from '../../src/lib/email'

/**
 * Adds a newsletter sign-up ("the naughty list") to the Mailchimp audience.
 *
 * This goes through Mailchimp's Marketing API, not the embedded-form endpoint
 * (`list-manage.com/subscribe/post-json`): that one sits behind Mailchimp's
 * bot protection and answers server-side requests with a 404, so it can only
 * be called from a visitor's browser via JSONP — which would mean letting
 * list-manage.com into the CSP's script-src. The API is the supported
 * server-to-server route.
 *
 * The browser never holds the API key — it can read, export and email every
 * contact on the account, so it lives only in the Netlify environment and
 * this function is the one thing that uses it. Airtable is not involved: the
 * only Airtable call the site makes is enquiry.mts.
 *
 * An address that is already on the list is a success, not an error, so the
 * form never tells a visitor — or anyone typing someone else's address —
 * whether that email was already known. Someone who unsubscribed stays
 * unsubscribed: `status_if_new` only applies to addresses Mailchimp hasn't seen.
 *
 * Input is held to an allow-list, never cleaned up and passed on: the body
 * must be a small JSON object with only the fields the form sends, and the
 * email must pass normaliseEmail (src/lib/email.ts). There is no database or
 * SQL anywhere in this path — the address only travels inside JSON.stringify,
 * and the URL carries its MD5 hash, never the address itself.
 *
 * Required Netlify environment variables:
 *   MAILCHIMP_API_KEY     — Mailchimp → Profile → Extras → API keys. Ends in
 *                           the datacenter, e.g. "…-us18".
 *   MAILCHIMP_AUDIENCE_ID — Audience → Settings → Audience name and defaults
 *                           → Audience ID (10 hex characters).
 * Optional:
 *   ALLOWED_ORIGINS       — comma-separated; defaults to the site
 */

/** Mailchimp audience IDs are 10 hex characters. Checked so a mistyped
 *  variable can't put anything else into the API path. */
const AUDIENCE_ID_RE = /^[0-9a-f]{10}$/

/** The only body fields the form sends; anything else is refused. */
const ALLOWED_FIELDS = new Set(['email', 'company', 'startedAt'])

/** 'subscribed' adds people straight away, matching the "You're on the list"
 *  stamp. 'pending' sends Mailchimp's confirmation email first (double opt-in)
 *  — switch the stamp to "Check your inbox" if you change this. */
const STATUS_IF_NEW: 'subscribed' | 'pending' = 'subscribed'

const DEFAULT_ORIGINS = [
  'https://naughtyberry.co.za',
  'https://www.naughtyberry.co.za',
]

/** An email and two small fields; anything bigger is a probe. */
const MAX_BODY_BYTES = 1024

/** A form completed faster than this was not completed by a person. */
const MIN_FILL_MS = 1_500

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

/** Blank is absent: a variable created in the Netlify dashboard but left empty
 *  must read as missing, not as "", and a pasted key's trailing newline goes. */
const env = (name: string): string | undefined => {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

async function handle(req: Request, context: Context): Promise<Response> {
  if (req.method === 'OPTIONS') return json(204, {})
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' })

  const allowed = new Set(
    (env('ALLOWED_ORIGINS')?.split(',').map((s) => s.trim()).filter(Boolean) ?? DEFAULT_ORIGINS)
      .concat(process.env.URL ?? [], process.env.DEPLOY_PRIME_URL ?? [])
  )
  // The Netlify CLI (functions:serve / netlify dev) sets NETLIFY_DEV; the live
  // site never does. Locally the page comes from localhost or a Codespaces URL,
  // neither of which is a site origin.
  const origin = req.headers.get('origin')
  if (origin && !allowed.has(origin) && process.env.NETLIFY_DEV !== 'true') {
    return json(403, { error: 'Forbidden.' })
  }

  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) {
    return json(415, { error: 'Unsupported content type.' })
  }

  const apiKey = env('MAILCHIMP_API_KEY')
  const audienceId = env('MAILCHIMP_AUDIENCE_ID')?.toLowerCase()
  const dc = apiKey?.match(/-([a-z]+\d+)$/)?.[1]
  if (!apiKey || !dc || !audienceId || !AUDIENCE_ID_RE.test(audienceId)) {
    console.error('Newsletter not configured — set MAILCHIMP_API_KEY (ending in e.g. -us18) and MAILCHIMP_AUDIENCE_ID')
    return json(503, { error: 'Sign-ups are not open just yet. Try again soon x' })
  }

  // Refuse an oversized body on its declared length before reading any of it,
  // then on its real length in case the header lied.
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) {
    return json(413, { error: 'That request is too large.' })
  }
  const raw = await req.text()
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json(413, { error: 'That request is too large.' })

  let input: Json
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('not an object')
    input = parsed as Json
  } catch {
    return json(400, { error: 'Invalid request.' })
  }
  if (Object.keys(input).some((key) => !ALLOWED_FIELDS.has(key))) {
    return json(400, { error: 'Invalid request.' })
  }

  const ip = context.ip || 'unknown'

  // Honeypot and timing: 200 on purpose — a bot that learns it was caught
  // just tries again.
  if (typeof input.company === 'string' && input.company.trim() !== '') {
    console.warn('subscribe rejected: honeypot filled', { ip })
    return json(200, { ok: true })
  }
  const startedAt = Number.isFinite(input.startedAt) ? (input.startedAt as number) : 0
  if (startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    console.warn('subscribe rejected: submitted too fast', { ip })
    return json(200, { ok: true })
  }

  const email = normaliseEmail(input.email)
  if (!email) return json(422, { error: 'That email doesn’t look quite right.' })

  // PUT on the member's hash is an upsert: it adds new addresses and quietly
  // succeeds for ones already on the audience.
  const hash = createHash('md5').update(email).digest('hex')
  const upstream = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members/${hash}`, {
    method: 'PUT',
    headers: {
      Authorization: `Basic ${Buffer.from(`naughtyberry:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: STATUS_IF_NEW,
    }),
    signal: AbortSignal.timeout(8_000),
  }).catch((e: unknown) => {
    console.error('Mailchimp request failed', e)
    return null
  })

  if (!upstream || !upstream.ok) {
    const detail = (await upstream?.json().catch(() => null)) as { title?: string; detail?: string } | null
    // Log the detail, never return it — Mailchimp errors name the audience.
    console.error('Mailchimp subscribe failed', upstream?.status, detail?.title, detail?.detail)
    // Addresses Mailchimp refuses to re-add (unsubscribed, cleaned, deleted on
    // request) look like a success, for the same reason duplicates do.
    if (detail?.title === 'Member In Compliance State' || detail?.title === 'Forgotten Email Not Subscribed') {
      return json(200, { ok: true })
    }
    if (detail?.title === 'Invalid Resource' && /email|fake|valid/i.test(detail.detail ?? '')) {
      return json(422, { error: 'That email doesn’t look quite right.' })
    }
    return json(502, { error: 'We couldn’t add you just now. Please try again shortly.' })
  }

  return json(200, { ok: true })
}

export default async (req: Request, context: Context) => {
  try {
    return await handle(req, context)
  } catch (e) {
    console.error('unhandled error in /api/subscribe', e)
    return json(500, { error: 'Something went wrong. Please try again.' })
  }
}

export const config: Config = {
  path: '/api/subscribe',
  method: ['POST', 'OPTIONS'],
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowSize: 60,
    windowLimit: 5,
  },
}
