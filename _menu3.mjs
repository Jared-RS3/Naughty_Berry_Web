import { chromium } from 'playwright-core'
const b = await chromium.launch()
const VPS=[{n:'small-360',w:360,h:640},{n:'iPhoneSE',w:375,h:667},{n:'iPhone14',w:393,h:852},{n:'GalaxyS20',w:412,h:915},{n:'iPadMini',w:768,h:1024},{n:'Laptop',w:1440,h:900}]
let bad=0
for (const vp of VPS) {
  const ctx = await b.newContext({ viewport:{width:vp.w,height:vp.h}, isMobile:vp.w<768, hasTouch:vp.w<768, deviceScaleFactor:vp.w<768?2:1 })
  await ctx.addInitScript(()=>{try{localStorage.setItem('nb.cookie-consent',JSON.stringify({version:1,analytics:'denied',decidedAt:new Date().toISOString()}))}catch{}})
  const p = await ctx.newPage()
  await p.goto('http://localhost:4173/', { waitUntil:'domcontentloaded' })
  await p.waitForTimeout(3500)
  for (let i=0;i<3;i++){ const nx=p.getByRole('button',{name:/Next flavour/i}).first(); if(await nx.count()){await nx.click(); await p.waitForTimeout(600)} }
  await p.evaluate(()=>{ location.hash=''; location.hash='#menu' })
  await p.waitForTimeout(2200)
  const r = await p.evaluate(() => {
    const ps=[...document.querySelectorAll('#menu p')]
    const desc=ps.find(n=>/kunafeh/i.test(n.innerText))
    const price=ps.find(n=>/^R\s?\d/.test(n.innerText.trim()))
    const g=e=>{const b=e.getBoundingClientRect();return{top:Math.round(b.top),bottom:Math.round(b.bottom),left:Math.round(b.left),right:Math.round(b.right)}}
    const d=g(desc), pr=g(price)
    return { vh:innerHeight, vw:innerWidth, descLeft:d.left, descRight:d.right,
      descFont: getComputedStyle(desc).fontSize, descOverflowX: desc.scrollWidth>desc.clientWidth,
      priceBottom:pr.bottom, priceVisible: pr.bottom<=innerHeight && pr.top>=0,
      marginPx: innerHeight-pr.bottom, sideMargin: Math.min(d.left, innerWidth-d.right),
      docOverflow: document.documentElement.scrollWidth>document.documentElement.clientWidth+1 }
  })
  const ok = r.priceVisible && !r.descOverflowX && !r.docOverflow && r.sideMargin>=24
  if(!ok) bad++
  console.log(`${ok?'✓':'✗'} ${vp.n.padEnd(10)} ${vp.w}x${vp.h} price-visible=${r.priceVisible} (${r.marginPx}px spare) descFont=${r.descFont} sideMargin=${r.sideMargin}px descOverflowX=${r.descOverflowX} pageOverflow=${r.docOverflow}`)
  await p.screenshot({path:`/tmp/menu2-${vp.w}.png`})
  await ctx.close()
}
await b.close()
console.log(bad?`\n${bad} FAILED`:'\nAll clean')
process.exit(bad?1:0)
