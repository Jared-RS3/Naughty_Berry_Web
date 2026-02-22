import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const BERRY_POSITIONS = [
  { top: '8%',  left: '6%',  size: 44, delay: 0     },
  { top: '12%', left: '80%', size: 36, delay: 0.15  },
  { top: '70%', left: '5%',  size: 52, delay: 0.25  },
  { top: '75%', left: '82%', size: 38, delay: 0.1   },
  { top: '40%', left: '2%',  size: 28, delay: 0.35  },
  { top: '35%', left: '90%', size: 30, delay: 0.2   },
  { top: '88%', left: '40%', size: 24, delay: 0.4   },
  { top: '5%',  left: '48%', size: 20, delay: 0.3   },
]

// Blast berries shoot from center outward at exit — 14 evenly spaced angles
const BLAST_BERRIES = [
  { tx:   0,  ty: -180, size: 72, delay: 0,     rot: 320,  dur: 0.52 },
  { tx:  90,  ty: -160, size: 56, delay: 0.03,  rot: -200, dur: 0.48 },
  { tx: 170,  ty:  -80, size: 80, delay: 0.01,  rot: 260,  dur: 0.55 },
  { tx: 195,  ty:   20, size: 52, delay: 0.05,  rot: -300, dur: 0.50 },
  { tx: 160,  ty:  120, size: 68, delay: 0.02,  rot: 180,  dur: 0.53 },
  { tx:  80,  ty:  175, size: 46, delay: 0.04,  rot: -240, dur: 0.49 },
  { tx:   0,  ty:  185, size: 74, delay: 0,     rot: 220,  dur: 0.52 },
  { tx: -85,  ty:  170, size: 58, delay: 0.03,  rot: -180, dur: 0.48 },
  { tx:-165,  ty:  115, size: 82, delay: 0.01,  rot: 300,  dur: 0.55 },
  { tx:-195,  ty:   15, size: 50, delay: 0.05,  rot: -260, dur: 0.50 },
  { tx:-170,  ty:  -85, size: 66, delay: 0.02,  rot: 200,  dur: 0.53 },
  { tx: -90,  ty: -160, size: 44, delay: 0.04,  rot: -320, dur: 0.49 },
  { tx:  55,  ty: -170, size: 60, delay: 0.015, rot: 280,  dur: 0.51 },
  { tx: -55,  ty:  178, size: 48, delay: 0.035, rot: -220, dur: 0.50 },
]

interface Props {
  onComplete: () => void
}

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'loading' | 'ready' | 'exit' | 'done'>('loading')

  /* ─── Drive progress bar ─────────────────────────────── */
  useEffect(() => {
    const start = performance.now()
    const duration = 2600

    const tick = (now: number) => {
      const elapsed = now - start
      const p = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(p)
      if (p < 100) {
        requestAnimationFrame(tick)
      } else {
        setTimeout(() => setPhase('ready'), 180)
      }
    }
    requestAnimationFrame(tick)
  }, [])

  /* ─── Kick off exit after "ready" beat ──────────────── */
  useEffect(() => {
    if (phase === 'ready') {
      const t = setTimeout(() => setPhase('exit'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'exit') {
      // berries blast out, then mark done
      const t = setTimeout(() => setPhase('done'), 820)
      return () => clearTimeout(t)
    }
    if (phase === 'done') {
      onComplete()
    }
  }, [phase, onComplete])

  if (phase === 'done') return null

  return (
    <motion.div
      className="fixed inset-0 z-[999] overflow-hidden"
      animate={phase === 'exit' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5, delay: phase === 'exit' ? 0.32 : 0, ease: 'easeIn' }}
    >
      {/* ── Video background ─────────────────────── */}
      <video
        src="/2026-02-22T12-01-38_ultra_realistic_watermarked.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{ filter: 'brightness(0.28) saturate(1.4)' }}
      />

      {/* ── Gradient overlay ─────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, rgba(232,23,109,0.45) 0%, rgba(45,18,37,0.82) 55%, rgba(20,4,14,0.97) 100%)',
        }}
      />

      {/* ── Floating strawberries ────────────────── */}
      {BERRY_POSITIONS.map((b, i) => (
        <motion.img
          key={i}
          src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
          aria-hidden="true"
          draggable={false}
          initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
          animate={{
            opacity: [0, 0.55, 0.45, 0.55],
            scale: [0.4, 1, 0.95, 1],
            rotate: [-20, 8, -6, 8],
            y: [0, -14, 6, -10],
          }}
          transition={{
            duration: 4 + i * 0.4,
            delay: b.delay + 0.3,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size,
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 14px rgba(232,23,109,0.5))',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Centre content ───────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <motion.img
          src="/naughty-berry-logo.png"
          alt="Naughty Berry"
          initial={{ opacity: 0, scale: 0.55, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{
            width: 'clamp(220px, 38vw, 360px)',
            filter: 'drop-shadow(0 8px 40px rgba(232,23,109,0.7))',
          }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.6, ease: 'easeOut' }}
          className="mt-6 text-white/60 tracking-[0.28em] text-xs uppercase font-medium"
        >
          Cape Town's Sweetest Obsession
        </motion.p>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.6 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.5, ease: 'easeOut' }}
          className="mt-12 w-full max-w-[260px]"
        >
          <div className="relative h-[3px] rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #E8176D, #FF6BAD)',
                boxShadow: '0 0 12px rgba(232,23,109,0.8)',
                transition: 'width 0.08s linear',
              }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-white/30 tracking-widest font-mono">
            <span>Loading</span>
            <span>{progress}%</span>
          </div>
        </motion.div>

        {/* "Ready" beat */}
        <AnimatePresence>
          {phase === 'ready' && (
            <motion.div
              key="ready-label"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: [0.8, 1.15, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-[#FF6BAD] text-xs tracking-[0.3em] uppercase font-semibold"
            >
              🍓 Let's go
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Berry explosion exit ─────────────────── */}
      <AnimatePresence>
        {phase === 'exit' && BLAST_BERRIES.map((b, i) => (
          <motion.img
            key={`blast-${i}`}
            src="/realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png"
            aria-hidden="true"
            draggable={false}
            initial={{
              opacity: 1,
              scale: 0.3,
              x: 0,
              y: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.3, 1.6, 2.2],
              x: `${b.tx}vw`,
              y: `${b.ty}vh`,
              rotate: b.rot,
            }}
            transition={{
              duration: b.dur,
              delay: b.delay,
              ease: [0.2, 0.8, 0.4, 1],
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: b.size,
              height: b.size,
              marginTop: -b.size / 2,
              marginLeft: -b.size / 2,
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 18px rgba(232,23,109,0.9))',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

