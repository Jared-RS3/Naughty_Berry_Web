import { motion } from 'framer-motion'
import { MapPin, Clock, Navigation, CalendarDays, Instagram } from 'lucide-react'
import { usePopupSchedule, type ScheduleSlot } from '../hooks/usePopupSchedule'

/**
 * The answer to "where are you this weekend?", parked directly under the hero
 * so nobody has to scroll the whole page to find it. Same Airtable rows as
 * FindUs — this shows only the next one, FindUs shows the schedule — so the
 * two can never disagree about where the trailer is.
 */

const ARCHIVO = "'Archivo Black', system-ui, sans-serif"
const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Airtable date fields arrive as `YYYY-MM-DD`. Parsing those through
 *  `new Date()` lands on UTC midnight, which reads as the previous day in any
 *  timezone behind UTC — so build the date in local time instead. */
function parseDate(raw: string): Date | null {
  if (!raw) return null
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw)
  if (ymd) return new Date(+ymd[1], +ymd[2] - 1, +ymd[3])
  const t = new Date(raw).getTime()
  return Number.isNaN(t) ? null : new Date(t)
}

function startOfToday(): number {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Soonest stop that hasn't happened yet. Today still counts — the trailer is
 *  out there right now, and that is the single most useful thing to say. */
function pickNext(schedule: ScheduleSlot[]): { slot: ScheduleSlot; date: Date | null } | null {
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
function relativeLabel(date: Date): string {
  const days = Math.round((date.getTime() - startOfToday()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  const weekday = date.toLocaleDateString('en-ZA', { weekday: 'long' })
  if (days < 7) return `This ${weekday}`
  if (days < 14) return `Next ${weekday}`
  return weekday
}

function mapsHref(slot: ScheduleSlot): string {
  const query = [slot.location, slot.area, 'Cape Town'].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Shared shell so the loading, empty and loaded states are literally the same
 *  panel — the section never changes shape as the data lands. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section id="next-stop" className="relative bg-[#FFDCEA] px-6 pb-16 pt-2 lg:px-10 lg:pb-20 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="nb-card-berry relative mx-auto max-w-7xl overflow-hidden px-7 py-8 sm:px-10 sm:py-10"
      >
        {/* Warm highlight so the flat berry slab still has some depth to it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/12 blur-3xl"
        />
        <div className="relative">{children}</div>
      </motion.div>
    </section>
  )
}

export default function NextStop() {
  const { schedule, loading, error } = usePopupSchedule()
  const next = pickNext(schedule)

  if (loading) {
    return (
      <Panel>
        <div className="animate-pulse space-y-4">
          <div className="h-3 w-28 rounded-full bg-white/25" />
          <div className="h-9 w-2/3 rounded-full bg-white/20" />
          <div className="h-3 w-40 rounded-full bg-white/15" />
        </div>
      </Panel>
    )
  }

  // Nothing booked (or Airtable is unreachable) — keep the slot on the page and
  // point at the place the drops actually happen.
  if (error || !next) {
    return (
      <Panel>
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">
              Next stop
            </p>
            <p
              className="mt-3 uppercase leading-[1.05] text-white text-[clamp(1.35rem,3.4vw,2.1rem)]"
              style={{ fontFamily: ARCHIVO }}
            >
              Still being locked in
            </p>
            <p className="mt-2 text-sm text-white/75">
              Locations drop every Thursday on Instagram.
            </p>
          </div>

          <a
            href="https://www.instagram.com/naughtyberrycpt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#E8176D] transition-transform hover:scale-[1.03]"
          >
            <Instagram size={15} />
            Follow for drops
          </a>
        </div>
      </Panel>
    )
  }

  const { slot, date } = next
  const when = date ? relativeLabel(date) : slot.day
  const fullDate = date
    ? date.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })
    : slot.date
  const time = [slot.startTime, slot.endTime].filter(Boolean).join(' – ')

  return (
    <Panel>
      <div className="grid gap-9 lg:grid-cols-[1.4fr_1fr] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              Next stop
            </span>

            <span className="rounded-full bg-white px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#E8176D]">
              {when}
            </span>
          </div>

          {slot.eventName && (
            <p className="mt-5 text-sm font-semibold text-white/80">{slot.eventName}</p>
          )}

          <h2
            className="mt-2 uppercase leading-[1.02] text-white text-[clamp(1.7rem,4.4vw,3rem)]"
            style={{ fontFamily: ARCHIVO }}
          >
            {slot.location}
          </h2>

          {slot.area && (
            <p className="mt-3 flex items-center gap-2 text-white/80">
              <MapPin size={16} className="shrink-0" aria-hidden="true" />
              {slot.area}
            </p>
          )}
        </div>

        <div className="lg:pb-1">
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white">
              <CalendarDays size={15} aria-hidden="true" />
              {fullDate}
            </span>
            {time && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white">
                <Clock size={15} aria-hidden="true" />
                {time}
              </span>
            )}
          </div>

          {slot.notes && <p className="mt-4 text-sm text-white/70">{slot.notes}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={mapsHref(slot)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-[#E8176D] transition-transform hover:scale-[1.03]"
            >
              <Navigation size={14} />
              Directions
            </a>

            <a
              href="#findus"
              className="inline-flex items-center gap-2 rounded-full border border-white/45 px-7 py-3.5 text-[12px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/12"
            >
              All stops
            </a>
          </div>
        </div>
      </div>
    </Panel>
  )
}
