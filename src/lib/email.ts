/**
 * Newsletter email validation, shared by the sign-up form
 * (src/components/NewsletterEnvelope.tsx) and netlify/functions/subscribe.mts
 * so the two can never disagree. The server's check is the one that counts;
 * the form runs the same one only to answer sooner.
 *
 * Deliberately stricter than RFC 5322 — an allow-list of what real mailboxes
 * use, not a deny-list of what attackers try:
 *  - ASCII only: no control characters, zero-width or look-alike Unicode.
 *  - No quotes, angle brackets, semicolons, backslashes or spaces, so the value
 *    can't break out of HTML, a header, a query string or a quoted field.
 *  - Must start with a letter or digit, so an exported audience CSV can't open
 *    in Excel as a formula (=, +, -, @ — "CSV injection").
 *  - Punctuation (. % + ' -) only ever sits singly between letters or digits,
 *    so no "--", "'--" or ".." and nothing trailing: jane.doe+cakes and
 *    o'brien pass, SQL-comment and quote-stacking shapes don't.
 *  - Domain labels and TLD per RFC 1035.
 *
 * The separators can't match the characters around them, so the pattern
 * can't backtrack catastrophically (no ReDoS), and length is capped first.
 */

/** RFC 5321's limit on a forward path. */
export const EMAIL_MAX = 254
const LOCAL_MAX = 64

const LOCAL = "[a-z0-9][a-z0-9_]*(?:[.%+'-][a-z0-9_]+)*"
const LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?'
const TLD = '(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})'
const EMAIL_RE = new RegExp(`^${LOCAL}@(?:${LABEL}\\.)+${TLD}$`)

/** The address trimmed and lower-cased if it passes, otherwise null. */
export function normaliseEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const email = input.trim().toLowerCase()
  if (email.length > EMAIL_MAX || email.indexOf('@') > LOCAL_MAX || !EMAIL_RE.test(email)) return null
  return email
}
