import{readFile,writeFile}from'node:fs/promises';
const source=await readFile(new URL('./model.mjs',import.meta.url),'utf8'),template=await readFile(new URL('./prototype.template.html',import.meta.url),'utf8'),model=await readFile(new URL('./default-model.json',import.meta.url),'utf8');
await writeFile(new URL('./prototype.html',import.meta.url),template.replace('/* MODEL */',source.replace(/export /g,'')).replace('/* DEFAULT */',model));
