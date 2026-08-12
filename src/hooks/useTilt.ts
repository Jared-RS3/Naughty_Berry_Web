import { useCallback, useRef } from 'react'

/**
 * Pointer-tracked 3D tilt for a card. Writes `--rx` / `--ry` custom properties
 * straight onto the node rather than going through state — a tilt that
 * re-rendered React on every pointermove would be janky on exactly the machines
 * that can least afford it.
 *
 * The element is expected to consume the vars itself, e.g.
 *   transform: perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))
 *
 * Skipped entirely for coarse pointers: there is no hover on a phone, and the
 * handlers would only fire mid-tap.
 */
export function useTilt(max = 9) {
  const ref = useRef<HTMLDivElement>(null)

  const isFine = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current
      if (!el || !isFine()) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--ry', `${px * max * 2}deg`)
      el.style.setProperty('--rx', `${-py * max * 2}deg`)
    },
    [max]
  )

  const onPointerLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--rx', '0deg')
  }, [])

  return { ref, onPointerMove, onPointerLeave }
}
