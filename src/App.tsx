import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'

// All below-fold sections split into separate chunks — only downloaded when needed
const About       = lazy(() => import('./components/About'))
const MenuPreview = lazy(() => import('./components/MenuPreview'))
const Events      = lazy(() => import('./components/Events'))
const FindUs      = lazy(() => import('./components/FindUs'))
const Testimonials= lazy(() => import('./components/Testimonials'))
const Gallery     = lazy(() => import('./components/Gallery'))
const Footer      = lazy(() => import('./components/Footer'))
const FloatingCTA = lazy(() => import('./components/FloatingCTA'))

function App() {
  const [loaded, setLoaded] = useState(false)
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

  return (
    <>
      <LoadingScreen onComplete={() => setLoaded(true)} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`min-h-screen text-[#2D1225] overflow-x-hidden transition-[background-color] duration-700 ${
        isNaughtyMode ? 'bg-[#1B0823]' : 'bg-[#FDE8EF]'
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
                  : 'radial-gradient(circle at 88% 8%, rgba(255, 200, 220, 0.8), rgba(253, 232, 239, 0.85) 42%, rgba(255, 255, 255, 0.95) 76%)',
              mixBlendMode: 'screen',
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <main id="main-content">
        <Suspense fallback={null}>
          <Hero isNaughtyMode={isNaughtyMode} />
        </Suspense>
        <Suspense fallback={null}><About /></Suspense>
        <Suspense fallback={null}><MenuPreview /></Suspense>
        <Suspense fallback={null}><Events /></Suspense>
        <Suspense fallback={null}><FindUs /></Suspense>
        <Suspense fallback={null}><Testimonials /></Suspense>
        <Suspense fallback={null}><Gallery /></Suspense>
        <Suspense fallback={null}><Footer /></Suspense>
      </main>

      <Suspense fallback={null}><FloatingCTA /></Suspense>
      </motion.div>
    </>
  )
}

export default App
