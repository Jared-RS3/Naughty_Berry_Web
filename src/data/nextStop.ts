/**
 * ── THE HERO "NEXT STOP" TAG — EDIT HERE ────────────────────────────────────
 *
 * This file is the only place the hero tag, the NextStop panel and the footer
 * map card get their "where's the trailer next?" answer from. Nothing is
 * fetched from Airtable — change the values below, commit, and Netlify redeploys.
 *
 * Turn the tag on/off: flip SHOW_NEXT_STOP between true and false.
 *
 * What the tag says is decided by `day`:
 *   • a weekday, e.g. 'Saturday'  → "Next stop drops Saturday"
 *   • 'Location'                  → "Next stop <eventName>"
 *   • 'TBA'                       → "Next stop to be announced"
 *
 * `location` is the address the tag opens in Google Maps when tapped.
 * `date` is YYYY-MM-DD; leave it '' if you don't want a date shown.
 */

export const SHOW_NEXT_STOP = true

export const NEXT_STOP = {
  eventName: 'To be announced',
  day: 'Location',
  date: '',
  location: '',
  area: '',
  startTime: '',
  endTime: '',
  instagramAccount: '',
  notes: '',
}
