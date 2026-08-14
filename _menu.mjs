import { chromium } from 'playwright-core'
const b = await chromium.launch()
for (const vp of [{n:'iPhoneSE',w:375,h:667},{n:'iPhone14',w:393,h:852}]) {
  const ctx = await b.newContext({ viewport:{width:vp.w,height:vp.h}, isMobile:true, hasTouch:true, deviceScaleFactor:2 })
  await ctx.addInitScript(()=>{try{localStorage.setItem('nb.cookie-consent',JSON.stringify({version:1,analytics:'denied',decidedAt:new Date().toISOString()}))}catch{}})
  const p = await ctx.newPage()
  await p.goto('http://localhost:4173/#menu', { waitUntil:'domcontentloaded' })
  await p.waitForTimeout(4000)
  // Force the Dubai Brownie item (index 3 in cups)
  for (let i=0;i<3;i++){ const nx=p.getByRole('button',{name:/Next flavour/i}).first(); if(await nx.count()){await nx.click(); await p.waitForTimeout(700)} }
  await p.waitForTimeout(800)
  const r = await p.evaluate(() => {
    const sec = document.querySelector('#menu')
    const desc = [...document.querySelectorAll('#menu p')].find(n=>/kunafeh|drenched|strawberr/i.test(n.innerText))
    const price = [...document.querySelectorAll('#menu p')].find(n=>/^R\s?\d/.test(n.innerText.trim()))
    const g = e => { if(!e) return null; const b=e.getBoundingClientRect(); return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right),w:Math.round(b.width),h:Math.round(b.height)} }
    return {
      vw: innerWidth, vh: innerHeight,
      section: g(sec), desc: g(desc), price: g(price),
      descText: desc?.innerText.slice(0,60),
      priceText: price?.innerText,
      descScrollW: desc?.scrollWidth, descClientW: desc?.clientWidth,
      priceVisible: price ? (g(price).top >= 0 && g(price).bottom <= innerHeight) : null,
    }
  })
  console.log(`\n=== ${vp.n} ${vp.w}x${vp.h} ===`)
  console.log(JSON.stringify(r,null,1))
  await p.screenshot({ path:`/tmp/menu-${vp.w}.png` })
  await ctx.close()
}
await b.close()
