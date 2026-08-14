import { chromium } from 'playwright-core'
const SP='/tmp/claude-1000/-workspaces-Naughty-Berry-Web/8ea617d6-255e-4a48-85a4-d83b147d44cd/scratchpad'
const B='http://localhost:8897'
const b = await chromium.launch({args:['--no-sandbox']})

console.log('=== canonical per route ===')
for (const path of ['/', '/quote', '/terms', '/privacy-policy', '/nope-404']) {
  const p = await b.newPage()
  await p.goto(B+path, {waitUntil:'networkidle'})
  await p.waitForTimeout(400)
  const c = await p.locator('link[rel=canonical]').getAttribute('href').catch(()=>null)
  console.log(`  ${path.padEnd(18)} canonical: ${c ?? '(none — correct for a 404)'}`)
  await p.close()
}

console.log('\n=== 404 page renders ===')
const p = await b.newPage({viewport:{width:1100,height:850}})
const errs=[]
p.on('pageerror', e=>errs.push(String(e)))
await p.goto(B+'/this-does-not-exist', {waitUntil:'networkidle'})
await p.waitForTimeout(700)
console.log('  h1:', (await p.locator('h1').innerText().catch(()=>'NONE')).replace(/\n/g,' '))
console.log('  title:', await p.title())
console.log('  boot overlay removed:', (await p.locator('#boot').count())===0)
console.log('  page errors:', errs.length ? errs : 'none')
await p.screenshot({path:SP+'/404.png'})

console.log('\n=== home page with schedule endpoint failing (Airtable down) ===')
const h = await b.newPage({viewport:{width:1100,height:850}})
const herrs=[]
h.on('pageerror', e=>herrs.push(String(e)))
await h.goto(B+'/', {waitUntil:'networkidle'})
await h.waitForTimeout(3500)
console.log('  page errors:', herrs.length ? herrs : 'none')
console.log('  body has content:', (await h.locator('body').innerText()).length > 200)
console.log('  hero visible:', await h.locator('h1').first().isVisible().catch(()=>false))
await h.screenshot({path:SP+'/home-degraded.png'})
await b.close()
