import assert from'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';const{chromium}=await import(process.env.PLAYWRIGHT_MODULE??'playwright');const{default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
const output=new URL('./proof/',import.meta.url);await mkdir(output,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1480,height:1200}}),errors=[],metrics=[];page.on('pageerror',e=>{errors.push(String(e));console.log('PAGE ERROR',String(e));});
try{
 await page.goto(new URL('./prototype.html',import.meta.url).href);await page.waitForFunction(()=>window.preview?.growth);
 assert.equal(await page.locator('#style').inputValue(),'auto');assert.equal(await page.locator('#palette option').count(),8);assert.equal(await page.locator('#palette option[value="luminous"]').count(),0);
 const seed='ff-colony-v3-reference';
 for(const style of['clean','fuzzy','fans']){
  await page.selectOption('#style',style);await page.evaluate(seed=>window.preview.start(seed),seed);await page.waitForFunction(({seed,style})=>window.preview.growth?.seed===seed&&window.preview.growth?.style===style&&window.currentGrowth?.segments,{seed,style});
  const g=await page.evaluate(()=>({duration:window.preview.growth.duration,segments:window.preview.growth.segments.length}));
  const tiles=[],times=[0,g.duration*.18,g.duration*.42,g.duration*.7,g.duration];
  for(let index=0;index<times.length;index++){
   await page.evaluate(time=>window.preview.showAt(time),times[index]);const png=await page.locator('canvas').screenshot();await writeFile(new URL(`${style}-frame-${index}.png`,output),png);
   const left=index%2*720,top=Math.floor(index/2)*490,label=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="40"><rect width="100%" height="100%" fill="#302625"/><text x="20" y="28" font-family="monospace" font-size="23" fill="#eee">${style} · ${(times[index]/1000).toFixed(1)} s</text></svg>`;tiles.push({input:Buffer.from(label),left,top},{input:await sharp(png).resize(720,450).toBuffer(),left,top:top+40});
  }
  await sharp({create:{width:1440,height:1470,channels:3,background:'#302625'}}).composite(tiles).png().toFile(new URL(`${style}-keyframes.png`,output).pathname);assert.equal((await page.evaluate(()=>window.currentGrowth)).markers,10);
  if(style==='clean')continue;
  const age=await page.evaluate(()=>{
   const s=window.preview.growth.segments.find(s=>s.width>4&&s.matureAt>s.end+1000),counts=[];
   for(const time of[s.end,s.matureAt]){const c=document.createElement('canvas');c.width=80;c.height=80;const x=c.getContext('2d');x.translate(30-s.x,35-s.y);strokeSegment(x,s,1,'ivory',time);counts.push([...x.getImageData(0,0,80,80).data].filter((v,i)=>i%4===3&&v>30).length);}return counts;
  });assert.ok(age[1]>age[0]*2);
  const video=await page.evaluate(async()=>{
   const stream=document.querySelector('canvas').captureStream(30),chunks=[],rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2500000});rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};const stopped=new Promise(resolve=>rec.onstop=resolve);rec.start();window.preview.replay();await new Promise(resolve=>setTimeout(resolve,window.preview.growth.duration+450));rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());const bytes=new Uint8Array(await new Blob(chunks).arrayBuffer());let text='';for(let i=0;i<bytes.length;i+=16000)text+=String.fromCharCode(...bytes.subarray(i,i+16000));return btoa(text);
  });await writeFile(new URL(`${style}.webm`,output),Buffer.from(video,'base64'));
  const profile=await page.evaluate(()=>{const f=window.frameStats,t=f.times,sorted=[...f.renders].sort((a,b)=>a-b);return{frames:t.length,fps:(t.length-1)/(t.at(-1)-t[0])*1000,averageRenderMs:f.renders.reduce((a,b)=>a+b,0)/f.renders.length,p95RenderMs:sorted[Math.floor(sorted.length*.95)]};});metrics.push({style,...g,agePixelCounts:age,...profile});console.log(metrics.at(-1));
 }
 // Copy/reproduce retains the actual family, seed and independent manual color.
 await page.locator('summary').first().click();await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copied=text;}}}));await page.selectOption('#palette','teal');await page.locator('#copy').click();const copied=await page.evaluate(()=>window.copied);assert.deepEqual(JSON.parse(copied),{seed,style:'fans',palette:'teal'});
 await page.selectOption('#style','clean');await page.locator('#seed').fill(copied);await page.locator('#reproduce').click();await page.waitForFunction(()=>window.currentGrowth?.style==='fans'&&window.currentGrowth?.segments);assert.equal(await page.locator('#palette').inputValue(),'teal');await page.evaluate(()=>window.preview.showAt(window.preview.growth.duration));await page.locator('summary').first().click();await page.screenshot({path:new URL('desktop.png',output).pathname});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:new URL('mobile.png',output).pathname});assert.ok(await page.locator('canvas').evaluate(c=>c.getBoundingClientRect().width)<=390);
 assert.deepEqual(errors,[]);await writeFile(new URL('./browser-metrics.json',import.meta.url),JSON.stringify(metrics,null,2)+'\n');console.log('All3styles,8colors,no luminous,age-pixel growth,10markers,copy/reproduce,desktop/mobile,no JSerrors passed.');
}finally{await browser.close();}
