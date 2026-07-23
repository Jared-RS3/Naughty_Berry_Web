import { useEffect } from 'react'
import { setLenis } from '../lib/smoothScroll'

/**
 * Desktop-only Lenis smooth scroll — the "weighted inertia" feel of an award
 * site, on the wheel.
 *
 * Deliberately NOT run on touch. iOS momentum scrolling lives on the compositor
 * thread; Lenis would move it onto main-thread JS, which is strictly slower on
 * exactly the phones this site has to feel good on. So it is gated to large
 * screens with a fine pointer (a real mouse/trackpad) and switched off under
 * reduced motion.
 *
 * Lenis is dynamically imported, so its ~10KB is a separate chunk that never
 * ships to a phone. It scrolls the real window (not a virtual transform), so
 * `window.scrollY` stays accurate and every existing scroll listener — the
 * flying cup, the pinned stages, the navbar — keeps working untouched.
 */
export function useLenis() {
  useEffect(() => {
    const enable =
      window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!enable) return

    let raf = 0
    let cancelled = false
    let lenis: import('lenis').default | null = null

    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis({
        // Length of the inertia glide. ~1.1s reads as luxe without feeling
        // sluggish or disconnected from the wheel.
        duration: 1.1,
        smoothWheel: true,
        // Let Lenis own <a href="#…"> clicks so anchor jumps glide too.
        anchors: true,
      })
      setLenis(lenis)
      const loop = (time: number) => {
        lenis?.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    })

    return () => {
      cancelled = true
      if (raf) cancelAnimationFrame(raf)
      lenis?.destroy()
      setLenis(null)
    }
  }, [])
}
