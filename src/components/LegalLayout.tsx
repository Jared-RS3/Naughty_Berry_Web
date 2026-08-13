import { useEffect, useLayoutEffect, type ReactNode } from 'react'
import { ArrowLeft, Instagram } from 'lucide-react'

/**
 * Shared chrome for the three legal routes — /privacy-policy, /cookie-policy
 * and /terms.
 *
 * These are standalone routes resolved by the SPA fallback in public/_redirects,
 * exactly like /story and /quote. That means they never mount Navbar, Footer or
 * LoadingScreen, so each one carries its own slim header and footer (a page
 * someone opens from a footer link, or lands on from a search result, has to
 * look like part of the site on its own) and each one has to clear the boot
 * screen from index.html itself, since nothing else will.
 *
 * Legal copy is long and nobody reads it top to bottom, so the layout is built
 * for scanning rather than for atmosphere: a sticky contents list on desktop,
 * numbered sections with real anchors, and generous line height. The anchors
 * matter beyond navigation — other pages and the footer link straight to
 * /privacy-policy#cookies and /privacy-policy#your-rights.
 */

const ARCHIVO = "'Archivo Black', system-ui, sans-serif"

/* ────────────────────────── Business identity ──────────────────────────
 *
 * ⚠ FILL THESE IN BEFORE THE SITE GOES LIVE.
 *
 * POPIA requires the responsible party to be identifiable, and ECTA s43 wants
 * a real-world address and registration details for a business that solicits
 * transactions online. Every legal page reads its identity details from this
 * one object, so filling it in here updates all three pages at once.
 *
 * A `null` renders as a visible "[ to be confirmed ]" chip rather than silently
 * disappearing — a missing detail should be impossible to ship by accident.
 */
export const BUSINESS = {
  tradingName: 'Naughty Berry',
  /** e.g. 'Naughty Berry (Pty) Ltd' — omit if trading as a sole proprietor. */
  registeredName: null as string | null,
  /** CIPC registration number, e.g. '2024/123456/07'. */
  registrationNumber: null as string | null,
  /** Only if VAT-registered. Drives the VAT line in the Terms. */
  vatNumber: null as string | null,
  /**
   * The address the business can be reached and legally served at.
   *
   * POPIA s18(1)(b) requires the responsible party's "name and address" to be
   * given to the data subject — it does not say the address must be a street
   * address, so a business, postal or mailbox address satisfies it. ECTA s43 is
   * the stricter one: it asks a supplier soliciting orders online for a physical
   * address and a telephone number.
   *
   * If this is run from home, do NOT put a home address here. Use a registered
   * office, an accountant's or bookkeeper's address, a Postnet/mailbox address,
   * or a co-working address — anything real where post and legal process can
   * actually reach you.
   */
  address: null as string | null,
  /** Postal address, if different from the address above. */
  postalAddress: null as string | null,
  email: 'naughtyberryinfo@gmail.com',
  /** Published contact number, if you want one on the legal pages. */
  phone: null as string | null,
  /**
   * POPIA s55/56: every responsible party has an Information Officer. If none is
   * appointed it defaults to the head of the business — and they must be
   * registered with the Information Regulator before taking up the duties.
   */
  informationOfficer: null as string | null,
  informationOfficerEmail: null as string | null,
  site: 'naughtyberry.co.za',
  siteUrl: 'https://naughtyberry.co.za',
  instagram: 'https://www.instagram.com/naughtyberrycpt',
  instagramHandle: '@naughtyberrycpt',
} as const

/** The date the current wording took effect. Bump it whenever the substance of
 *  any of the three documents changes — a policy without a date is unusable as
 *  evidence of what a visitor agreed to. */
export const EFFECTIVE_DATE = '13 August 2026'

/* ────────────────────────── Copy primitives ────────────────────────── */

/**
 * Renders a detail from BUSINESS, or a visible placeholder if it has not been
 * filled in yet. Deliberately loud: an unfilled registration number should look
 * wrong on the page, not read as a deliberate omission.
 */
export function Detail({
  value,
  placeholder,
}: {
  value: string | null
  placeholder: string
}) {
  if (value) return <>{value}</>

  return (
    <span
      title="This detail still needs to be filled in — see BUSINESS in src/components/LegalLayout.tsx"
      className="rounded bg-[#E8176D]/10 px-1.5 py-0.5 text-[0.9em] font-semibold text-[#C01057]"
    >
      [ {placeholder} — to be confirmed ]
    </span>
  )
}

