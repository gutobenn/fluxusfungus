import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const { chromium }=await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1050}});
const errors=[],requests=[];page.on('pageerror',error=>errors.push(String(error)));page.on('request',request=>requests.push(request.url()));
const done=()=>page.waitForFunction(()=>window.currentGrowth?.finished===true);
const signature=async()=>createHash('sha256').update(await page.locator('canvas').evaluate(canvas=>canvas.toDataURL())).digest('hex');
try {
await page.goto(new URL('./prototype.html',import.meta.url).href);await done();
const first=await page.evaluate(()=>window.currentGrowth),firstHash=await signature();assert.equal(first.markers,10);
await page.locator('#generate').click();await done();const second=await page.evaluate(()=>window.currentGrowth);
assert.notEqual(first.seed,second.seed);assert.notEqual(firstHash,await signature());
await page.locator('summary').click();await page.locator('#seed').fill(first.seed);await page.locator('#reproduce').click();await done();
assert.equal((await page.evaluate(()=>window.currentGrowth)).seed,first.seed);assert.equal(await signature(),firstHash);
await page.reload();await done();assert.notEqual((await page.evaluate(()=>window.currentGrowth)).seed,first.seed);
await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('canvas').evaluate(canvas=>canvas.getBoundingClientRect().width)<=390);
assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith('file:')));
console.log('file:// opens without network; new seed on reload; Generate another changes geometry; reproducing seed matches canvas exactly; 10 markers; mobile width; no JS errors.');
} finally { await browser.close(); }
