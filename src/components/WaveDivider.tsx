import { useReducedMotion } from 'framer-motion'

/**
 * Animated wave section divider — uses pure CSS animations for
 * compositor-thread performance (no JS per-frame cost).
 */

type WaveVariant = 'hero' | 'menu' | 'events' | 'findus' | 'gallery' | 'about'

interface WaveDividerProps {
  fill: string
  variant: WaveVariant
  flipX?: boolean
  height?: number
}

const WAVE_PATHS: Record<WaveVariant, { back: string; front: string }> = {
  hero: {
    back:  'M0,36 C240,56 480,16 720,36 C960,56 1200,16 1440,36 C1680,56 1920,16 2160,36 C2400,56 2640,16 2880,36 L2880,60 L0,60 Z',
    front: 'M0,44 C180,24 360,56 540,44 C720,24 900,56 1080,44 C1260,24 1440,56 1620,44 C1800,24 1980,56 2160,44 C2340,24 2520,56 2700,44 C2880,24 2880,44 2880,44 L2880,60 L0,60 Z',
  },
  menu: {
    back:  'M0,30 Q180,0 360,30 Q540,60 720,30 Q900,0 1080,30 Q1260,60 1440,30 Q1620,0 1800,30 Q1980,60 2160,30 Q2340,0 2520,30 Q2700,60 2880,30 L2880,60 L0,60 Z',
    front: 'M0,50 Q120,20 240,50 Q360,60 480,50 Q600,20 720,50 Q840,60 960,50 Q1080,20 1200,50 Q1320,60 1440,50 Q1560,20 1680,50 Q1800,60 1920,50 Q2040,20 2160,50 Q2280,60 2400,50 Q2520,20 2640,50 Q2760,60 2880,50 L2880,60 L0,60 Z',
  },
  events: {
    back:  'M0,60 L240,10 L480,50 L720,5 L960,45 L1200,15 L1440,55 L1680,10 L1920,50 L2160,5 L2400,45 L2640,15 L2880,60 Z',
    front: 'M0,60 L160,35 L320,55 L480,20 L640,50 L800,25 L960,55 L1120,30 L1280,52 L1440,18 L1600,48 L1760,22 L1920,52 L2080,28 L2240,55 L2400,18 L2560,45 L2720,28 L2880,60 Z',
  },
  findus: {
    back:  'M0,40 C360,70 720,10 1080,40 C1440,70 1800,10 2160,40 C2520,70 2880,40 2880,40 L2880,60 L0,60 Z',
    front: 'M0,50 C120,30 300,60 540,50 C780,40 900,20 1080,50 C1260,70 1440,30 1620,50 C1800,70 2040,20 2160,50 C2280,70 2520,30 2880,50 L2880,60 L0,60 Z',
  },
  gallery: {
    back:  'M0,20 C300,55 600,5 900,30 C1200,55 1500,5 1800,20 C2100,45 2400,10 2880,25 L2880,60 L0,60 Z',
    front: 'M0,45 C200,15 500,55 800,40 C1100,25 1300,55 1440,40 C1580,25 1780,55 2000,40 C2220,25 2500,55 2880,45 L2880,60 L0,60 Z',
  },
  about: {
    back:  'M0,35 C400,65 800,5 1200,35 C1600,65 2000,5 2400,35 C2640,55 2760,40 2880,35 L2880,60 L0,60 Z',
    front: 'M0,50 C200,25 500,60 800,50 C1100,30 1300,65 1440,50 C1580,30 1800,65 2100,50 C2400,30 2680,60 2880,50 L2880,60 L0,60 Z',
  },
}

const SPEED: Record<WaveVariant, [number, number]> = {
  hero:    [18, 11],
  menu:    [14,  8],
  events:  [10,  6],
  findus:  [16,  9],
  gallery: [12,  7],
  about:   [20, 13],
}

export default function WaveDivider({ fill, variant, flipX = false, height = 60 }: WaveDividerProps) {
  const reduced = useReducedMotion()
  const paths = WAVE_PATHS[variant]
  const [speedBack, speedFront] = SPEED[variant]

  return (
    <div
      aria-hidden="true"
      className="absolute bottom-0 left-0 w-full pointer-events-none overflow-hidden leading-[0]"
      style={{ height, transform: flipX ? 'scaleX(-1)' : undefined }}
    >
      <svg
        viewBox={`0 0 2880 ${height}`}
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-[200%] h-full"
        style={{
          opacity: 0.45,
          willChange: reduced ? 'auto' : 'transform',
          animation: reduced ? 'none' : `wave-back ${speedBack}s linear infinite`,
        }}
      >
        <path d={paths.back} fill={fill} />
      </svg>
      <svg
        viewBox={`0 0 2880 ${height}`}
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 w-[200%] h-full"
        style={{
          willChange: reduced ? 'auto' : 'transform',
          animation: reduced ? 'none' : `wave-front ${speedFront}s linear infinite`,
        }}
      >
        <path d={paths.front} fill={fill} />
      </svg>
    </div>
  )
}
