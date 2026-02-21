import { Suspense } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MenuPreview from './components/MenuPreview'
import Events from './components/Events'
import FindUs from './components/FindUs'
import Gallery from './components/Gallery'
import About from './components/About'
import Footer from './components/Footer'
import FloatingCTA from './components/FloatingCTA'

function App() {
  return (
    <div className="min-h-screen bg-[#FDE8EF] text-[#2D1225] overflow-x-hidden">
      {/* Skip to main content for accessibility */}
      <a
        href="#menu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-[#E8143C] focus:text-white focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen bg-[#FDE8EF]">
            <div className="text-[#E8176D] text-sm tracking-widest uppercase animate-pulse">
              Loading Naughty Berry…
            </div>
          </div>
        }>
          <Hero />
        </Suspense>

        <MenuPreview />
        <Events />
        <FindUs />
        <Gallery />
        <About />
        <Footer />
      </main>

      <FloatingCTA />
    </div>
  )
}

export default App
