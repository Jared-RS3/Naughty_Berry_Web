import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { EMAIL_MAX } from '../lib/email'
import { useNewsletterSignup } from '../lib/newsletter'

const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * The always-there newsletter sign-up at the bottom of the contact section,
 * for anyone who closed the envelope or scrolled past it. Same list, same
 * /api/subscribe as NewsletterEnvelope — see src/lib/newsletter.ts.
 */
export default function NewsletterSignup() {
  const { email, setEmail, company, setCompany, error, sending, done, submit } = useNewsletterSignup()

  return (
    <motion.div
      id="newsletter"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="relative mt-9 overflow-hidden rounded-[25px] border border-[#E8176D]/12 bg-white/35 px-6 py-7 scroll-mt-24 sm:px-9"
    >
      <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <Mail size={27} strokeWidth={1.6} className="shrink-0 text-[#E8176D]" aria-hidden="true" />
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#D81464]">
              Join the naughty list
            </h2>
            <p className="mt-1 text-sm text-[#684756]">
              New flavours, pop-up dates, new products and first dibs on drops.
            </p>
          </div>
        </div>

        <div>
          {done ? (
            <p
              role="status"
              className="flex min-h-14 items-center justify-center rounded-full border border-[#E8176D]/20 bg-white/70 px-5 text-center text-[15px] uppercase text-[#E8176D]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              You’re on the list x
            </p>
          ) : (
            <form
              onSubmit={submit}
              noValidate
              className="flex min-h-14 overflow-hidden rounded-full border border-[#E8176D]/12 bg-white/70 p-1.5 focus-within:border-[#E8176D]/40"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                maxLength={EMAIL_MAX}
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={sending}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'newsletter-error' : undefined}
                className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#3B2116] outline-none placeholder:text-[#9B7586]/65 sm:px-5"
              />
              {/* Honeypot — hidden from people, irresistible to bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                maxLength={100}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
                aria-hidden="true"
              />
              <button
                type="submit"
                disabled={sending}
                className="shrink-0 rounded-full bg-[#E8176D] px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#D71062] disabled:opacity-70 sm:px-6"
              >
                {sending ? 'Sealing…' : 'Subscribe'}
              </button>
            </form>
          )}
          {error && (
            <p id="newsletter-error" role="alert" className="mt-2 pl-5 text-[12px] font-semibold text-[#C01057]">
              {error}
            </p>
          )}
          <p className="mt-2 pl-5 text-[11px] leading-relaxed text-[#7A3B5E]/70">
            No spam. Just the sweet stuff x · Unsubscribe any time.{' '}
            <a href="/privacy-policy#newsletter" className="underline underline-offset-2 hover:text-[#E8176D]">
              Privacy
            </a>
          </p>
        </div>
      </div>

      <div
        className="pointer-events-none absolute -bottom-11 right-5 hidden h-28 w-28 items-center justify-center rounded-full bg-[#3B2116]/5 md:flex"
        aria-hidden="true"
      >
        <span className="text-6xl">🍓</span>
      </div>
    </motion.div>
  )
}
