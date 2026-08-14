import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import CookieBanner from './components/CookieBanner'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScrollCup from './components/ScrollCup'
import { useLenis } from './hooks/useLenis'
import { useMenuSnap } from './hooks/useMenuSnap'

// All below-fold sections split into separate chunks — only downloaded when needed
// const NextStop    = lazy(() => import('./components/NextStop'))
const About       = lazy(() => import('./components/About'))
const MenuPreview = lazy(() => import('./components/MenuPreview'))
const Events      = lazy(() => import('./components/Events'))
const FindUs      = lazy(() => import('./components/FindUs'))
const Testimonials= lazy(() => import('./components/Testimonials'))
const Gallery     = lazy(() => import('./components/Gallery'))
const Footer      = lazy(() => import('./components/Footer'))
const StoryPage   = lazy(() => import('./components/StoryPage'))
const QuotePage   = lazy(() => import('./components/QuotePage'))
const PrivacyPolicyPage = lazy(() => import('./components/PrivacyPolicyPage'))
const CookiePolicyPage  = lazy(() => import('./components/CookiePolicyPage'))
const TermsPage         = lazy(() => import('./components/TermsPage'))

/** Standalone routes. Plain <a> navigation, resolved by the SPA fallback in
 *  public/_redirects — no router dependency for the handful of pages here. */
const ROUTES: Record<string, React.LazyExoticComponent<() => React.ReactElement>> = {
  '/story': StoryPage,
  '/quote': QuotePage,
  // The footer and the quote form's consent line link to these three. Without a
  // route the SPA fallback served them the home page instead — worse than a 404,
  // because the link looks like it worked and the policy is simply missing.
  '/privacy-policy': PrivacyPolicyPage,
  '/cookie-policy': CookiePolicyPage,
  '/terms': TermsPage,
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const Route = ROUTES[path]

  if (Route) {
    return (
      <>
        <Suspense fallback={null}>
          <Route />
        </Suspense>
        {/* Every route needs the consent gate, not just the home page — a
            visitor landing on /quote from a search result is being asked for
            their details before they have been asked about cookies. */}
        <CookieBanner />
      </>
    )
  }
  return <HomePage />
}

function HomePage() {
  // Weighted inertia scroll on desktop; a no-op on touch / reduced motion.
  useLenis()
  // Magnetic "catch" that frames the menu full-screen as it scrolls in, so the
  // cup docks onto a settled target. Bypassed by a fast fling from the top.
  useMenuSnap()

  // `revealed` flips the moment the intro cup starts zooming out, so the
  // headline rises in behind it rather than after it. `introDone` only unmounts
  // the overlay. The page itself is never faded — it sits fully painted under
  // the intro veil, which is what lets the hand-off be a pure cross-fade.
  const [revealed, setRevealed] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [isNaughtyMode, setIsNaughtyMode] = useState(false)
  const [transitionKey, setTransitionKey] = useState(0)
  const [showTransition, setShowTransition] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)

  const handleToggleNaughtyMode = useCallback(() => {
    setShowTransition(true)
    setIsNaughtyMode((prev) => !prev)
    setTransitionKey((prev) => prev + 1)

    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current)
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setShowTransition(false)
      transitionTimeoutRef.current = null
    }, 980)
  }, [])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [])

  const handleReveal = useCallback(() => setRevealed(true), [])
  const handleIntroDone = useCallback(() => setIntroDone(true), [])

  return (
    <>
      {!introDone && <LoadingScreen onReveal={handleReveal} onDone={handleIntroDone} />}

      <div
        className={`min-h-screen text-[#2D1225] transition-[background-color] duration-700 ${
        isNaughtyMode ? 'bg-[#1B0823]' : 'bg-[#FFDCEA]'
      }`}
    >
      {/* Skip to main content for accessibility */}
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#E8143C] focus:text-white focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navbar isNaughtyMode={isNaughtyMode} onToggleNaughtyMode={handleToggleNaughtyMode} />

      {/* Shared strawberry cup that flies hero → story → reviews → menu on scroll */}
      <ScrollCup loaded={revealed} />

      <AnimatePresence>
        {showTransition && (
          <motion.div
            key={transitionKey}
            initial={{ opacity: 0, clipPath: 'circle(0% at 88% 8%)', scale: 1 }}
            animate={{ opacity: [0, 0.95, 0], clipPath: ['circle(0% at 88% 8%)', 'circle(150% at 88% 8%)', 'circle(170% at 88% 8%)'], scale: [1, 1.02, 1.04] }}
            transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-0 z-[120]"
            style={{
              background:
                isNaughtyMode
                  ? 'radial-gradient(circle at 88% 8%, rgba(255, 53, 162, 0.48), rgba(107, 33, 168, 0.78) 38%, rgba(27, 8, 35, 0.98) 74%)'
                  : 'radial-gradient(circle at 88% 8%, rgba(255, 184, 213, 0.8), rgba(255, 220, 234, 0.85) 42%, rgba(255, 255, 255, 0.95) 76%)',
              mixBlendMode: 'screen',
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <main id="main-content">
        <Suspense fallback={null}>
          <Hero isNaughtyMode={isNaughtyMode} loaded={revealed} />
        </Suspense>
        {/* <Suspense fallback={null}><NextStop /></Suspense> */}
        <Suspense fallback={null}><About /></Suspense>
        <Suspense fallback={null}><Testimonials /></Suspense>
        <Suspense fallback={null}><MenuPreview /></Suspense>
        <Suspense fallback={null}><Events /></Suspense>
        <Suspense fallback={null}><FindUs /></Suspense>
        <Suspense fallback={null}><Gallery /></Suspense>
        <Suspense fallback={null}><Footer /></Suspense>
      </main>

      {/* <Suspense fallback={null}><FloatingCTA /></Suspense> */}
      </div>

      {/* Held back until the intro overlay has gone. Asking someone to make a
          decision they cannot see, over a full-screen film, is not "informed" —
          and nothing is loading in the meantime, so the wait costs nothing. */}
      <CookieBanner ready={introDone} />
    </>
  )
}

export default App
