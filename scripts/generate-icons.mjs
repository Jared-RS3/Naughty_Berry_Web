/**
 * Generates every favicon, app icon and social-share image the site serves.
 *
 *   npm run icons
 *
 * One source, committed:
 *   public/naughty-berry-logo.png – the full logo, wordmark and all
 *
 * Every icon is that logo, scaled. It is a wide lockup (900×548) going into
 * square frames, so it is trimmed of its transparent margin and letterboxed —
 * the proportions are never altered, the logo is simply centred with space
 * above and below. At 16px this is a pink smudge rather than a legible mark;
 * that is the accepted cost of using the lockup itself rather than a symbol
 * lifted out of it.
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

/**
 * The 1200×630 card that WhatsApp, Facebook, LinkedIn, Slack, iMessage and X
 * show when the URL is pasted, and the thumbnail Google draws beside the search
 * result. Without it those unfurls fall back to a bare link.
 *
 * It is a crop of the brownie-cup photograph rather than a composed graphic:
 * the shot already carries the wordmark on the cup, and a real photo of the
 * product outperforms a laid-out card in both places this file is shown.
 *
 * SHARE_PHOTO is portrait, so it cannot be handed to og:image as-is — 1.91:1 is
 * what every unfurler crops to, and doing that to a 1078×1300 frame would take
 * the lid and the base off the cup. The band below is cut deliberately instead,
 * so the crop is decided here rather than by five different consumers.
 */
const SHARE_PHOTO = src('public/brownie.jpg')

async function shareCard() {
  const W = 1200
  const H = 630

  const photo = await sharp(SHARE_PHOTO).metadata()

  // Full width, a 1.91:1 band of it. CUP_CENTRE is the vertical middle of the
  // cup in the source frame; the band is centred on that and then clamped, so
  // the subject sits on the centre line instead of at whatever height a plain
  // centre crop would land on.
  const CUP_CENTRE = 0.56
  const bandHeight = Math.round(photo.width * (H / W))
  const top = Math.min(
    Math.max(Math.round(photo.height * CUP_CENTRE - bandHeight / 2), 0),
    photo.height - bandHeight,
  )

  const card = await sharp(SHARE_PHOTO)
    .extract({ left: 0, top, width: photo.width, height: bandHeight })
    .resize(W, H)
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer()

  await writeFile(out('og-image.jpg'), card)
  return { width: W, height: H, bytes: card.length }
}

async function main() {
  await mkdir(out('.'), { recursive: true })

  // Browser tabs. There is no favicon.svg any more: the logo is a raster PNG,
  // and the only way to serve it as an SVG icon would be a 40 KB base64 payload
  // fetched on every page load to draw a 16px square. PNG + ICO covers every
  // browser without that.
  const png16 = await mark(16)
  const png32 = await mark(32)
  const png48 = await mark(48)
  await writeFile(out('favicon-32x32.png'), png32)
  await writeFile(out('favicon-96x96.png'), await mark(96))
  await writeFile(out('favicon-192x192.png'), await mark(192))
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

  const card = await shareCard()

  console.log('icons written to public/')
  console.log(`  favicon.ico (16/32/48), favicon-{32,96,192}.png`)
  console.log(`  apple-touch-icon.png, web-app-manifest-{192,512,maskable}`)
  console.log(`  og-image.jpg (${card.width}x${card.height}, ${Math.round(card.bytes / 1024)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
