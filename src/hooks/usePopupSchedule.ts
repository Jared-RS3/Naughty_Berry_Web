import { useEffect, useState } from 'react'

export interface ScheduleSlot {
  eventName: string
  date: string
  day: string
  location: string
  area: string
  startTime: string
  endTime: string
  instagramStatus: string
  instagramAccount: string
  notes: string
  isThisWeek: boolean
}

/**
 * The schedule comes from our own endpoint, never from Airtable directly.
 *
 * This used to call api.airtable.com with VITE_AIRTABLE_TOKEN. Vite inlines
 * anything prefixed VITE_ into the shipped bundle as clear text, and an
 * Airtable token is scoped to a BASE rather than a table — so that token could
 * read the Enquiries table too, meaning every customer name, email and phone
 * number was one devtools tab away. netlify/functions/schedule.mts now holds
 * the token and returns a fixed, allowlisted shape.
 *
 * The endpoint is CDN-cached, so this is also what stops a traffic spike from
 * becoming an Airtable rate-limit outage.
 */
const ENDPOINT = '/api/schedule'

/** Airtable is not this component's problem, but a hung request is: without a
 *  ceiling the sections that show the schedule spin forever. */
const TIMEOUT_MS = 10_000

/** One in-flight request per page load, shared by every consumer. NextStop (top
 *  of the page) and FindUs (bottom) both want the same rows, and they must show
 *  the same thing — two fetches would also mean two chances to disagree. */
let pending: Promise<ScheduleSlot[]> | null = null

/** The server already validated and bounded every field; this only re-asserts
 *  the shape, because a response is still input. */
function toSlot(row: Record<string, unknown>): ScheduleSlot {
  const s = (v: unknown) => (typeof v === 'string' ? v : '')
  return {
    eventName: s(row.eventName),
    date: s(row.date),
    day: s(row.day),
    location: s(row.location),
    area: s(row.area),
    startTime: s(row.startTime),
    endTime: s(row.endTime),
    instagramStatus: s(row.instagramStatus),
    instagramAccount: s(row.instagramAccount),
    notes: s(row.notes),
    isThisWeek: row.isThisWeek === true,
  }
}

function loadSchedule(): Promise<ScheduleSlot[]> {
  return fetch(ENDPOINT, {
    headers: { Accept: 'application/json' },
    // The schedule is hand-edited minutes before a pop-up and the whole point
    // of the pill is to be current, so a page load must always ask rather than
    // re-use whatever this browser happened to store earlier. The endpoint is
    // still CDN-cached for a few seconds, which is what protects Airtable — so
    // this costs a conditional request, not an Airtable read.
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
    .then(async (r) => {
      if (!r.ok) {
        // The endpoint returns a safe, human-readable message; it never
        // contains upstream detail, so it is fine to surface.
        const body = (await r.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `Schedule unavailable (${r.status})`)
      }
      return r.json() as Promise<unknown>
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('Schedule unavailable')
      const mapped = data
        .filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
        .map(toSlot)
      if (mapped.length === 0) throw new Error('No pop-ups scheduled right now')
      return mapped
    })
}

export function usePopupSchedule() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    // A rejected promise stays cached on purpose: if Airtable is down, every
    // section should say so together rather than retry-storm on each mount.
    pending ??= loadSchedule()

    pending
      .then((rows) => alive && setSchedule(rows))
      .catch((e: Error) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [])

  return { schedule, loading, error }
}
