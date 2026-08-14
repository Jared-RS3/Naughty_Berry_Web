import { useEffect, useLayoutEffect } from 'react'
import { ArrowLeft, Search } from 'lucide-react'

/**
 * /404 — anything that is not a real route.
 *
 * ── Why this exists at all ──────────────────────────────────────────────────
 * The SPA fallback used to serve the home page for every unknown URL with an
 * HTTP 200. That is a "soft 404": to a person it looks like the link worked and
 * they landed somewhere odd, and to Google it looks like a duplicate of the
 * home page rather than a missing one, which wastes crawl budget on infinite
 * dead URLs and can dilute the pages that matter. public/_redirects now serves
 * this shell with a real 404 status; this component is what fills it.
 *
 * It deliberately does not mount the home page's intro film, Lenis smooth
 * scroll or scroll-cup: someone who arrived here took a wrong turn, and the
 * fastest possible route back is the whole job.
 */
export default function NotFoundPage() {
  // This route never mounts LoadingScreen, so nothing else would clear the boot
  // screen from index.html. Before paint, so it doesn't flash.
  useLayoutEffect(() => {
    document.getElementById('boot')?.remove()
  }, [])

  useEffect(() => {
    document.title = 'Page not found – Naughty Berry'
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFDCEA] px-6 py-20 text-center text-[#2D1225]">
      <img
        src="/naughty-berry-logo.png"
        alt="Naughty Berry"
        width={180}
        height={72}
        className="mb-10 w-[clamp(140px,32vw,200px)]"
      />

      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#C01057]">
        <Search size={14} aria-hidden="true" />
        Error 404
      </p>

      <h1
        className="mt-4 uppercase leading-[0.95] tracking-[-0.02em] text-[clamp(2.2rem,9vw,4.5rem)] text-[#3B2116]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        This page
        <br />
        <span className="text-[#E8176D]">melted away</span>
      </h1>

      <p className="mt-6 max-w-md text-[15px] leading-[1.7] text-[#6B4155]">
        We could not find that one. It may have moved, or the link might have a typo in it — the
        good stuff is all still here though.
      </p>

      <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-[#E8176D] px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_32px_rgba(232,23,109,0.32)] transition hover:bg-[#C01057]"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Naughty Berry
        </a>

        <a
          href="/quote"
          className="inline-flex items-center gap-2 rounded-full border border-[#E8176D]/30 px-8 py-3.5 text-[12px] font-bold uppercase tracking-[0.18em] text-[#C01057] transition hover:bg-[#E8176D]/8"
        >
          Build a quote
        </a>
      </div>
    </main>
  )
}
