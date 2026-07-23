import type Lenis from 'lenis'

/**
 * Bridge between the desktop-only Lenis instance (owned by useLenis) and the
 * handful of places that scroll programmatically — the navbar links and the
 * menu "catch". Anything routed through here scrolls *with* Lenis when it's
 * running so the inertia is consistent, and falls straight back to native
 * smooth scroll on mobile / reduced-motion where Lenis is never started.
 */
let instance: Lenis | null = null

/** When any programmatic scroll last started. The menu catch reads this so it
 *  doesn't fight a navbar-link jump that's passing through the menu. */
let lastProgrammatic = 0
export const programmaticScrollAt = () => lastProgrammatic

export const setLenis = (l: Lenis | null) => {
  instance = l
}

/** Smooth-scroll to the first element matching `selector`. */
export function scrollToSelector(selector: string) {
  const el = document.querySelector(selector)
  if (!el) return
  lastProgrammatic = performance.now()
  if (instance) instance.scrollTo(el as HTMLElement)
  else (el as HTMLElement).scrollIntoView({ behavior: 'smooth' })
}

/**
 * Snap `el` so its top sits `offset` px below the viewport top, and hold the
 * scroll locked for the length of the glide — on desktop Lenis's own `lock`
 * ignores wheel/touch until it lands, which is the "you have to scroll again to
 * continue" beat. Native scroll can't be locked without jank, so on mobile it's
 * a plain smooth snap and `onDone` fires on a timer once it has settled.
 */
export function scrollToLock(el: HTMLElement, offset: number, onDone: () => void) {
  lastProgrammatic = performance.now()
  if (instance) {
    instance.scrollTo(el, {
      offset: -offset,
      lock: true,
      duration: 0.9,
      onComplete: onDone,
    })
  } else {
    const top = window.scrollY + el.getBoundingClientRect().top - offset
    window.scrollTo({ top, behavior: 'smooth' })
    window.setTimeout(onDone, 750)
  }
}
