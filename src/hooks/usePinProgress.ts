import { useEffect, type RefObject } from 'react'
import { useMotionValue, type MotionValue } from 'framer-motion'

/**
 * Scroll progress through a pinned run, measured straight off the run's rect —
 * the same approach the desktop Our Story / Reviews stages use (framer's
 * useScroll caches target offsets, which go stale as lazy sections mount above).
 *
 *   approach: 0 → 1 as the run's top rises from one screen below into view.
 *   progress: 0 → 1 while the sticky stage is pinned (top 0 → bottom leaving).
 *
 * `active` gates the listeners so only the layout actually on screen (mobile vs
 * desktop) pays for the scroll work.
 */
export function usePinProgress(
  ref: RefObject<HTMLElement | null>,
  active: boolean
): { approach: MotionValue<number>; progress: MotionValue<number> } {
  const approach = useMotionValue(0)
  const progress = useMotionValue(0)

  useEffect(() => {
    const el = ref.current
    if (!el || !active) return
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
    const read = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      approach.set(clamp01((vh - r.top) / vh))
      progress.set(clamp01(-r.top / Math.max(1, r.height - vh)))
    }
    // getBoundingClientRect forces layout, so coalesce onto one rAF per frame.
    let frame = 0
    const update = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        read()
      })
    }
    read()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [ref, active, approach, progress])

  return { approach, progress }
}
