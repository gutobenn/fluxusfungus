/** Capture nine colors from the real offline canvas, without rerendering geometry variants. */
import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright'),{default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
import{PALETTES}from'./model.mjs';const output=new URL('./images/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1480,height:1260}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
const geometry=()=>page.evaluate(()=>JSON.stringify(window.preview.growth));
try{
 await page.goto(new URL('./prototype.html',import.meta.url).href);await page.waitForFunction(()=>window.preview?.growth);assert.equal(await page.locator('#palette').inputValue(),'ivory');
 const seed='ff-colony-v2-588';await page.evaluate(seed=>window.preview.start(seed),seed);await page.waitForFunction(seed=>window.preview.growth?.seed===seed&&window.currentGrowth?.segments,seed);await page.evaluate(()=>window.preview.showAt(window.preview.growth.duration));
 const original=await geometry(),keys=Object.keys(PALETTES),options=await page.locator('#palette option').evaluateAll(nodes=>nodes.map(n=>n.value));assert.deepEqual(options,keys);assert.equal(keys.length,9);
 const tiles=[],hashes=new Set(),metrics=[];let index=0;
 for(const key of keys){
  const palette=PALETTES[key];
  const elapsed=await page.evaluate(key=>{const start=performance.now(),select=document.getElementById('palette');select.value=key;select.dispatchEvent(new Event('change'));document.querySelector('canvas').getContext('2d').getImageData(0,0,1,1);return performance.now()-start;},key);
  assert.ok(elapsed<1000);assert.equal(await geometry(),original);assert.equal(await page.locator('#palette-note i').textContent(),palette.species);assert.equal(await page.locator('#palette-note a').getAttribute('href'),palette.source);assert.equal((await page.evaluate(()=>window.currentGrowth)).markers,10);
  const colors=await page.evaluate(()=>{const g=window.preview.growth,ctx=document.querySelector('canvas').getContext('2d'),o=g.config.origin,p=g.markers[0];return{root:[...ctx.getImageData(Math.round(o.x),Math.round(o.y),1,1).data],marker:[...ctx.getImageData(Math.round(p.x),Math.round(p.y),1,1).data]};});assert.ok(colors.root[0]>240&&colors.root[1]>235&&colors.root[2]>225);assert.ok(colors.marker[0]>245&&colors.marker[1]<110&&colors.marker[2]<85);
  const png=await page.locator('canvas').screenshot();await writeFile(new URL(`palette-${key}.png`,output),png);hashes.add(createHash('sha256').update(png).digest('hex'));
  const left=index%3*720,top=Math.floor(index/3)*510,label=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="60"><rect width="100%" height="100%" fill="#302625"/><text x="22" y="29" font-size="25" fill="#f3eee2" font-family="sans-serif">${palette.name}${palette.emission?' · bioluminescência':''}</text><text x="22" y="51" font-size="16" font-style="italic" fill="#baa99c" font-family="sans-serif">${palette.species}</text></svg>`;
  tiles.push({input:Buffer.from(label),left,top},{input:await sharp(png).resize(720,450).toBuffer(),left,top:top+60});metrics.push({key,name:palette.name,milliseconds:Math.round(elapsed),emission:!!palette.emission});index++;
 }
 assert.equal(hashes.size,9);await sharp({create:{width:2160,height:1530,channels:3,background:'#302625'}}).composite(tiles).png().toFile(new URL('palettes.png',output).pathname);
 assert.ok((await page.locator('#palette-note').textContent()).includes('bioluminescência, não pigmento'));
 await page.locator('summary').first().click();await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedPalette=text;}}}));await page.locator('#copy').click();
 const copied=await page.evaluate(()=>window.copiedPalette);assert.deepEqual(JSON.parse(copied),{seed,palette:'luminous'});await page.selectOption('#palette','ivory');await page.locator('#seed').fill(copied);await page.locator('#reproduce').click();await page.waitForFunction(()=>Boolean(window.currentGrowth?.segments));assert.equal(await page.locator('#palette').inputValue(),'luminous');assert.equal(await geometry(),original);assert.equal(await page.locator('#palette-note i').textContent(),'Neonothopanus gardneri');
 await page.evaluate(()=>window.preview.showAt(window.preview.growth.duration));await page.locator('summary').first().click();await page.screenshot({path:new URL('./proof/nine-palettes-desktop.png',import.meta.url).pathname,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('./proof/nine-palettes-mobile.png',import.meta.url).pathname,fullPage:true});assert.ok(await page.locator('#palette-note').evaluate(n=>n.getBoundingClientRect().right<=innerWidth));
 assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith('file:')));await writeFile(new URL('./palette-metrics.json',import.meta.url),JSON.stringify({seed,palettes:metrics},null,2)+'\n');console.log('Nine palette/reference/color outputs validated; complete geometry/timing unchanged; white spore+10redmarkers; copy/reproduce; desktop/mobile; no network/errors.',metrics);
}finally{await browser.close();}
