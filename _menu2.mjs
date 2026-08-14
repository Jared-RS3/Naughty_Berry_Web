import { chromium } from 'playwright-core'
const b = await chromium.launch()
for (const vp of [{n:'iPhoneSE',w:375,h:667},{n:'iPhone14',w:393,h:852},{n:'GalaxyS20',w:412,h:915}]) {
  const ctx = await b.newContext({ viewport:{width:vp.w,height:vp.h}, isMobile:true, hasTouch:true, deviceScaleFactor:2 })
  await ctx.addInitScript(()=>{try{localStorage.setItem('nb.cookie-consent',JSON.stringify({version:1,analytics:'denied',decidedAt:new Date().toISOString()}))}catch{}})
  const p = await ctx.newPage()
  await p.goto('http://localhost:4173/', { waitUntil:'domcontentloaded' })
  await p.waitForTimeout(3500)
  // select the longest-description item
  for (let i=0;i<3;i++){ const nx=p.getByRole('button',{name:/Next flavour/i}).first(); if(await nx.count()){await nx.click(); await p.waitForTimeout(600)} }
  await p.waitForTimeout(600)
  // now re-anchor exactly as a nav click would
  await p.evaluate(()=>{ location.hash=''; location.hash='#menu' })
  await p.waitForTimeout(2500)
  const r = await p.evaluate(() => {
    const sec = document.querySelector('#menu')
    const ps = [...document.querySelectorAll('#menu p')]
    const desc = ps.find(n=>/kunafeh/i.test(n.innerText))
    const price = ps.find(n=>/^R\s?\d/.test(n.innerText.trim()))
    const tabs = document.querySelector('#menu button')
    const g = e => { if(!e) return null; const b=e.getBoundingClientRect(); return {top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right)} }
    return { vh: innerHeight, sec:g(sec), tabs:g(tabs), desc:g(desc), price:g(price),
      priceFullyVisible: price ? g(price).bottom <= innerHeight : null,
      overflowPx: price ? Math.max(0, g(price).bottom - innerHeight) : null }
  })
  console.log(`${vp.n.padEnd(10)} vh=${r.vh} secTop=${r.sec.top} tabsTop=${r.tabs?.top} descTop=${r.desc?.top} priceBottom=${r.price?.bottom} visible=${r.priceFullyVisible} overflow=${r.overflowPx}px`)
  await ctx.close()
}
await b.close()
