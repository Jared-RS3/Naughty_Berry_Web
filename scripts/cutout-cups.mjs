// One-off: turn the new Naughty Berry cup product shots into transparent
// cutouts and drop them into place as the menu-cup / hero-cup assets.
//
// The new photos arrived as flat RGB on a near-white studio background, but
// every place the site uses them (menu flavour washes, the pinned reviews
// stage, the hero) seats the cup on colour — so the white has to become alpha
// or the cups render as white boxes.
//
// Keying is a border flood-fill rather than a plain threshold: the cups
// contain their own near-whites (the cream cup's whipped layer, highlights on
// the plastic) and those must survive. Only background-coloured pixels
// reachable from the edge are cleared.
//
//   node scripts/cutout-cups.mjs
import sharp from 'sharp'
import { statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = (p) => join(ROOT, 'public', p)
// Full-resolution originals live outside public/ so vite does not copy several
// megabytes of unused source photography into dist/.
const src = (p) => join(ROOT, 'assets-src/cups', p)

/** [source, destination stem, longest-edge px]. The hero/reviews cup is drawn
 *  small and appears on every route, so it gets a tighter budget than the menu
 *  cutouts, which fill a large slot on the flavour stage. */
const JOBS = [
  ['Naughty_Berry_Original_Cup.png', 'menu-cups/classic', 1000],
  ['Naughty_Berry_Cream_Cup.png', 'menu-cups/cream', 1000],
  ['Naughty_Berry_Dubai_Cup.png', 'menu-cups/dubai', 1000],
  ['Naughty_Berry_Ice_Tea_Cup.png', 'menu-cups/iced-tea', 1000],
  ['Naughty_Berry_Original_Cup.png', 'naughty-hero-cup', 720],
]

/** A pixel counts as background when it is bright and unsaturated. The studio
 *  sweep sits at 241–255 with a 1–3 point channel spread; the cups' own whites
 *  are either darker or visibly warm, so both tests together separate them. */
const MIN_LEVEL = 228
const MAX_SPREAD = 14

/** Flood-fill the background from the border and return an 8-bit alpha mask.
 *  Iterative stack — a recursive fill blows the stack on a 1.2k-square image. */
function keyBackground(data, w, h, channels) {
  const bg = new Uint8Array(w * h)
  const stack = []

  const isBgColour = (i) => {
    const o = i * channels
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const spread = Math.max(r, g, b) - Math.min(r, g, b)
    return Math.min(r, g, b) >= MIN_LEVEL && spread <= MAX_SPREAD
  }

  const push = (i) => {
    if (bg[i] || !isBgColour(i)) return
    bg[i] = 1
    stack.push(i)
  }

  for (let x = 0; x < w; x++) {
    push(x)
    push((h - 1) * w + x)
  }
  for (let y = 0; y < h; y++) {
    push(y * w)
    push(y * w + w - 1)
  }

  while (stack.length) {
    const i = stack.pop()
    const x = i % w
    if (x > 0) push(i - 1)
    if (x < w - 1) push(i + 1)
    if (i >= w) push(i - w)
    if (i < w * (h - 1)) push(i + w)
  }

  const alpha = Buffer.alloc(w * h)
  for (let i = 0; i < w * h; i++) alpha[i] = bg[i] ? 0 : 255
  return alpha
}

const kb = (n) => `${(n / 1024).toFixed(0)}KB`

for (const [source, stem, maxEdge] of JOBS) {
  const inPath = src(source)
  const { data, info } = await sharp(inPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const alpha = keyBackground(data, info.width, info.height, info.channels)

  // A one-pixel blur softens the hard fill boundary so the cutout does not
  // fringe against dark washes, and eroding by the same amount first keeps the
  // soft edge from haloing the leftover background ring.
  const softAlpha = await sharp(alpha, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .blur(1.1)
    .linear(1.6, -80)
    // Without this sharp promotes the single-channel mask back to 3-channel
    // sRGB on output, and joinChannel then reads it at the wrong stride.
    .toColourspace('b-w')
    .raw()
    .toBuffer()

  // Two passes on purpose: sharp runs `trim` early in its fixed pipeline, so
  // trimming in the same chain as `joinChannel` would measure the original
  // white border rather than the alpha we just built.
  // No removeAlpha() here: sharp applies it *after* joinChannel in its fixed
  // pipeline, which strips the alpha we just built. The sources are RGB anyway.
  const keyed = await sharp(inPath)
    .joinChannel(softAlpha, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
    .png()
    .toBuffer()

  const cut = sharp(keyed)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 2 })
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })

  const pngPath = pub(`${stem}.png`)
  const webpPath = pub(`${stem}.webp`)
  // The markup only ever references the .webp; the .png is the no-JS/no-webp
  // safety net the rest of public/ already keeps, so it is palette-quantised
  // rather than left as a multi-megabyte truecolour file.
  await cut.clone().png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(pngPath)
  await cut.clone().webp({ quality: 86, alphaQuality: 100, effort: 6 }).toFile(webpPath)

  const meta = await sharp(pngPath).metadata()
  console.log(
    `${stem.padEnd(22)} ${`${meta.width}x${meta.height}`.padStart(10)}  png ${kb(
      statSync(pngPath).size
    ).padStart(7)}  webp ${kb(statSync(webpPath).size).padStart(7)}`
  )
}
