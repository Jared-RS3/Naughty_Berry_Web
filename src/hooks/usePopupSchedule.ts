import { useEffect, useState } from 'react'

export interface ScheduleSlot {
  day: string
  date: string
  location: string
  area: string
  time: string
  confirmed: boolean
}

const BASE_ID = 'appIfLyWzGV0npV6U'
const TABLE_ID = 'tbl8iQOpkuoaTa9Aj'
const VIEW_ID  = 'viwaL94vAoYlnNbc8'

export function usePopupSchedule() {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = import.meta.env.VITE_AIRTABLE_TOKEN

    if (!token) {
      setError('VITE_AIRTABLE_TOKEN is not set')
      setLoading(false)
      return
    }

    fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?view=${VIEW_ID}&sort[0][field]=Order&sort[0][direction]=asc`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then((r) => {
        if (!r.ok) throw new Error(`Airtable API error ${r.status}: ${r.statusText}`)
        return r.json()
      })
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = (data.records ?? []).map((r: any) => ({
          day:       r.fields.Day       ?? '',
          date:      r.fields.Date      ?? '',
          location:  r.fields.Location  ?? '',
          area:      r.fields.Area      ?? '',
          time:      r.fields.Time      ?? '',
          confirmed: r.fields.Confirmed ?? false,
        }))
        if (mapped.length === 0) throw new Error('No records returned from Airtable')
        setSchedule(mapped)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { schedule, loading, error }
}
