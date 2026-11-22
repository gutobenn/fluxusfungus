import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright'),{default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
const output=new URL('./proof/zoom/',import.meta.url);await mkdir(output,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1480,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
const signature=async()=>createHash('sha256').update(await page.locator('canvas').evaluate(c=>c.toDataURL())).digest('hex');
const scale=async value=>page.locator('#zoom').evaluate((input,value)=>{input.value=String(value);input.dispatchEvent(new Event('input'));},value);
try{
 await page.goto(new URL('./prototype.html',import.meta.url).href);await page.waitForFunction(()=>window.preview?.growth);assert.equal(await page.locator('#zoom').inputValue(),'1');
 const tiles=[];let row=0;
 for(const style of['fuzzy','fans']){
  await page.selectOption('#style',style);await page.evaluate(()=>window.preview.start('ff-colony-v3-reference'));await page.waitForFunction(style=>window.preview.growth?.style===style&&window.preview.growth?.seed==='ff-colony-v3-reference'&&window.currentGrowth?.segments,style);
  await page.evaluate(()=>window.preview.showAt(window.preview.growth.duration));await scale(1);const original=await signature(),geometry=await page.evaluate(()=>JSON.stringify(window.preview.growth));
  for(const value of[1,2,3]){
   await scale(value);const info=await page.evaluate(()=>({seed:window.preview.growth.seed,time:window.preview.time,scale:window.preview.scale,origin:window.preview.growth.config.origin,geometry:JSON.stringify(window.preview.growth)}));
   assert.equal(info.geometry,geometry);assert.equal(info.scale,value);const white=await page.evaluate(()=>{const o=window.preview.growth.config.origin;return[...document.querySelector('canvas').getContext('2d').getImageData(Math.round(o.x),Math.round(o.y),1,1).data];});assert.ok(white[0]>240&&white[1]>235&&white[2]>225);
   const png=await page.locator('canvas').screenshot();await writeFile(new URL(`${style}-${value}x.png`,output),png);
   if(value<=2){const label=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="44"><rect width="100%" height="100%" fill="#302625"/><text x="20" y="30" font-size="24" fill="#eee" font-family="monospace">${style==='fuzzy'?'Felpudo':'Leques'} · ${value}×</text></svg>`;tiles.push({input:Buffer.from(label),left:(value-1)*720,top:row*494},{input:await sharp(png).resize(720,450).toBuffer(),left:(value-1)*720,top:row*494+44});}
  }
  await page.locator('#zoom-reset').click();assert.equal(await signature(),original);assert.equal(await page.locator('#zoom').inputValue(),'1');
  await scale(2);await page.locator('#replay').click();const seed=await page.evaluate(()=>window.preview.growth.seed);await page.waitForTimeout(150);const before=await page.evaluate(()=>window.preview.time);await scale(3);const after=await page.evaluate(()=>window.preview.time);assert.ok(after>=before);assert.equal(await page.evaluate(()=>window.preview.growth.seed),seed);await page.waitForTimeout(150);assert.ok(await page.evaluate(()=>window.preview.time)>after);assert.equal(await page.locator('#zoom').inputValue(),'3');
  row++;
 }
 await sharp({create:{width:1440,height:988,channels:3,background:'#302625'}}).composite(tiles).png().toFile(new URL('comparison.png',output).pathname);
 await page.locator('#generate').click();await page.waitForFunction(()=>Boolean(window.currentGrowth?.segments));assert.equal(await page.locator('#zoom').inputValue(),'3');await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('mobile.png',output).pathname});assert.ok(await page.locator('canvas').evaluate(c=>c.getBoundingClientRect().right)<=390);
 assert.deepEqual(errors,[]);console.log('Zoom1/2/3x anchored white root; geometry/seed/time unchanged; exact1x restoration; animation continues; replay+new seed preserve scale; desktop/mobile; no JS errors.');
}finally{await browser.close();}
