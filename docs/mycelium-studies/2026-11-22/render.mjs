import { mkdir, writeFile } from 'node:fs/promises';
const { default: sharp } = await import(process.env.SHARP_MODULE ?? 'sharp');
import { ALGORITHMS, WIDTH, HEIGHT, SEED, markerPositions } from './algorithms.mjs';
const directory = new URL('./images/', import.meta.url);
await mkdir(directory, { recursive: true });
const escape = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const tileInputs=[], results=[];
for (const algorithm of ALGORITHMS) {
  const started=performance.now(), result=algorithm.run(SEED), markers=markerPositions(result.nodes);
  const ms=Math.round(performance.now()-started);
  const paths=result.segments.map(segment=>`<path d="M${segment.x.toFixed(2)} ${segment.y.toFixed(2)}L${segment.nx.toFixed(2)} ${segment.ny.toFixed(2)}" stroke-width="${segment.width.toFixed(2)}" stroke-opacity="${segment.alpha.toFixed(2)}"/>`).join('');
  const dots=markers.map(point=>`<circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="10" fill="#ff6347" opacity=".13"/><circle cx="${point.x.toFixed(2)}" cy="${point.y.toFixed(2)}" r="4.5" fill="#ff6347" stroke="#f4eee4" stroke-width="1.3"/>`).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#e1c0af"><text x="46" y="40" font-size="20">fluxus fungus · estudos offline</text><text x="46" y="80" font-size="28" fill="#f3eee2">${escape(algorithm.id.slice(0,2))} · ${escape(algorithm.name)}</text><text x="46" y="111" font-size="17">${escape(algorithm.method)}</text><text x="46" y="137" font-size="13" fill="#b5a498">${escape(result.detail)}</text></g><g fill="none" stroke="#f3eee2" stroke-linecap="round">${paths}</g>${dots}</svg>`;
  const png=await sharp(Buffer.from(svg)).png().toBuffer();
  await writeFile(new URL(`${algorithm.id}.png`,directory),png);
  const index=tileInputs.length;
  tileInputs.push({input:await sharp(png).resize(720,450).toBuffer(),left:(index%2)*720,top:Math.floor(index/2)*450});
  const metrics={id:algorithm.id,segments:result.segments.length,nodes:result.nodes.length,markers:markers.length,milliseconds:ms};
  results.push(metrics);console.log(metrics);
}
const legend=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="450"><rect width="100%" height="100%" fill="#302625"/><g font-family="monospace" fill="#e1c0af"><text x="42" y="118" font-size="26" fill="#f3eee2">Cinco algoritmos diferentes</text><text x="42" y="166" font-size="19">Mesma tela: 1440 × 900</text><text x="42" y="200" font-size="19">Mesma semente e origem</text><text x="42" y="234" font-size="19">10 marcadores por desenho</text><text x="42" y="293" font-size="18">Experimentos artísticos offline.</text><text x="42" y="324" font-size="18">O micélio publicado permanece igual.</text></g></svg>`;
tileInputs.push({input:Buffer.from(legend),left:720,top:900});
await sharp({create:{width:1440,height:1350,channels:3,background:'#302625'}}).composite(tileInputs).png().toFile(new URL('comparison.png',directory).pathname);
await writeFile(new URL('./metrics.json',import.meta.url),JSON.stringify({seed:SEED,canvas:{width:WIDTH,height:HEIGHT},algorithms:results},null,2)+'\n');
