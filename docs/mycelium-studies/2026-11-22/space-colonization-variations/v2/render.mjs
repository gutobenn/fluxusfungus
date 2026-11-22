import {mkdir,writeFile,readFile}from'node:fs/promises';
const{default:sharp}=await import(process.env.SHARP_MODULE??'sharp');
import{WIDTH,HEIGHT,PALETTES,makeGrowth}from'./model.mjs';
const output=new URL('./images/',import.meta.url);await mkdir(output,{recursive:true});
export const samples=[{seed:'ff-colony-v2-003',title:'01 · Fino e espaçado'},{seed:'ff-colony-v2-588',title:'02 · Mais espesso e denso'},{seed:'ff-colony-v2-000',title:'03 · Origem à esquerda'},{seed:'ff-colony-v2-009',title:'04 · Expansão mais ampla'},{seed:'ff-colony-v2-030',title:'05 · Origem alta, manchas irregulares'}];
export function svg(growth,title,palette='ivory'){
 const p=growth.config,rgb=PALETTES[palette].rgb;
 const lines=growth.segments.map(s=>`<path d="M${s.x.toFixed(2)} ${s.y.toFixed(2)}L${s.nx.toFixed(2)} ${s.ny.toFixed(2)}" stroke-width="${s.width.toFixed(2)}" stroke-opacity="${s.alpha.toFixed(2)}"/>`).join('');
 const halo=PALETTES[palette].emission?`<g fill="none" stroke="rgb(${rgb.join(',')})" stroke-linecap="round">${growth.segments.map(s=>`<path d="M${s.x.toFixed(2)} ${s.y.toFixed(2)}L${s.nx.toFixed(2)} ${s.ny.toFixed(2)}" stroke-width="${(s.width+2.4).toFixed(2)}" stroke-opacity="${(s.alpha*.12).toFixed(3)}"/>`).join('')}</g>`:'';
 const pins=growth.markers.map(p=>`<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="4.5" fill="#ff6347" stroke="#f4eee4" stroke-width="1.3"/>`).join('');
 return`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#e1c0af"><text x="46" y="40" font-size="20">fluxus fungus · protótipo offline v2</text><text x="46" y="80" font-size="27" fill="#f3eee2">${title}</text><text x="46" y="111" font-size="15">${growth.seed} · origem (${Math.round(p.origin.x)}, ${Math.round(p.origin.y)}) · ${p.nutrientCount} nutrientes</text><text x="46" y="137" font-size="13" fill="#b5a498">Ponto branco inicial · ${PALETTES[palette].name} · ritmos independentes por ramo</text></g>${halo}<g fill="none" stroke="rgb(${rgb.join(',')})" stroke-linecap="round">${lines}</g>${pins}<ellipse cx="${p.origin.x}" cy="${p.origin.y}" rx="9" ry="10" fill="#fffdf5" opacity=".13"/><ellipse cx="${p.origin.x}" cy="${p.origin.y}" rx="3.8" ry="4.8" fill="#fffdf5"/></svg>`;
}
const tiles=[],metrics=[];
for(let index=0;index<samples.length;index++){
 const sample=samples[index],started=performance.now(),growth=makeGrowth(sample.seed);const png=await sharp(Buffer.from(svg(growth,sample.title))).png().toBuffer();
 await writeFile(new URL(`variation-${index+1}.png`,output),png);tiles.push({input:await sharp(png).resize(720,450).toBuffer(),left:index%2*720,top:Math.floor(index/2)*450});
 metrics.push({seed:sample.seed,title:sample.title,config:growth.config,nodes:growth.nodes.length,markers:growth.markers.length,milliseconds:Math.round(performance.now()-started)});console.log(metrics.at(-1));
}
const legend=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450"><rect width="100%" height="100%" fill="#302625"/><g fill="#e1c0af" font-family="monospace" font-size="21"><text x="35" y="108" fill="#f3eee2" font-size="29">Origens e ritmos diferentes</text><text x="35" y="160">Esporo branco visível desde o início.</text><text x="35" y="204">Variações de extensão e espessura.</text><text x="35" y="248">Nutrientes em manchas e vazios.</text><text x="35" y="292">Cada ramo avança no seu ritmo.</text><text x="35" y="356" font-size="18">Nenhuma alteração no site publicado.</text></g></svg>`;
tiles.push({input:Buffer.from(legend),left:720,top:900});await sharp({create:{width:1440,height:1350,channels:3,background:'#302625'}}).composite(tiles).png().toFile(new URL('comparison.png',output).pathname);
const paletteTiles=[],paletteGrowth=makeGrowth(samples[1].seed);let row=0;
for(const key of Object.keys(PALETTES)){const png=await sharp(Buffer.from(svg(paletteGrowth,`Mesma geometria · ${PALETTES[key].name}`,key))).png().toBuffer();await writeFile(new URL(`palette-${key}.png`,output),png);paletteTiles.push({input:await sharp(png).resize(720,450).toBuffer(),left:row%3*720,top:Math.floor(row++/3)*450});}
await sharp({create:{width:2160,height:Math.ceil(Object.keys(PALETTES).length/3)*450,channels:3,background:'#302625'}}).composite(paletteTiles).png().toFile(new URL('palettes.png',output).pathname);
await writeFile(new URL('./metrics.json',import.meta.url),JSON.stringify(metrics,null,2)+'\n');
const source=(await readFile(new URL('./model.mjs',import.meta.url),'utf8')).replace(/^export /gm,'');const template=await readFile(new URL('./prototype.template.html',import.meta.url),'utf8');await writeFile(new URL('./prototype.html',import.meta.url),template.replace('/* MODEL_SOURCE */',source));
