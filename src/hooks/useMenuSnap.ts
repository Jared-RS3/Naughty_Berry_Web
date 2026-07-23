import { useEffect } from 'react'
import { scrollToLock, programmaticScrollAt } from '../lib/smoothScroll'

/**
 * Menu "catch". As the #menu section rises into the upper half of the screen on
 * a normal downward scroll, the page is pulled so the menu sits full-frame just
 * under the navbar and — on desktop, via Lenis's scroll lock — holds there for a
 * beat, so it takes a second scroll to carry on. This gives the flying cup a
 * settled target to dock onto instead of a moving one.
 *
 * It never traps:
 *  - a hard fling from the top blows straight past (velocity gate),
 *  - it fires once per downward pass and only re-arms after you scroll back up
 *    above the menu,
 *  - it stands down while a navbar-link jump is scrolling through the menu,
 *  - and it's off entirely under reduced motion.
 *
 * On mobile there's no hard lock (locking native scroll janks iOS); it's a
 * gentle magnetic snap that re-frames the menu, which reads as the same "it
 * caught here" beat without touching the compositor scroll.
 */
export function useMenuSnap() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let armed = true
    let snapping = false
    let lastY = window.scrollY
    let lastT = performance.now()

    // Gap left above the menu so it clears the fixed navbar.
    const navOffset = () => (window.matchMedia('(min-width: 768px)').matches ? 64 : 80)
    // Above this scroll speed (px/ms) a fling is left to pass untouched.
    const FAST = 2.0

    const onScroll = () => {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(1, now - lastT)
      const v = (y - lastY) / dt // px/ms, positive = downward
      lastY = y
      lastT = now

      if (snapping) return
      // Let a navbar-link / anchor jump pass through the menu without a fight.
      if (now - programmaticScrollAt() < 1000) return

      const el = document.getElementById('menu')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // Re-arm once the menu is well below the fold again (scrolled back up).
      if (rect.top > vh * 0.9) {
        armed = true
        return
      }
      if (!armed || v <= 0) return
      // Very fast from the top → let them through this pass.
      if (v > FAST) {
        armed = false
        return
      }

      // Catch as the menu top crosses into the upper half, before it settles.
      const off = navOffset()
      if (rect.top <= vh * 0.5 && rect.top > off + 12) {
        armed = false
        snapping = true
        scrollToLock(el, off, () => {
          snapping = false
          lastY = window.scrollY
          lastT = performance.now()
        })
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
