import { mkdir } from "node:fs/promises";
import sharp from "sharp";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const output = new URL("../../docs/mycelium-studies/", import.meta.url);
await mkdir(output, { recursive: true });
const baseURL = process.env.MYCELIUM_PREVIEW_URL ?? "http://127.0.0.1:4357";
const browser = await chromium.launch({channel:"chrome", headless:true});
const page = await browser.newPage({viewport:{width:1440,height:900}});
const errors = []; page.on("pageerror",(error)=>errors.push(String(error)));
for(const preset of ["balanced","cotton","cords","fan","web"]){
 await page.goto(`${baseURL}/scripts/previews/index.html?preset=${preset}`);
 await page.waitForFunction(()=>document.querySelectorAll(".mycelium_blob:not(.invisible)").length===10);
 await page.waitForTimeout(4500);
 await page.screenshot({path:new URL(`${preset}-browser.png`, output).pathname});
 console.log(preset,await page.locator(".mycelium_blob:not(.invisible)").count());
}
await page.locator(".mycelium_blob").first().focus(); await page.keyboard.press("Enter");
if(await page.locator("#opened").textContent()!=="Item 1") throw new Error("Keyboard open failed");
for(let index=1;index<10;index++) await page.locator(".mycelium_blob").nth(index).press("Enter");
await page.locator(".mycelium_next_button").click();
await page.waitForTimeout(1200);
if(await page.locator("#opened").textContent()!=="Próxima página")throw new Error("Next page failed");
await page.setViewportSize({width:390,height:844});
await page.waitForTimeout(4500);
if(await page.locator(".mycelium_blob:not(.invisible)").count()!==10)throw new Error("Mobile items missing");
await page.screenshot({path:new URL("mobile-browser.png", output).pathname});
await page.evaluate(()=>window.sketch.remove());
await page.waitForTimeout(1000);
if(await page.locator("canvas,.mycelium_blob").count())throw new Error("Sketch cleanup failed");
console.log("Keyboard, next page, mobile and cleanup passed",errors);
await browser.close();
if(errors.length) process.exitCode=1;

const presets = ["balanced", "cotton", "cords", "fan", "web"];
const titles = ["01 · Hifas orgânicas", "02 · Micélio algodonoso", "03 · Cordões e capilares", "04 · Leques de crescimento", "05 · Rede anastomosada"];
const tiles = [];
for (let index = 0; index < presets.length; index++) {
  const left = index % 2 * 720, top = Math.floor(index / 2) * 500;
  const label = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="50"><rect width="100%" height="100%" fill="#302625"/><text x="20" y="33" fill="#eee" font-family="sans-serif" font-size="24">${titles[index]}</text></svg>`;
  tiles.push({ input: Buffer.from(label), left, top });
  tiles.push({ input: await sharp(new URL(`${presets[index]}-browser.png`, output).pathname).resize(720,450).toBuffer(), left, top: top+50 });
}
await sharp({ create: { width:1440, height:1500, channels:3, background:"#302625" } }).composite(tiles).png().toFile(new URL("browser-comparison.png", output).pathname);
