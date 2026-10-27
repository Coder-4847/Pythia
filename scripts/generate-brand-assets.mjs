// Rasterises the hand-coded SVG mark into the PNG icons and the Open Graph card.
// Run with `npm run brand` after changing the logo; outputs are committed to /public.
import { chromium } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const GOLD = '#e2b253'
const INK = '#0b0d10'
const MARK = `
  <g fill="none" stroke="${GOLD}" stroke-linecap="round" stroke-linejoin="round">
    <path stroke-width="5" d="M14 53C14 58 21 58.5 22 53C23 47 19 44 20.5 38C21.5 33 22 30 22 25V15"/>
    <path stroke-width="5" d="M22 15C22 9.5 27 7 34 7C47 7 54 14 54 23C54 32 47 38 37 38C34 38 32 37.6 30 36.2"/>
    <path stroke-width="2" d="M30 36.2L27 34.8M30 36.2L26.8 37.6"/>
  </g>
  <circle cx="36.5" cy="22.5" r="3.8" fill="${GOLD}"/>`

/** Square icon; `pad` is the safe-zone fraction used for maskable icons. */
const icon = (size, pad) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
    <rect width="64" height="64" fill="${INK}"/>
    <g transform="translate(${32 - 32 * (1 - pad)} ${32 - 32 * (1 - pad)}) scale(${1 - pad})">${MARK}</g>
  </svg>`

const og = `<html><body style="margin:0;width:1200px;height:630px;background:${INK};position:relative;overflow:hidden;font-family:'Instrument Serif',Georgia,serif;color:#ece9e1">
  <div style="position:absolute;right:-160px;top:-200px;width:760px;height:760px;border-radius:50%;background:radial-gradient(closest-side,${GOLD}33,transparent)"></div>
  <svg style="position:absolute;left:84px;top:90px" width="96" height="96" viewBox="0 0 64 64">${MARK}</svg>
  <div style="position:absolute;left:84px;top:230px;font-size:92px;line-height:1.02;letter-spacing:-0.02em;width:900px">The tutor that sees your bugs coming.</div>
  <div style="position:absolute;left:84px;top:500px;font:28px/1.4 system-ui,sans-serif;color:#a0a7b3">Learn Python from print() to machine learning — Pythia asks the question, never hands you the fix.</div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage()
const targets = [
  ['apple-touch-icon.png', 180, 0.12],
  ['icon-192.png', 192, 0.12],
  ['icon-512.png', 512, 0.12],
  ['icon-maskable-512.png', 512, 0.28],
]
for (const [file, size, pad] of targets) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<body style="margin:0">${icon(size, pad)}</body>`)
  await writeFile(`public/${file}`, await page.screenshot())
}
await page.setViewportSize({ width: 1200, height: 630 })
await page.setContent(og)
await page.evaluate(() => document.fonts.ready)
await writeFile('public/og.png', await page.screenshot())
await browser.close()