/** A numbered top-level section. `id` is the anchor the contents list targets. */
export function Section({
  id,
  heading,
  children,
}: {
  id: string
  heading: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[#E8176D]/10 pt-10 first:border-t-0 first:pt-0">
      <h2
        className="uppercase leading-[1.1] tracking-[-0.01em] text-[clamp(1.25rem,2.4vw,1.7rem)] text-[#3B2116]"
        style={{ fontFamily: ARCHIVO }}
      >
        {heading}
      </h2>

      <div className="mt-5 space-y-4 text-[15.5px] leading-[1.8] text-[#6B4155]">
        {children}
      </div>
    </section>
  )
}

/** A sub-heading inside a section. */
export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="!mt-8 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C01057]">
      {children}
    </h3>
  )
}

export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="!mt-5 space-y-3.5">{children}</ul>
}

/** Marker is drawn rather than inherited: list-style is reset site-wide, and
 *  without one a wrapped bullet is indistinguishable from the next bullet —
 *  which in a rights list is the difference between one right and two. */
export function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="relative pl-6 leading-[1.75]">
      <span
        aria-hidden="true"
        className="absolute left-0 top-[0.72em] h-1.5 w-1.5 rounded-full bg-[#E8176D]/70"
      />
      {children}
    </li>
  )
}

/** Pulled-out note for the things a reader should not be able to skim past —
 *  the newsletter form storing nothing, the estimate not being a quote. */
export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="nb-card !mt-7 border-l-4 border-[#E8176D] px-6 py-5 text-[15px] leading-[1.75] text-[#6B4155]">
      {children}
    </div>
  )
}

/**
 * Two-column key/value table, used for the "what we collect and why" grid and
 * the retention schedule. Collapses to stacked rows on a phone, where a real
 * table would either overflow or shrink the text past readability.
 */
export function DataTable({
  columns,
  rows,
}: {
  columns: [string, string, string?]
  rows: (readonly [ReactNode, ReactNode, ReactNode?])[]
}) {
  const three = columns.length === 3 && columns[2] !== undefined

  return (
    <div className="!mt-6 overflow-hidden rounded-[18px] border border-[#E8176D]/12">
      <div
        className={`hidden bg-[#FFF0F6] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#C01057] sm:grid sm:gap-5 ${
          three ? 'sm:grid-cols-[1fr_1.3fr_0.9fr]' : 'sm:grid-cols-[1fr_1.6fr]'
        }`}
      >
        {columns.filter(Boolean).map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>

      {rows.map((row, i) => (
        <div
          key={i}
          className={`gap-2 border-t border-[#E8176D]/10 px-5 py-4 text-[14.5px] leading-[1.7] sm:grid sm:gap-5 ${
            three ? 'sm:grid-cols-[1fr_1.3fr_0.9fr]' : 'sm:grid-cols-[1fr_1.6fr]'
          } ${i % 2 ? 'bg-white/40' : 'bg-transparent'}`}
        >
          <div className="font-semibold text-[#3B2116]">{row[0]}</div>
          <div className="mt-1 text-[#6B4155] sm:mt-0">{row[1]}</div>
          {three && <div className="mt-1 text-[#6B4155] sm:mt-0">{row[2]}</div>}
        </div>
      ))}
    </div>
  )
}

/** Inline link styled for body copy. External links get the usual hardening. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http') || href.startsWith('mailto')

  return (
    <a
      href={href}
      target={href.startsWith('http') ? '_blank' : undefined}
      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      className="font-semibold text-[#E8176D] underline decoration-[#E8176D]/30 underline-offset-[3px] transition-colors hover:text-[#C01057] hover:decoration-[#C01057]"
    >
      {children}
      {external && href.startsWith('http') && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  )
}

/* ────────────────────────── Page chrome ────────────────────────── */

function LegalNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E8176D]/10 bg-[#FFDCEA]/95 sm:bg-[#FFDCEA]/85 sm:backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8176D] transition-colors hover:text-[#C01057]"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Back to Naughty Berry</span>
          <span className="sm:hidden">Back</span>
        </a>

        <a href="/" aria-label="Naughty Berry home">
          <img
            src="/naughty-berry-logo.png"
            alt="Naughty Berry"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </a>

        <a
          href={BUSINESS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Naughty Berry on Instagram"
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#E8176D] transition-colors hover:bg-[#E8176D] hover:text-white"
        >
          <Instagram size={17} />
        </a>
      </div>
    </header>
  )
}

