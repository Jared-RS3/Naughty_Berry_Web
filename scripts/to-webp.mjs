// One-off: shrink the heaviest public PNGs to WebP. WebP is supported on every
// browser this site targets (iOS 14+, all evergreen), so the .webp simply
// replaces the .png reference in the markup. Originals are left in place as a
// safety net — nothing 404s if a reference is missed.
//
//   node scripts/to-webp.mjs
import sharp from 'sharp'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = (p) => join(ROOT, 'public', p)

// [source png, webp quality]. Cutouts with alpha get a touch more quality so
// the soft edges don't fringe; the trailer photo can go lower.
//
// The cup cutouts are NOT listed here any more — scripts/cutout-cups.mjs owns
// classic / cream / dubai / iced-tea / naughty-hero-cup end to end, deriving
// both formats from the full-resolution originals in assets-src/cups/. Their
// .png in public/ is a palette-quantised fallback, so re-encoding a .webp from
// it here would quietly throw away quality.
const JOBS = [
  ['Naughty_Berry_Trailer.png', 78],
  ['menu-cups/brownie.png', 84],
]

const kb = (n) => `${(n / 1024).toFixed(0)}KB`

for (const [src, quality] of JOBS) {
  const inPath = pub(src)
  const outPath = inPath.replace(/\.png$/i, '.webp')
  const before = statSync(inPath).size
  await sharp(inPath)
    .webp({ quality, alphaQuality: 100, effort: 6 })
    .toFile(outPath)
  const after = statSync(outPath).size
  console.log(
    `${src.padEnd(28)} ${kb(before).padStart(7)} -> ${kb(after).padStart(7)}  (${Math.round((1 - after / before) * 100)}% smaller)`
  )
}
