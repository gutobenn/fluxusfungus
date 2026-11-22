import assert from'node:assert/strict';import{createHash}from'node:crypto';import{readFile}from'node:fs/promises';import{makeGrowth,AREA}from'./model.mjs';
const samples=JSON.parse(await readFile(new URL('./metrics.json',import.meta.url),'utf8')),seen=new Set(),configs=[];
for(const sample of samples){
 const started=performance.now(),g=makeGrowth(sample.seed),repeat=makeGrowth(sample.seed),hash=x=>createHash('sha256').update(JSON.stringify(x.segments)).digest('hex');assert.equal(hash(g),hash(repeat));assert.deepEqual(g.config,repeat.config);seen.add(hash(g));configs.push(g.config);
 assert.ok(Math.abs(Math.min(...g.segments.map(s=>s.start))-400)<.001);
 const continuations=g.segments.filter(s=>s.continuation);
 assert.ok(continuations.length/g.segments.length>.65);
 for(const segment of continuations){const parent=g.segments[segment.parent];assert.ok(Math.abs(segment.start-parent.end)<.000001);assert.equal(segment.front,parent.front);assert.ok(Math.abs(segment.speed/parent.speed-1)<.04);}
 const o=g.config.origin;assert.ok(o.x>=360&&o.x<=1070&&o.y>=310&&o.y<=650);
 for(const s of g.segments){
  Object.values(s).filter(v=>typeof v==='number').forEach(v=>assert.ok(Number.isFinite(v)));assert.ok(s.start>=0&&s.end>s.start&&s.end<=g.duration&&s.width>0);
  for(const[x,y]of[[s.x,s.y],[s.nx,s.ny]])assert.ok(x>=AREA.left&&x<=AREA.right&&y>=AREA.top&&y<=AREA.bottom);
  if(s.parent>=0){const parent=g.segments[s.parent];assert.ok(parent.end<=s.start+.000001);assert.equal(parent.nx,s.x);assert.equal(parent.ny,s.y);}
 }
 assert.equal(g.markers.length,10);assert.equal(new Set(g.markers.map(m=>m.index)).size,10);
 for(const marker of g.markers){assert.ok(Math.hypot(marker.x-o.x,marker.y-o.y)>70);assert.equal(marker.at,g.segments[marker.index-1].end);assert.ok(marker.at<=g.duration);}
 // Compare arrival times at comparable radii, rather than boundary-limited front lengths.
 const sectors=Array.from({length:8},()=>[]);
 for(const s of g.segments){const r=Math.hypot(s.nx-o.x,s.ny-o.y);if(r>110&&r<170){const a=Math.atan2(s.ny-o.y,s.nx-o.x)+Math.PI;sectors[Math.min(7,Math.floor(a/Math.PI/2*8))].push(s.end);}}
 const medians=sectors.filter(a=>a.length>3).map(a=>a.sort((x,y)=>x-y)[Math.floor(a.length/2)]);
 assert.ok(medians.length>=4);const ratio=Math.max(...medians)/Math.min(...medians);assert.ok(ratio>1.4,'Branches at the same radius must arrive at visibly different times');
 const elapsed=Math.round(performance.now()-started);assert.ok(elapsed<10000);console.log(`${sample.seed}: ${g.segments.length} segments, parent-safe,10 separated markers, arrival-time ratio ${ratio.toFixed(2)},2 runs ${elapsed}ms`);
}
assert.equal(seen.size,5);assert.equal(new Set(configs.map(c=>JSON.stringify(c.origin))).size,5);
assert.ok(Math.max(...configs.map(c=>c.trunk))/Math.min(...configs.map(c=>c.trunk))>2);
assert.ok(Math.max(...configs.map(c=>c.nutrientCount))/Math.min(...configs.map(c=>c.nutrientCount))>2);
console.log('Determinism, origins, broad density/thickness variation and nonradial parent-safe timing passed.');