/** The three documents cross-reference each other constantly, so every one of
 *  them ends on links to the other two. */
function LegalFooter({ current }: { current: string }) {
  const pages = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/terms', label: 'Terms of Use' },
  ]

  return (
    <footer className="border-t border-[#E8176D]/10 bg-[#FFF8FB]" role="contentinfo">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 py-8 text-center sm:flex-row sm:text-left">
        <img
          src="/naughty-berry-logo.png"
          alt="Naughty Berry"
          className="h-10 w-auto object-contain"
        />

        <nav aria-label="Legal pages" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {pages.map(({ href, label }) =>
            href === current ? (
              <span key={href} className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8176D]">
                {label}
              </span>
            ) : (
              <a
                key={href}
                href={href}
                className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A3B5E] transition-colors hover:text-[#E8176D]"
              >
                {label}
              </a>
            ),
          )}
        </nav>

        <p className="text-[11px] text-[#7A3B5E]/55">
          © {new Date().getFullYear()} {BUSINESS.tradingName}. Made in Cape Town.
        </p>
      </div>
    </footer>
  )
}

export interface TocEntry {
  id: string
  label: string
}

export default function LegalLayout({
  path,
  eyebrow,
  title,
  documentTitle,
  intro,
  toc,
  children,
}: {
  /** This page's own path, so the footer can mark it as current. */
  path: string
  eyebrow: string
  /** Rendered inside the <h1>, so it may carry a <br /> to control the line break. */
  title: ReactNode
  /** <title> for the tab and for search results. */
  documentTitle: string
  intro: ReactNode
  toc: TocEntry[]
  children: ReactNode
}) {
  // Nothing else on these routes would ever clear the boot screen painted by
  // index.html. Before paint, so it never flashes.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
  }, [])

  useEffect(() => {
    document.title = documentTitle

    // Deep links into a section — /privacy-policy#cookies, and the "Cookie
    // Policy" cross-references — arrive as a full document load. The browser
    // looks for the anchor while parsing index.html, long before React has
    // rendered a single section, finds nothing and gives up, landing the reader
    // at the top of a very long page. So we do the jump ourselves once the
    // sections exist. Not smooth: this is where the visitor asked to be, and
    // scrolling them past thirteen sections to get there is not a courtesy.
    const hash = window.location.hash.slice(1)
    if (!hash) return

    const target = document.getElementById(decodeURIComponent(hash))
    target?.scrollIntoView()
  }, [documentTitle])

  return (
    <div className="min-h-screen bg-[#FFDCEA] text-[#2D1225]">
      <LegalNav />

      {/* ── Title block ── */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-12 md:pt-16">
        <div className="mb-6 flex items-center gap-3">
          <span aria-hidden="true">🍓</span>
          <span className="h-px w-8 bg-[#E8176D]/50" />
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#A92B60]">
            {eyebrow}
          </p>
        </div>

        <h1
          className="uppercase leading-[0.95] tracking-[-0.03em] text-[clamp(2.2rem,7vw,4.6rem)] text-[#3B2116]"
          style={{ fontFamily: ARCHIVO }}
        >
          {title}
        </h1>

        <p className="mt-7 max-w-3xl text-[17px] leading-[1.8] text-[#7A3B5E]">{intro}</p>

        <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#7A3B5E]/60">
          Last updated {EFFECTIVE_DATE}
        </p>
      </section>

      {/* ── Contents + body ── */}
      <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 md:pb-24 lg:grid-cols-[250px_1fr] lg:gap-14">
        <nav aria-label="On this page" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C01057]">
            On this page
          </p>

          <ol className="mt-4 space-y-2.5 border-l border-[#E8176D]/15 pl-4">
            {toc.map(({ id, label }, i) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-[13.5px] leading-snug text-[#7A3B5E] transition-colors hover:text-[#E8176D]"
                >
                  <span className="mr-1.5 tabular-nums text-[#7A3B5E]/45">{i + 1}.</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="nb-card space-y-10 px-6 py-9 sm:px-10 sm:py-12">{children}</article>
      </div>

      <LegalFooter current={path} />
    </div>
  )
}
