import type Lenis from 'lenis'

/**
 * Bridge between the desktop-only Lenis instance (owned by useLenis) and the
 * handful of places that scroll programmatically — the navbar links and the
 * menu lock. Anything routed through here scrolls *with* Lenis when it's
 * running so the inertia is consistent, and falls straight back to native
 * smooth scroll on mobile / reduced-motion where Lenis is never started.
 */
let instance: Lenis | null = null

/** When any programmatic scroll last started. The menu lock reads this so it
 *  doesn't engage while a navbar-link jump is passing through the menu. */
let lastProgrammatic = 0
export const programmaticScrollAt = () => lastProgrammatic

export const setLenis = (l: Lenis | null) => {
  instance = l
}

/** The live Lenis instance, or null on mobile / reduced-motion. */
export const getLenis = () => instance

/** Smooth-scroll to the first element matching `selector`. */
export function scrollToSelector(selector: string) {
  const el = document.querySelector(selector)
  if (!el) return
  lastProgrammatic = performance.now()
  if (instance) instance.scrollTo(el as HTMLElement)
  else (el as HTMLElement).scrollIntoView({ behavior: 'smooth' })
}
