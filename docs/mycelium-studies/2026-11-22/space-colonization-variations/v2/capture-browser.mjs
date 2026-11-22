import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
const{chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');const{default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
const output=new URL('./proof/',import.meta.url);await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1480,height:1100}});const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
const fingerprint=()=>page.evaluate(()=>JSON.stringify(window.preview.growth.segments));
try{
 await page.goto(new URL('./prototype.html',import.meta.url).href);await page.waitForFunction(()=>window.preview?.growth);
 const seed='ff-colony-v2-588';await page.evaluate(seed=>window.preview.start(seed),seed);await page.waitForFunction(seed=>window.preview.growth?.seed===seed,seed);
 const initial=await fingerprint(),frames=[],times=[0,3000,6500,11000,17000,22500];
 for(let index=0;index<times.length;index++){
  await page.evaluate(time=>window.preview.showAt(time),times[index]);
  const png=await page.locator('canvas').screenshot();await writeFile(new URL(`frame-${index}.png`,output),png);
  const label=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="44"><rect width="100%" height="100%" fill="#302625"/><text x="24" y="30" font-size="23" fill="#eee" font-family="monospace">${(times[index]/1000).toFixed(1)} s · sem zoom</text></svg>`;
  frames.push({input:Buffer.from(label),left:index%2*720,top:Math.floor(index/2)*494});frames.push({input:await sharp(png).resize(720,450).toBuffer(),left:index%2*720,top:Math.floor(index/2)*494+44});
 }
 await sharp({create:{width:1440,height:1482,channels:3,background:'#302625'}}).composite(frames).png().toFile(new URL('growth-keyframes.png',output).pathname);
 // The root pixel remains ivory and no post marker overlaps it, even in colored modes.
 for(const palette of['ivory','amber','teal']){
  await page.selectOption('#palette',palette);assert.equal(await fingerprint(),initial);
  const root=await page.evaluate(()=>{const g=window.preview.growth,o=g.config.origin;return Array.from(document.querySelector('canvas').getContext('2d').getImageData(Math.round(o.x),Math.round(o.y),1,1).data);});assert.ok(root[0]>240&&root[1]>235&&root[2]>225);
 }
 await page.selectOption('#palette','ivory');
 // Record actual wall-clock canvas animation, including asynchronous pauses and growing tips.
 const video=await page.evaluate(async()=>{
  const stream=document.querySelector('canvas').captureStream(30),chunks=[],recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2400000});
  recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
  const stopped=new Promise(resolve=>recorder.onstop=resolve);recorder.start();window.preview.replay();await new Promise(resolve=>setTimeout(resolve,window.preview.growth.duration+500));recorder.stop();await stopped;stream.getTracks().forEach(t=>t.stop());
  const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=16000)text+=String.fromCharCode(...bytes.subarray(i,i+16000));return btoa(text);
 });await writeFile(new URL('growth.webm',output),Buffer.from(video,'base64'));
 assert.equal((await page.evaluate(()=>window.currentGrowth)).markers,10);
 // Reproduction, regeneration, mobile fitting and palette persistence.
 await page.locator('summary').first().click();await page.locator('#seed').fill(seed);await page.locator('#reproduce').click();await page.waitForFunction(seed=>window.preview.growth?.seed===seed&&window.currentGrowth?.segments,seed);assert.equal(await fingerprint(),initial);
 await page.selectOption('#palette','teal');await page.locator('#generate').click();await page.waitForFunction(seed=>window.preview.growth?.seed!==seed&&window.currentGrowth?.segments,seed);assert.equal(await page.locator('#palette').inputValue(),'teal');
 const second=await page.evaluate(()=>window.preview.growth.seed);assert.notEqual(second,seed);
 await page.setViewportSize({width:390,height:844});assert.ok(await page.locator('canvas').evaluate(c=>c.getBoundingClientRect().width)<=390);await page.evaluate(()=>window.preview.showAt(window.preview.growth.duration));assert.equal((await page.evaluate(()=>window.currentGrowth)).markers,10);
 await page.reload();await page.waitForFunction(()=>window.preview?.growth);assert.notEqual((await page.evaluate(()=>window.preview.growth.seed)),second);assert.equal(await page.locator('#palette').inputValue(),'ivory');
 assert.deepEqual(errors,[]);assert.ok(requests.every(url=>url.startsWith('file:')));console.log('Actual animation recorded; keyframes inspected separately. Palette keeps geometry/root white; fresh origins/seeds; reproduce;10markers;mobile;no network/JSerrors.');
}finally{await browser.close();}
