import { useEffect, useState } from 'react'

export interface ScheduleSlot {
  day: string
  date: string
  location: string
  area: string
  time: string
  confirmed: boolean
}

const FALLBACK: ScheduleSlot[] = [
  {
    day: 'Friday',
    date: 'Updated weekly',
    location: 'Follow @naughtyberrycpt for exact location',
    area: 'Cape Town CBD Area',
    time: '17:00 – 21:00',
    confirmed: false,
  },
  {
    day: 'Saturday',
    date: 'Updated weekly',
    location: 'Cape Town Market / Pop-up TBC',
    area: 'Atlantic Seaboard / Southern Suburbs',
    time: '10:00 – 16:00',
    confirmed: false,
  },
  {
    day: 'Sunday',
    date: 'Updated weekly',
    location: 'Neighbourhood Market / Design Fair',
    area: 'Cape Town area TBC',
    time: '09:00 – 14:00',
    confirmed: false,
  },
]

const BASE_ID = 'appIfLyWzGV0npV6U'
const TABLE_ID = 'tbl8iQOpkuoaTa9Aj'

export function usePopupSchedule() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = import.meta.env.VITE_AIRTABLE_TOKEN
    if (!token) {
      setLoading(false)
      return
    }

    fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?sort[0][field]=Order&sort[0][direction]=asc`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Airtable ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (!data.records?.length) return
        setSchedule(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.records.map((r: any) => ({
            day:       r.fields.Day       ?? '',
            date:      r.fields.Date      ?? 'Updated weekly',
            location:  r.fields.Location  ?? '',
            area:      r.fields.Area      ?? '',
            time:      r.fields.Time      ?? '',
            confirmed: r.fields.Confirmed ?? false,
          }))
        )
      })
      .catch(() => { /* silently fall back to hardcoded data */ })
      .finally(() => setLoading(false))
  }, [])

  return { schedule, loading }
}
