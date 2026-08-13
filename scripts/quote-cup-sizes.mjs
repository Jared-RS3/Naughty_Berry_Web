/**
 * Derivative cup cut-outs for the quote builder.
 *
 * The masters in public/menu-cups are 1000px tall because the home page menu
 * shows them big. The quote builder never does: the carousel tops out at 240px
 * and the topping tabs and chips are 24–48px, so every visitor to /quote was
 * downloading ~770 kB of cup to paint about 90 kB of pixels — on a phone, over
 * a market's 4G, that IS the page load.
 *
 * So each master gets two derivatives, sized to 2× their largest render:
 *   -480.webp  the carousel (210–240px tall)
 *   -112.webp  topping tabs, box chips, the iced-tea row (24–48px tall)
 *
 * The masters are left alone — MenuPreview still wants them at full size.
 *
 * Run when the cut-outs change:  node scripts/quote-cup-sizes.mjs
 */
import sharp from 'sharp'
import { readdir, stat, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DIR = new URL('../public/menu-cups/', import.meta.url).pathname
const HEIGHTS = [480, 112]
const SUFFIX = /-(\d+)\.webp$/

const kb = (n) => `${(n / 1024).toFixed(0)} kB`

const masters = (await readdir(DIR)).filter((f) => f.endsWith('.webp') && !SUFFIX.test(f))

let before = 0
let after = 0

for (const file of masters) {
  const src = join(DIR, file)
  const size = (await stat(src)).size
  before += size

  for (const height of HEIGHTS) {
    const out = join(DIR, file.replace(/\.webp$/, `-${height}.webp`))
    const buf = await sharp(src)
      .resize({ height, withoutEnlargement: true })
      // Quality 82 is indistinguishable at these sizes; `alphaQuality` keeps the
      // cut-out edge clean, which is the only thing that would give it away.
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toBuffer()
    await writeFile(out, buf)
    after += buf.length
    console.log(`${file.padEnd(24)} → ${String(height).padStart(4)}px  ${kb(size).padStart(8)} → ${kb(buf.length).padStart(7)}`)
  }
}

console.log(`\n${masters.length} masters ${kb(before)} → ${kb(after)} across ${HEIGHTS.length} derivative sizes`)
