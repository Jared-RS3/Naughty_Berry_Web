import type { ScheduleSlot } from '../hooks/usePopupSchedule'

/**
 * Everything needed to answer "where is the trailer next?" from a raw Airtable
 * schedule. Lives outside any component because three places on the page ask
 * the question — the hero ticker, the NextStop panel and the footer map card —
 * and they must never disagree about the answer.
 */

/** Airtable date fields arrive as `YYYY-MM-DD`. Parsing those through
 *  `new Date()` lands on UTC midnight, which reads as the previous day in any
 *  timezone behind UTC — so build the date in local time instead. */
export function parseDate(raw: string): Date | null {
  if (!raw) return null
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3])
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? null : new Date(t)
}

export function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export interface NextStop {
  slot: ScheduleSlot
  date: Date | null
}

/** Soonest stop that hasn't happened yet. Today still counts — the trailer is
 *  out there right now, and that is the single most useful thing to say. */
export function pickNext(schedule: ScheduleSlot[]): NextStop | null {
  const today = startOfToday()

  const dated = schedule
    .map((slot) => ({ slot, date: parseDate(slot.date) }))
    .filter((x): x is { slot: ScheduleSlot; date: Date } => x.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const upcoming = dated.find((x) => x.date.getTime() >= today)
  if (upcoming) return upcoming

  // No parseable future date — fall back to whatever the sheet flags as this
  // week's event rather than showing nothing.
  const flagged = schedule.find((s) => s.isThisWeek)
  return flagged ? { slot: flagged, date: parseDate(flagged.date) } : null
}

/** "Today" and "Tomorrow" carry more urgency than a date, and within the week
 *  the weekday is what people actually plan around. */
export function relativeLabel(date: Date): string {
  const days = Math.round((date.getTime() - startOfToday()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  const weekday = date.toLocaleDateString('en-ZA', { weekday: 'long' })
  if (days < 7) return `This ${weekday}`
  if (days < 14) return `Next ${weekday}`
  return weekday
}

/** Short "Saturday · 9:00–14:00" line for the compact cards. */
export function shortWhen(next: NextStop): string {
  const day = next.date
    ? next.date.toLocaleDateString('en-ZA', { weekday: 'long' })
    : next.slot.day
  const time = [next.slot.startTime, next.slot.endTime].filter(Boolean).join('–')
  return [day, time].filter(Boolean).join(' · ')
}

export function mapsHref(slot: ScheduleSlot): string {
  // Venue / Location often already holds the full street address, down to the
  // city and postal code. Area and "Cape Town" are there to disambiguate a bare
  // venue name — appending them to a complete address just hands the geocoder
  // the same city twice, so drop whichever the address already covers.
  const parts = [slot.location, slot.area, 'Cape Town'].filter(Boolean)
  const address = parts[0].toLowerCase()
  const query = parts
    .filter((part, i) => i === 0 || !address.includes(part.toLowerCase()))
    .join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** The "Day of Week" dropdown carries the seven weekdays plus this one extra
 *  choice, which is not a day at all — it is how the sheet says "name the place
 *  instead of the day". */
const LOCATION_OPTION = 'location'

/**
 * One-line answer for the hero pill, driven by the row's "Day of Week" dropdown.
 *
 * A weekday means the trailer is booked but not out yet, so the day is the
 * useful thing to say. Picking "Location" instead means the row is describing
 * where it is rather than when — then the stop is better named than dated, so
 * the row's Event Name carries the line. Null when the row has neither, so the
 * caller can fall back rather than render "Open at ".
 */
export function stopHeadline(slot: ScheduleSlot): string | null {
  const day = slot.day.trim()
  if (day && day.toLowerCase() !== LOCATION_OPTION) return `Next stop drops ${day}`
  if (slot.eventName) return `Open at ${slot.eventName}`
  return null
}
