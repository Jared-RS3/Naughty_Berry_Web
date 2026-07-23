import { useEffect } from 'react'
import { getLenis, programmaticScrollAt } from '../lib/smoothScroll'

/**
 * Menu lock. As the #menu section scrolls up into view on a normal downward
 * scroll, the page is pulled so the menu sits full-frame under the navbar and
 * then **held there** — every further scroll is swallowed until the viewer makes
 * a second, deliberate scroll, at which point it releases and carries on to
 * Events. The hold is what stops the flying cup from overshooting: the scroll
 * position is frozen on the cup's dock mark, so it lands and settles instead of
 * blowing past to the next section.
 *
 * It holds the page itself (wheel + touch are preventDefault-ed while locked),
 * so it works the same whether Lenis is running (desktop) or not (mobile) — it
 * does not rely on Lenis's own lock. Lenis is merely paused for the duration.
 *
 * It never traps:
 *  - an outright fling from the top skips the lock (velocity gate),
 *  - it fires once per downward pass and re-arms only after you scroll back up,
 *  - scrolling up, any scroll key, or a 4s ceiling all release it immediately,
 *  - and it's off entirely under reduced motion.
 */
export function useMenuSnap() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let armed = true
    let phase: 'idle' | 'snapping' | 'locked' = 'idle'
    let lastY = window.scrollY
    let lastT = performance.now()
    let accum = 0
    let touchY = 0
    let safety = 0
    let disposed = false

    const navOffset = () => (window.matchMedia('(min-width: 768px)').matches ? 64 : 80)
    // Only an outright fling skips the lock; normal and brisk scrolling engage.
    const FAST = 5.5 // px/ms
    // How much deliberate intent breaks the hold, per input.
    const RELEASE_WHEEL = 80 // px of accumulated wheel delta
    const RELEASE_TOUCH = 55 // px of accumulated swipe

    function onWheel(e: WheelEvent) {
      e.preventDefault() // nothing scrolls while held
      if (e.deltaY < 0) return endLock() // wheel up → leave upward
      accum += e.deltaY
      if (accum >= RELEASE_WHEEL) endLock()
    }
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0]?.clientY ?? 0
      accum = 0
    }
    function onTouchMove(e: TouchEvent) {
      e.preventDefault()
      const cur = e.touches[0]?.clientY ?? touchY
      const dy = touchY - cur // + = swiping up (content moves down)
      touchY = cur
      if (dy < 0) return endLock() // swipe the other way → leave upward
      accum += dy
      if (accum >= RELEASE_TOUCH) endLock()
    }
    function onKey(e: KeyboardEvent) {
      // Never trap the keyboard — any scroll key releases at once.
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'].includes(e.key)) endLock()
    }

    function beginLock() {
      if (disposed || phase !== 'snapping') return // only ever snapping → locked
      phase = 'locked'
      accum = 0
      getLenis()?.stop()
      window.addEventListener('wheel', onWheel, { passive: false })
      window.addEventListener('touchstart', onTouchStart, { passive: false })
      window.addEventListener('touchmove', onTouchMove, { passive: false })
      window.addEventListener('keydown', onKey)
      safety = window.setTimeout(endLock, 4000) // hard ceiling — never stuck
    }

    function endLock() {
      if (phase !== 'locked') return
      phase = 'idle'
      window.clearTimeout(safety)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      getLenis()?.start()
      lastY = window.scrollY
      lastT = performance.now()
    }

    // Frame the menu under the navbar, then hold.
    function frameThenLock(el: HTMLElement) {
      const off = navOffset()
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(el, { offset: -off, duration: 0.7, lock: true, onComplete: beginLock })
      } else {
        const top = window.scrollY + el.getBoundingClientRect().top - off
        window.scrollTo({ top, behavior: 'smooth' })
        window.setTimeout(beginLock, 560)
      }
    }

    function onScroll() {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(1, now - lastT)
      const v = (y - lastY) / dt // px/ms, positive = downward
      lastY = y
      lastT = now

      if (phase !== 'idle') return
      // Let a navbar-link / anchor jump pass through the menu without a fight.
      if (now - programmaticScrollAt() < 1200) return

      const el = document.getElementById('menu')
      if (!el) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight

      // Re-arm once the menu is well below the fold again (scrolled back up).
      if (rect.top > vh * 0.9) {
        armed = true
        return
      }
      if (!armed || v <= 0) return // downward only
      if (v > FAST) {
        armed = false
        return
      } // outright fling passes

      // Engage as the menu top crosses into the upper ~half of the screen.
      if (rect.top <= vh * 0.58 && rect.top > navOffset() + 10) {
        armed = false
        phase = 'snapping'
        frameThenLock(el)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      disposed = true
      window.removeEventListener('scroll', onScroll)
      phase = 'locked' // let endLock run its teardown regardless of where we were
      endLock()
    }
  }, [])
}
