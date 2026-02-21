import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Chocolate Drizzle ──────────────────────── */
function ChocDrizzle() {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.1, 0),
      new THREE.Vector3(0.3, 0.8, 0.3),
      new THREE.Vector3(0.5, 0.3, 0.1),
      new THREE.Vector3(0.4, -0.2, 0.2),
      new THREE.Vector3(0.35, -0.6, 0.1),
    ])
  }, [])

  const points = curve.getPoints(30)
  const geometry = useMemo(() => {
    const geo = new THREE.TubeGeometry(curve, 30, 0.025, 8, false)
    return geo
  }, [curve])

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#2C1215" roughness={0.2} metalness={0.3} />
      </mesh>
      {/* Drip tip */}
      <mesh position={points[points.length - 1]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#2C1215" roughness={0.2} metalness={0.3} />
      </mesh>
    </group>
  )
}

/* ─── Main Strawberry Mesh ───────────────────── */
function StrawberryBody({ color = '#E8143C' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Lathe profile for teardrop shape
  const points = useMemo(() => {
    const pts = []
    const n = 24
    for (let i = 0; i <= n; i++) {
      const t = i / n
      // parametric teardrop (wide top, pointed bottom)
      const y = 1.1 - t * 2.1
      const r = t < 0.15
        ? t / 0.15 * 0.78             // narrow at top
        : t < 0.8
        ? 0.78 - Math.pow((t - 0.8) / 0.8, 2) * 0.1  // full through middle
        : 0.78 * (1 - t) / 0.2 * (1 - Math.pow((t - 0.8) / 0.2, 1.5)) // taper to point
      pts.push(new THREE.Vector2(Math.max(0, r), y))
    }
    return pts
  }, [])

  return (
    <mesh ref={meshRef} castShadow>
      <latheGeometry args={[points, 48]} />
      <meshStandardMaterial
        color={color}
        roughness={0.18}
        metalness={0.05}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}

/* ─── Full Strawberry ─────────────────────────── */
export function Strawberry3D({
  scale = 1,
  color = '#E8143C',
  withChoc = false,
  autoRotate = true,
}: {
  scale?: number
  color?: string
  withChoc?: boolean
  autoRotate?: boolean
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    if (autoRotate) {
      groupRef.current.rotation.y += 0.006
    }
    // subtle breathing
    const s = scale + Math.sin(state.clock.elapsedTime * 0.8) * 0.012
    groupRef.current.scale.setScalar(s)
  })

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <group ref={groupRef} scale={scale}>
        <StrawberryBody color={color} />

        {/* Seeds */}
        {Array.from({ length: 26 }).map((_, i) => {
          const rows = 6
          const perRow = [4, 5, 6, 6, 5, 4]
          let r = 0, idx = i
          while (idx >= perRow[r]) { idx -= perRow[r]; r++ }
          const v = -0.65 + (r / (rows - 1)) * 1.35
          const radius = Math.sin(((r / (rows - 1)) * 0.85 + 0.1) * Math.PI) * 0.8
          const theta = (idx / perRow[r]) * Math.PI * 2 + (r % 2 ? Math.PI / perRow[r] : 0)
          const nx = Math.cos(theta) * radius
          const nz = Math.sin(theta) * radius
          const len = Math.sqrt(nx * nx + v * v + nz * nz)
          return (
            <mesh
              key={i}
              position={[(nx / len) * 0.83, (v / len) * 0.83, (nz / len) * 0.83]}
              rotation={[Math.atan2(v, radius), theta, 0]}
            >
              <cylinderGeometry args={[0.03, 0.025, 0.04, 6]} />
              <meshStandardMaterial color="#E2C98F" roughness={0.5} />
            </mesh>
          )
        })}

        {/* Leaves */}
        {[-0.5, 0.2, 0.9, -1.2, 1.6].map((yRot, i) => (
          <mesh key={i} position={[0, 1.05, 0]} rotation={[Math.PI * 0.08, yRot, 0]}>
            <coneGeometry args={[0.25, 0.55, 3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#2D6A4F' : '#40916C'} roughness={0.9} />
          </mesh>
        ))}

        {/* Stem */}
        <mesh position={[0, 1.35, 0]}>
          <cylinderGeometry args={[0.04, 0.03, 0.35, 8]} />
          <meshStandardMaterial color="#3D2B1F" roughness={0.9} />
        </mesh>

        {/* Chocolate drizzle */}
        {withChoc && <ChocDrizzle />}
      </group>
    </Float>
  )
}

/* ─── Scene Lighting ──────────────────────────── */
export function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[4, 8, 4]}
        intensity={2.5}
        color="#FFF5EC"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-4, 2, -4]} intensity={1.5} color="#E8143C" />
      <pointLight position={[3, -2, 3]} intensity={1} color="#C9A96E" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={2}
        color="#FFF5EC"
        castShadow
      />
    </>
  )
}

/* ─── Floating Particles ─────────────────────── */
export function FloatingParticles() {
  const count = 60
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 10
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [])

  const pointsRef = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.03) * 0.1
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#C9A96E" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

/* ─── Distort Sphere (chocolate bubble) ─────── */
export function ChocSphere({ position }: { position: [number, number, number] }) {
  return (
    <Sphere args={[0.5, 64, 64]} position={position}>
      <MeshDistortMaterial
        color="#2C1215"
        distort={0.4}
        speed={2}
        roughness={0.1}
        metalness={0.6}
      />
    </Sphere>
  )
}
