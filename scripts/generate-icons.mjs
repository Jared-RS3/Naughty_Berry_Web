/**
 * Generates the square app icons that Android and iOS require.
 *
 *   npm run icons
 *
 * One source, committed:
 *   public/naughty-berry-logo.png – the full logo, wordmark and all
 *
 * Every icon is that logo, scaled. It is a wide lockup (900×548) going into
 * square frames, so it is trimmed of its transparent margin and letterboxed —
 * the proportions are never altered, the logo is simply centred with space
 * above and below.
 *
 * The padding is what makes the icon eligible at all: Google only renders a
 * favicon that is a square whose side is a multiple of 48px, and every browser
 * draws the tab icon in a square box. Serving the raw 900×548 file instead was
 * tried and reverted — a non-square icon is squashed, centre-cropped or
 * dropped for a generic globe, and which of the three you get is not the site's
 * choice to make.
 *
 * Everything written below is a build product. Edit the source and re-run;
 * never hand-edit the generated files, they will be overwritten.
 */
import { Buffer } from 'node:buffer'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = (p) => resolve(root, p)
const out = (p) => resolve(root, 'public', p)

const WORDMARK = src('public/naughty-berry-logo.png')

/** Page background. iOS and Android composite icons onto their own surfaces and
 *  discard transparency, so the tile colour has to be a deliberate choice. */
const PINK = '#FFDCEA'

/** The logo with its transparent margin cropped away, so the frame is spent on
 *  the artwork rather than on the empty border baked into the PNG. */
let trimmed
async function logo() {
  trimmed ??= await sharp(WORDMARK).trim({ threshold: 1 }).png().toBuffer()
  return trimmed
}

/** Renders the logo at `size`, optionally on an opaque tile with `pad` of the
 *  canvas left as breathing room on every side. `fit: 'contain'` is what keeps
 *  the lockup's 900×548 proportions intact inside a square frame. */
async function mark(size, { background = null, pad = 0 } = {}) {
  const inner = Math.round(size * (1 - pad * 2))
  const glyph = await sharp(await logo())
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })

  return canvas
    .composite([{ input: glyph, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer()
}

/**
 * Packs PNGs into a multi-resolution .ico.
 *
 * Windows, and the browsers that still read /favicon.ico off the root without
 * being told to, need this container. The entries are PNG-compressed, which
 * every ICO consumer since Vista understands.
 */
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(images.length, 4)

  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0) // 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette size
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // colour planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

/*
 * No share card is generated here any more.
 *
 * This script used to cut a 1200×630 og-image.jpg out of public/brownie.jpg.
 * index.html now points og:image and the JSON-LD #primaryimage straight at
 * public/Stand.webp — the same file the story, quote and events pages render —
 * so the search result and the page show the identical photograph rather than
 * a crop that exists only in the <head>. Nothing to build: the photo ships as
 * it is. Changing the share photo is now a one-line edit in index.html, not a
 * re-run of this script.
 */

async function main() {
  await mkdir(out('.'), { recursive: true })

  // Browser tabs, and the icon Google draws beside the search result.
  //
  // Every size here is a multiple of 48. That is not decoration — it is
  // Google's stated requirement for a favicon it will actually render ("a
  // square that is a multiple of 48px"), and the reason 32x32 is no longer in
  // the set that index.html declares. A wide lockup cannot be square without
  // padding, so it is padded: trimmed of its transparent margin, then centred
  // in the square with empty space above and below. The artwork is never
  // squashed, cropped or redrawn — this is the logo file, framed.
  //
  // There is no favicon.svg: the logo is a raster PNG, and serving it as an
  // SVG icon would mean a 40 KB base64 payload fetched on every page load to
  // draw a 16px square. PNG + ICO covers every browser without that.
  const png16 = await mark(16)
  const png32 = await mark(32)
  const png48 = await mark(48)
  await writeFile(out('favicon-32x32.png'), png32)
  await writeFile(out('favicon-48x48.png'), png48)
  await writeFile(out('favicon-96x96.png'), await mark(96))
  await writeFile(out('favicon-144x144.png'), await mark(144))
  await writeFile(out('favicon-192x192.png'), await mark(192))

  // The root /favicon.ico. Google falls back to this when it cannot use a
  // declared <link>, and browsers request it blind, so it has to carry the
  // same mark rather than being left to rot as a stale copy.
  await writeFile(
    out('favicon.ico'),
    ico([
      { size: 16, data: png16 },
      { size: 32, data: png32 },
      { size: 48, data: png48 },
    ]),
  )

  // iOS home screen. No transparency, and iOS applies its own corner radius, so
  // the art is inset rather than bled to the edge.
  await writeFile(out('apple-touch-icon.png'), await mark(180, { background: PINK, pad: 0.1 }))

  // Android / PWA install. The maskable copy is inset hard, because a round
  // launcher mask on a wide lockup would otherwise clip the first and last
  // letters clean off.
  await writeFile(out('web-app-manifest-192x192.png'), await mark(192, { background: PINK, pad: 0.08 }))
  await writeFile(out('web-app-manifest-512x512.png'), await mark(512, { background: PINK, pad: 0.08 }))
  await writeFile(out('web-app-manifest-maskable-512x512.png'), await mark(512, { background: PINK, pad: 0.28 }))

  console.log('icons written to public/')
  console.log(`  favicon.ico (16/32/48), favicon-{32,48,96,144,192}.png`)
  console.log(`  apple-touch-icon.png, web-app-manifest-{192,512,maskable}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
