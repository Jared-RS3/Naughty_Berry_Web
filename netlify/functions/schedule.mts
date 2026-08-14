import type { Config } from '@netlify/functions'

/**
 * Serves the pop-up schedule to the browser, reading it from Airtable here
 * rather than from the visitor's device.
 *
 * ── Why this function exists ────────────────────────────────────────────────
 * The schedule used to be fetched straight from api.airtable.com by
 * src/hooks/usePopupSchedule.ts, using VITE_AIRTABLE_TOKEN — and anything
 * prefixed VITE_ is inlined into the JavaScript bundle by Vite, in clear text,
 * for anyone who opens devtools or reads the deployed asset.
 *
 * That was defended as "it is only a read token", which understates it in two
 * ways:
 *
 *   1. An Airtable personal access token is scoped to a BASE, not to a table.
 *      A token that can read the Events table can read every other table in
 *      appIfLyWzGV0npV6U — including Enquiries, which holds customer names,
 *      email addresses and phone numbers. A published read token is therefore
 *      a published customer list, whatever it was intended for.
 *   2. It is a free API quota for whoever finds it. Airtable rate-limits per
 *      base, so somebody else's script can exhaust the limit and take the
 *      site's schedule down as a side effect.
 *
 * So the browser now talks only to this endpoint, the token lives only in the
 * Netlify environment, and the response is a fixed shape this file builds — not
 * whatever Airtable happened to return.
 *
 * ── Why the response is remapped rather than proxied ────────────────────────
 * Returning Airtable's JSON verbatim would leak record ids, field ids and any
 * column later added to that table (an internal note, a cost, a phone number)
 * the moment somebody adds it. The mapping below is an allowlist: exactly the
 * eleven fields the UI renders, nothing else, and adding a column to Airtable
 * changes nothing here until someone deliberately adds it.
 *
 * Required Netlify environment variables:
 *   NAUGHTY_READ  — PAT with data.records:read (AIRTABLE_READ_TOKEN accepted
 *                   as a fallback name for the same kind of token)
 */

const BASE_ID = process.env.AIRTABLE_BASE_ID ?? 'appIfLyWzGV0npV6U'
const TABLE_ID = process.env.AIRTABLE_EVENTS_TABLE ?? 'tbl8iQOpkuoaTa9Aj'
const VIEW_ID = process.env.AIRTABLE_EVENTS_VIEW ?? 'viwaL94vAoYlnNbc8'

/**
 * How long the CDN may serve a cached copy, and how long it may keep serving a
 * stale one while it refreshes in the background.
 *
 * This is the line between "we got featured by a big account" and "Airtable
 * rate-limited us and the site says our schedule is unavailable" — but this
 * table gets hand-edited from the road right before or during a pop-up, so
 * editing a row and refreshing the page has to actually show the edit.
 *
 * Deliberately no `stale-while-revalidate`: it lets the edge keep answering
 * with the OLD value while it refreshes behind the scenes, so the person who
 * just made the edit refreshes and still sees the previous one. That is the
 * single thing that makes the pill feel frozen, and it is not worth the
 * saved millisecond here. Without it the worst case is `s-maxage` — 10s —
 * after which the edge revalidates before answering.
 *
 * 10s still collapses a traffic spike into at most ~6 Airtable reads per
 * minute per edge node, which is nowhere near Airtable's 5-requests-per-second
 * limit. `stale-if-error` is about outages, not freshness, so it stays long:
 * during an actual Airtable failure, yesterday's schedule beats no schedule.
 */
const CACHE = 'public, max-age=0, s-maxage=10, stale-if-error=86400'

/** Airtable is not allowed to hang this function. */
const UPSTREAM_TIMEOUT_MS = 8_000

/** A schedule this long means something is wrong upstream, not a busy month. */
const MAX_RECORDS = 200

type Json = Record<string, unknown>

const json = (status: number, body: Json | Json[], cache: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cache,
      'X-Content-Type-Options': 'nosniff',
    },
  })

/**
 * Airtable cells are whatever someone typed into them, and they land in the
 * DOM. React escapes them on render, so this is not the XSS control — it is
 * the "a stray control character or a 40 kB paste must not reach the browser"
 * control. Strings only, bounded length, no control characters.
 */
function text(value: unknown, max = 200): string {
  if (typeof value === 'number') return String(value)
  if (typeof value !== 'string') return ''
  return value
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

const bool = (value: unknown): boolean => value === true

/** The allowlist. Exactly what the UI renders, and nothing else. */
function mapRecord(fields: Json) {
  return {
    eventName: text(fields['Event Name']),
    date: text(fields['Date'], 40),
    day: text(fields['Day of Week'], 20),
    location: text(fields['Venue / Location']),
    area: text(fields['Area'], 80),
    startTime: text(fields['Start Time'], 20),
    endTime: text(fields['End Time'], 20),
    instagramStatus: text(fields['Instagram Update Status'], 40),
    instagramAccount: text(fields['Instagram Account to Follow'], 80),
    notes: text(fields['Notes'], 500),
    isThisWeek: bool(fields["Is This Week's Event?"]),
  }
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return json(405, { error: 'Method not allowed.' }, 'no-store')
  }

  // NAUGHTY_READ is the intended name; AIRTABLE_READ_TOKEN is accepted as an
  // alternate name for the same kind of token. Deliberately no fallback to a
  // write-scoped token: Airtable rejects a write token on a read call with the
  // same 403 it gives a wrong token, which turned a one-line "not configured"
  // fix into an opaque 502 the one time this actually happened.
  const token = process.env.NAUGHTY_READ ?? process.env.AIRTABLE_READ_TOKEN

  if (!token) {
    console.error('No Airtable read token — set NAUGHTY_READ')
    return json(503, { error: 'Schedule is not configured.' }, 'no-store')
  }

  const url =
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}` +
    `?view=${encodeURIComponent(VIEW_ID)}&maxRecords=${MAX_RECORDS}`

  const upstream = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  }).catch((e: unknown) => {
    console.error('Airtable schedule request failed', e)
    return null
  })

  if (!upstream || !upstream.ok) {
    // Log the detail, never return it — Airtable's errors name base and table
    // ids, and a 401 body tells an attacker exactly which token is wrong.
    console.error('Airtable schedule read failed', upstream?.status)
    // 502 with no cache: the edge should retry rather than pin a failure, and
    // `stale-if-error` above lets it keep serving the last good copy meanwhile.
    return json(502, { error: 'Schedule is temporarily unavailable.' }, 'no-store')
  }

  const data = (await upstream.json().catch(() => null)) as { records?: { fields?: Json }[] } | null
  if (!data || !Array.isArray(data.records)) {
    console.error('Airtable schedule returned an unexpected shape')
    return json(502, { error: 'Schedule is temporarily unavailable.' }, 'no-store')
  }

  const rows = data.records
    .map((r) => mapRecord(r.fields ?? {}))
    // A row with no venue and no name is a blank line someone left in the
    // table; it would render as an empty card.
    .filter((r) => r.eventName || r.location)

  return json(200, rows, CACHE)
}

export const config: Config = {
  path: '/api/schedule',
  method: ['GET'],
  // Generous next to the enquiry endpoint: this is a cacheable read that every
  // visitor triggers once, so the limit is here to stop a scraper looping it,
  // not to police normal browsing. Most hits never reach the function at all
  // because the edge cache answers them.
  rateLimit: {
    action: 'rate_limit',
    aggregateBy: 'ip',
    windowSize: 60,
    windowLimit: 60,
  },
}
