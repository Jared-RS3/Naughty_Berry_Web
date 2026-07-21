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

const BASE_ID = 'appIfLyWzGV0npV6U'
const TABLE_ID = 'tbl8iQOpkuoaTa9Aj'
const VIEW_ID  = 'viwaL94vAoYlnNbc8'

/** One in-flight request per page load, shared by every consumer. NextStop (top
 *  of the page) and FindUs (bottom) both want the same rows, and they must show
 *  the same thing — two fetches would also mean two chances to disagree. */
let pending: Promise<ScheduleSlot[]> | null = null

function loadSchedule(): Promise<ScheduleSlot[]> {
  const token = import.meta.env.VITE_AIRTABLE_TOKEN
  if (!token) return Promise.reject(new Error('VITE_AIRTABLE_TOKEN is not set'))

  return fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?view=${VIEW_ID}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
    .then(async (r) => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        const msg = body?.error?.message ?? r.statusText
        throw new Error(`Airtable API error ${r.status}: ${msg}`)
      }
      return r.json()
    })
    .then((data) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: ScheduleSlot[] = (data.records ?? []).map((r: any) => ({
        eventName:        r.fields['Event Name']                 ?? '',
        date:             r.fields['Date']                       ?? '',
        day:              r.fields['Day of Week']                ?? '',
        location:         r.fields['Venue / Location']           ?? '',
        area:             r.fields['Area']                       ?? '',
        startTime:        r.fields['Start Time']                 ?? '',
        endTime:          r.fields['End Time']                   ?? '',
        instagramStatus:  r.fields['Instagram Update Status']    ?? '',
        instagramAccount: r.fields['Instagram Account to Follow'] ?? '',
        notes:            r.fields['Notes']                      ?? '',
        isThisWeek:       r.fields["Is This Week's Event?"]      ?? false,
      }))
      if (mapped.length === 0) throw new Error('No records returned from Airtable')
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
