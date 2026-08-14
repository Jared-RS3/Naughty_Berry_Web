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

/** The "Day of Week" dropdown carries the seven weekdays plus three choices that
 *  are not days at all: "Location" is how the sheet says "name the place instead
 *  of the day", "Off" is how it says the trailer isn't going out, and "TBA" is
 *  how it says a stop is coming but neither the day nor the place is settled. */
const LOCATION_OPTION = 'location'
const OFF_OPTION = 'off'
const TBA_OPTION = 'tba'

/** "Off" means there is no stop to point at — the callers hide their live
 *  location badge entirely rather than dressing the row up as an appearance. */
export function isDayOff(slot: ScheduleSlot): boolean {
  return slot.day.trim().toLowerCase() === OFF_OPTION
}

/**
 * The row that describes the trailer *right now*, which is not always the same
 * as the next stop. `pickNext` deliberately ignores anything already behind us,
 * but "Off" is set on the row the sheet is currently sitting on — and that row
 * goes stale the moment its date passes, which would quietly switch the badge
 * back on. So: the next stop if one is booked, otherwise the most recent row
 * behind us, otherwise an undated row (clearing the date is the other way a row
 * stops being an appearance).
 */
export function currentSlot(schedule: ScheduleSlot[]): ScheduleSlot | null {
  const next = pickNext(schedule)
  if (next) return next.slot

  const past = schedule
    .map((slot) => ({ slot, date: parseDate(slot.date) }))
    .filter((x): x is { slot: ScheduleSlot; date: Date } => x.date !== null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return past[0]?.slot ?? schedule[0] ?? null
}

/** Whether the sheet is currently saying the trailer isn't out. Answered off the
 *  whole schedule rather than one row so picking "Off" hides the live badge
 *  whatever the row's date says. */
export function isScheduleOff(schedule: ScheduleSlot[]): boolean {
  const slot = currentSlot(schedule)
  return slot ? isDayOff(slot) : false
}

/**
 * One-line answer for the hero pill, driven by the row's "Day of Week" dropdown.
 *
 * The dropdown is the switch between the pill's two sentences. A weekday means
 * the sheet is announcing *when* the next drop lands and the place isn't settled
 * yet, so the day is the news — it wins over the Event Name, which on those rows
 * is usually a working title. "Location" means the opposite: name the place, and
 * "Oranjezight Market" is what someone recognises, repeats and navigates to.
 *
 * "TBA" is a third answer: a stop is coming, but neither the day nor the place
 * is fixed yet. It is a status rather than a day, so it does not take the
 * "drops <day>" sentence — "Next stop drops TBA" is not a sentence — and it
 * deliberately outranks the Event Name, because a working title presented as
 * the answer would read as more settled than the sheet actually is.
 *
 * Either way the row's Venue / Location stays off the pill — it's a full street
 * address that would swamp it, and it's already the destination behind the tap.
 * Returns null when the row has neither a day nor a name (and whenever it's Off)
 * so the caller can render its own placeholder rather than an empty tag.
 */
export function stopHeadline(slot: ScheduleSlot): string | null {
  const day = slot.day.trim().toLowerCase()
  if (isDayOff(slot)) return null

  if (day === TBA_OPTION) return 'Next stop to be announced'

  if (day && day !== LOCATION_OPTION) return `Next stop drops ${slot.day.trim()}`

  const place = slot.eventName.trim()
  if (place) return `Next stop ${place}`
  return null
}

