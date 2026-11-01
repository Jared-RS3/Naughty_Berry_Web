import { useState, type FormEvent } from 'react'
import { normaliseEmail } from './email'

/**
 * Shared by the two newsletter sign-ups — the "You've got mail" envelope
 * (NewsletterEnvelope.tsx) and the section above the footer
 * (NewsletterSignup.tsx) — so they post the same way and agree on whether this
 * visitor is already on the list.
 *
 * Only a successful sign-up is remembered. Closing the envelope is not: it
 * comes back on the next load until the visitor actually subscribes.
 */

const STORAGE_KEY = 'nb-naughty-list'

/** Fired on window when either form signs someone up, so the other can step
 *  aside without a reload. */
export const SUBSCRIBED_EVENT = 'nb:subscribed'

export function isSubscribed(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    // Older builds also stored { dismissedAt } here; that no longer counts.
    return raw ? (JSON.parse(raw) as { subscribed?: unknown }).subscribed === true : false
  } catch {
    return false
  }
}

function markSubscribed() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ subscribed: true }))
  } catch {
    // Private mode or blocked storage — it just asks again next visit.
  }
  window.dispatchEvent(new Event(SUBSCRIBED_EVENT))
}

const FALLBACK_ERROR = 'We couldn’t add you just now. Please try again.'

/** Form state and submit for a sign-up posting to /api/subscribe
 *  (netlify/functions/subscribe.mts → Mailchimp). */
export function useNewsletterSignup(onSubscribed?: () => void) {
  const [startedAt] = useState(() => Date.now())
  const [email, setEmailValue] = useState('')
  // Honeypot — hidden from people, irresistible to bots.
  const [company, setCompany] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const setEmail = (value: string) => {
    setEmailValue(value)
    if (error) setError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (sending || done) return
    const value = normaliseEmail(email)
    if (!value) {
      setError('That email doesn’t look quite right.')
      return
    }
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, company, startedAt }),
        signal: AbortSignal.timeout(12_000),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: unknown }
        // Only show a short plain-string message; React escapes it either way.
        const message = typeof body.error === 'string' && body.error.length <= 200 ? body.error : null
        throw new Error(message ?? FALLBACK_ERROR)
      }
      setDone(true)
      markSubscribed()
      onSubscribed?.()
    } catch (err) {
      setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : FALLBACK_ERROR)
    } finally {
      setSending(false)
    }
  }

  return { email, setEmail, company, setCompany, error, sending, done, submit }
}
