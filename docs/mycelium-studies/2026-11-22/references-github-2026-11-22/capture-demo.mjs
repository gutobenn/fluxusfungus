import {chromium} from '/private/tmp/claude-502/-Users-augusto-Projects-Work-Yums-personal-agent-augusto-bennemann/b08b4387-6d93-44b8-8620-af81a1f9b12f/scratchpad/pw/node_modules/playwright/index.mjs';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1050}});
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  const path=url.pathname.replace(/^\/animated-fungal-network-growth\/?/,'')||'index.html';
  if(url.host!=='synosys.github.io'||path.includes('..'))return route.abort();
  try {
   const body=await readFile(new URL('original-synosys/'+path,import.meta.url));
   const ext=path.split('.').pop(),type={html:'text/html',js:'application/javascript',css:'text/css',csv:'text/csv'}[ext];
   await route.fulfill({status:200,contentType:type,body});
  } catch {await route.fulfill({status:404,body:'This frame is not included in the local reference snapshot.'});}
 });
 const response=await page.goto('https://synosys.github.io/animated-fungal-network-growth/',{waitUntil:'networkidle'});
 console.log(JSON.stringify({status:response.status(),title:await page.title(),body:(await page.locator('body').innerText()).slice(0,350)}));
 await page.locator('select').first().waitFor({timeout:15000});
 for (const genus of ['Neurospora']) {
  await page.locator('select').first().selectOption(genus);
  await page.waitForLoadState('networkidle');
  if(await page.getByRole('button',{name:'Pause',exact:true}).count()) await page.getByRole('button',{name:'Pause',exact:true}).click();
  const last=page.locator('button[aria-label^="Show frame "]').last();
  const label=await last.getAttribute('aria-label');
  await last.click();
  await page.waitForLoadState('networkidle');
  await page.screenshot({path:new URL(`synosys-${genus.toLowerCase()}.png`,import.meta.url).pathname});
  console.log(JSON.stringify({genus,frame:label,file:`synosys-${genus.toLowerCase()}.png`}));
 }
} finally {await browser.close();}
