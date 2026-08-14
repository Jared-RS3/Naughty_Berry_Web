/**
 * Generates every favicon, app icon and social-share image the site serves.
 *
 *   npm run icons
 *
 * Two sources, both committed:
 *   assets-src/berry-mark.svg   – the strawberry from the logo, redrawn clean
 *   public/naughty-berry-logo.png – the full wordmark, used on the share card
 *
 * Everything written below is a build product. Edit the sources and re-run;
 * never hand-edit the generated files, they will be overwritten.
 */
import { Buffer } from 'node:buffer'
import { mkdir, writeFile, copyFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = (p) => resolve(root, p)
const out = (p) => resolve(root, 'public', p)

const MARK = src('assets-src/berry-mark.svg')
const WORDMARK = src('public/naughty-berry-logo.png')

/** Page background. iOS and Android composite icons onto their own surfaces and
 *  discard transparency, so the tile colour has to be a deliberate choice. */
const PINK = '#FFDCEA'

/** Renders the mark at `size`, optionally on an opaque tile with `pad` of the
 *  canvas left as breathing room on every side. */
async function mark(size, { background = null, pad = 0 } = {}) {
  const inner = Math.round(size * (1 - pad * 2))
  const glyph = await sharp(MARK, { density: 600 })
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
 * show when the URL is pasted. Without it those unfurls fall back to a bare
 * link, which is what the site was doing — index.html pointed at an
 * /og-image.jpg that had never existed.
 */
async function shareCard() {
  const W = 1200
  const H = 630

  const background = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FFE9F2"/>
          <stop offset="55%" stop-color="#FFDCEA"/>
          <stop offset="100%" stop-color="#FFB8D5"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.72" cy="0.5" r="0.55">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#g)"/>
      <rect width="${W}" height="${H}" fill="url(#glow)"/>
      <rect x="0" y="${H - 14}" width="${W}" height="14" fill="#E72A7C"/>
    </svg>`)

  const caption = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="120">
      <style>
        .t { font-family: "Liberation Sans", "DejaVu Sans", sans-serif; font-weight: bold;
             fill: #C2185B; letter-spacing: 1.5px; }
      </style>
      <text class="t" x="0" y="34" font-size="30">STRAWBERRIES &amp; CHOCOLATE ON TAP</text>
      <text class="t" x="0" y="84" font-size="24" fill="#7A2447" letter-spacing="5">CAPE TOWN · POP-UPS &amp; EVENTS</text>
    </svg>`)

  const wordmark = await sharp(WORDMARK).resize({ width: 480 }).png().toBuffer()
  const cup = await sharp(src('public/naughty-hero-cup.webp'))
    .resize({ height: 540, fit: 'inside' })
    .png()
    .toBuffer()
  const cupMeta = await sharp(cup).metadata()

  const card = await sharp(background)
    .composite([
      { input: cup, top: H - cupMeta.height - 30, left: W - cupMeta.width - 60 },
      { input: wordmark, top: 118, left: 66 },
      { input: caption, top: 452, left: 74 },
    ])
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4' })
    .toBuffer()

  await writeFile(out('og-image.jpg'), card)
  return { width: W, height: H, bytes: card.length }
}

async function main() {
  await mkdir(out('.'), { recursive: true })

  // Browser tabs. The SVG is what modern browsers actually use; the PNGs and the
  // ICO cover everything that does not read SVG icons.
  await copyFile(MARK, out('favicon.svg'))
  const png16 = await mark(16)
  const png32 = await mark(32)
  const png48 = await mark(48)
  await writeFile(out('favicon-96x96.png'), await mark(96))
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

  // Android / PWA install. The maskable copy keeps the mark inside the safe
  // circle so a round launcher mask never clips the leaf.
  await writeFile(out('web-app-manifest-192x192.png'), await mark(192, { background: PINK, pad: 0.08 }))
  await writeFile(out('web-app-manifest-512x512.png'), await mark(512, { background: PINK, pad: 0.08 }))
  await writeFile(out('web-app-manifest-maskable-512x512.png'), await mark(512, { background: PINK, pad: 0.22 }))

  const card = await shareCard()

  console.log('icons written to public/')
  console.log(`  favicon.svg, favicon.ico (16/32/48), favicon-96x96.png`)
  console.log(`  apple-touch-icon.png, web-app-manifest-{192,512,maskable}`)
  console.log(`  og-image.jpg (${card.width}x${card.height}, ${Math.round(card.bytes / 1024)} KB)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
