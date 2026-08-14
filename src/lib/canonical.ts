/**
 * Keeps <link rel="canonical"> and og:url pointing at the page actually being
 * viewed.
 *
 * ── Why this is not just a tag in index.html ────────────────────────────────
 * Every route on this site is served from the same index.html, so a hard-coded
 * canonical would tell a crawler that /quote, /terms and /privacy-policy are
 * all really the home page — which is a stronger instruction than the soft 404
 * we just fixed, and would actively de-index the real pages. It has to follow
 * the route, so it is set from JavaScript on mount.
 *
 * Google renders JavaScript before evaluating canonicals, so this works; it is
 * still weaker than a server-rendered tag, and if this site ever grows enough
 * routes to justify prerendering, that is the better answer.
 */

const ORIGIN = 'https://naughtyberry.co.za'

/** The routes that exist. Anything else is a 404 and gets no canonical at all —
 *  pointing a dead URL at a real page invites Google to index the dead one. */
const KNOWN = new Set(['/', '/story', '/quote', '/privacy-policy', '/cookie-policy', '/terms'])

function upsert(selector: string, create: () => HTMLElement, href: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(el.tagName === 'LINK' ? 'href' : 'content', href)
}

function remove(selector: string) {
  document.head.querySelector(selector)?.remove()
}

/**
 * Call once per route render. `pathname` should already be normalised the way
 * App does it (trailing slashes stripped, '' becomes '/').
 */
export function setCanonical(pathname: string) {
  if (!KNOWN.has(pathname)) {
    // A 404 must not claim to be canonical for anything.
    remove('link[rel="canonical"]')
    return
  }

  // The home page is the bare origin with a trailing slash; everything else is
  // the path with none. Consistency matters more than which form is chosen —
  // two spellings of the same page is the duplicate-content problem canonicals
  // exist to solve.
  const href = pathname === '/' ? `${ORIGIN}/` : `${ORIGIN}${pathname}`

  upsert('link[rel="canonical"]', () => {
    const l = document.createElement('link')
    l.setAttribute('rel', 'canonical')
    return l
  }, href)

  // og:url should agree with the canonical, or a share card can advertise a
  // different URL than the one search knows about.
  upsert('meta[property="og:url"]', () => {
    const m = document.createElement('meta')
    m.setAttribute('property', 'og:url')
    return m
  }, href)
}
