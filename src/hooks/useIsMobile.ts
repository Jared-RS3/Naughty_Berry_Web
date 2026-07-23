import { useEffect, useState } from 'react'

/** Subscribe to a CSS media query, SSR-safe. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}

/** True below the md breakpoint (768px) — the point where side-by-side
 *  compositions collapse to their single-column mobile layouts. */
export function useIsMobile(query = '(max-width: 767px)') {
  return useMediaQuery(query)
}
