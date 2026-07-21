/**
 * One-shot asset squeeze. Rewrites the referenced images in public/ in place at
 * sensible dimensions — most were shipping at many times the size they render
 * at (the 24px strawberry eyebrow icon was a 957 kB PNG).
 *
 * Originals are tracked in git, so `git checkout -- public` restores them.
 *
 * sharp is not a project dependency — this runs once when assets change, and
 * it isn't worth ~30 MB on every install:
 *
 *   npm i --no-save sharp
 *   node scripts/optimise-assets.mjs --dry   # report only
 *   node scripts/optimise-assets.mjs         # rewrite in place
 */
import sharp from 'sharp'
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DRY = process.argv.includes('--dry')
const PUB = new URL('../public/', import.meta.url).pathname

/** maxWidth is the largest the asset ever renders, times a 2× device ratio. */
const TARGETS = [
  { file: 'naughty-hero-cup.png', maxWidth: 1100 },
  { file: 'naughty-berry-logo.png', maxWidth: 900 },
  {
    file: 'realistic-vector-icon-illustration-whole-red-strawberry-covered-chocolate-chocolate-dripping.png',
    maxWidth: 128,
  },
  { dir: 'menu-cups', maxWidth: 760 },
  { dir: 'menu-decor', maxWidth: 520 },
  { glob: /\.jpe?g$/i, maxWidth: 1200 },
]

const kb = (n) => `${(n / 1024).toFixed(0)} kB`

async function listFiles() {
  const out = []
  const walk = async (rel) => {
    for (const e of await readdir(join(PUB, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) await walk(r)
      else out.push(r)
    }
  }
  await walk('')
  return out
}

function targetFor(rel) {
  for (const t of TARGETS) {
    if (t.file && rel === t.file) return t
    if (t.dir && rel.startsWith(`${t.dir}/`)) return t
    if (t.glob && t.glob.test(rel)) return t
  }
  return null
}

const files = await listFiles()
let before = 0
let after = 0

for (const rel of files) {
  const t = targetFor(rel)
  if (!t) continue
  const abs = join(PUB, rel)
  const size = (await stat(abs)).size
  const img = sharp(abs)
  const meta = await img.metadata()
  const width = Math.min(t.maxWidth, meta.width)

  const pipeline = sharp(abs).resize({ width, withoutEnlargement: true })
  const isPng = /\.png$/i.test(rel)
  const buf = await (isPng
    ? // Palette PNG keeps the alpha cut-outs crisp at a fraction of the bytes.
      pipeline.png({ palette: true, quality: 88, effort: 10, compressionLevel: 9 }).toBuffer()
    : pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true }).toBuffer())

  before += size
  // Never make a file bigger than it already was.
  const keep = buf.length < size
  after += keep ? buf.length : size
  console.log(
    `${keep ? '✓' : '–'} ${rel.padEnd(58)} ${kb(size).padStart(8)} → ${kb(buf.length).padStart(8)}` +
      `  (${meta.width}→${width}px)`
  )
  if (keep && !DRY) await writeFile(abs, buf)
}

console.log(`\ntotal ${kb(before)} → ${kb(after)}  (${DRY ? 'dry run' : 'written'})`)
