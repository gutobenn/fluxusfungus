import { mkdir, writeFile, readFile } from 'node:fs/promises';
const { default: sharp } = await import(process.env.SHARP_MODULE ?? 'sharp');
import { WIDTH, HEIGHT, spaceColonizationVariation, markerPositions } from '../algorithms.mjs';
const output = new URL('./images/', import.meta.url);
await mkdir(output,{recursive:true});
export const seeds = ['ff-space-2026-01','ff-space-2026-02','ff-space-2026-03','ff-space-2026-04','ff-space-2026-05'];
const tiles=[],metrics=[];
for(let index=0;index<seeds.length;index++){
 const seed=seeds[index],start=performance.now(),growth=spaceColonizationVariation(seed),markers=markerPositions(growth.nodes);
 const p=growth.parameters;
 const paths=growth.segments.map(s=>`<path d="M${s.x.toFixed(2)} ${s.y.toFixed(2)}L${s.nx.toFixed(2)} ${s.ny.toFixed(2)}" stroke-width="${s.width.toFixed(2)}" stroke-opacity="${s.alpha.toFixed(2)}"/>`).join('');
 const dots=markers.map(p=>`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="10" fill="#ff6347" opacity=".13"/><circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4.5" fill="#ff6347" stroke="#f4eee4" stroke-width="1.3"/>`).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#e1c0af"><text x="46" y="40" font-size="20">fluxus fungus · estudo offline</text><text x="46" y="80" font-size="28" fill="#f3eee2">${index+1} · Colonização do espaço</text><text x="46" y="111" font-size="16">Semente: ${seed} · mesmo algoritmo, novas posições de nutrientes</text><text x="46" y="137" font-size="13" fill="#b5a498">${p.nutrientCount} atratores · influência ${p.influence.toFixed(1)} px · consumo ${p.consumption.toFixed(1)} px · avanço ${p.step.toFixed(2)} px</text></g><g fill="none" stroke="#f3eee2" stroke-linecap="round">${paths}</g>${dots}</svg>`;
 const png=await sharp(Buffer.from(svg)).png().toBuffer();
 await writeFile(new URL(`variation-${index+1}.png`,output),png);
 tiles.push({input:await sharp(png).resize(720,450).toBuffer(),left:index%2*720,top:Math.floor(index/2)*450});
 metrics.push({seed,parameters:p,segments:growth.segments.length,markers:markers.length,milliseconds:Math.round(performance.now()-start)});
 console.log(metrics.at(-1));
}
const legend=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#e1c0af"><text x="38" y="122" font-size="27" fill="#f3eee2">Um algoritmo, cinco desenhos</text><text x="38" y="170" font-size="19">Nutrientes em novas posições.</text><text x="38" y="207" font-size="19">Densidade e alcance variam até 6%.</text><text x="38" y="244" font-size="19">Avanço varia até 4%.</text><text x="38" y="310" font-size="18">Somente estudo e protótipo offline.</text><text x="38" y="344" font-size="18">O site publicado permanece igual.</text></g></svg>`;
tiles.push({input:Buffer.from(legend),left:720,top:900});
await sharp({create:{width:1440,height:1350,channels:3,background:'#302625'}}).composite(tiles).png().toFile(new URL('comparison.png',output).pathname);
await writeFile(new URL('./metrics.json',import.meta.url),JSON.stringify(metrics,null,2)+'\n');
// Inline the shared source so the prototype opens via file:// without a server.
const source=(await readFile(new URL('../algorithms.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');
const template=await readFile(new URL('./prototype.template.html',import.meta.url),'utf8');
await writeFile(new URL('./prototype.html',import.meta.url),template.replace('/* SHARED_ALGORITHM_SOURCE */',source));
