import { NEXT_STOP, SHOW_NEXT_STOP } from '../data/nextStop'

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
 * The schedule is hardcoded in src/data/nextStop.ts — no network request, so
 * no Airtable reads (each one was costing money on every page view).
 *
 * Switched off, it becomes a single undated "Off" row: the hero hides its pill
 * (isScheduleOff) and NextStop / the footer fall back to their "nothing booked"
 * state, since pickNext finds no date to point at.
 */
const SCHEDULE: ScheduleSlot[] = [
  SHOW_NEXT_STOP
    ? { ...NEXT_STOP, instagramStatus: '', isThisWeek: true }
    : { ...NEXT_STOP, day: 'Off', date: '', instagramStatus: '', isThisWeek: false },
]

/** Same shape the components already consume, so none of them had to change. */
export function usePopupSchedule() {
  return { schedule: SCHEDULE, loading: false, error: null as string | null }
}
