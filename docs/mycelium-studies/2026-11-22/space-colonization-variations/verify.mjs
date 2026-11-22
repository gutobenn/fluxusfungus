import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { SEED, AREA, spaceColonization, spaceColonizationVariation, markerPositions } from '../algorithms.mjs';
const hash = growth => createHash('sha256').update(JSON.stringify(growth.segments)).digest('hex');
// Fingerprint captured from the selected original 03 before adding variation support.
assert.equal(hash(spaceColonization(SEED)), 'e00fc837aa0b0a44de8f4fbdcd38821262413c6eecdd80fb238bc330f470d7d1');
console.log('Original selected 03 geometry remains unchanged.');
const samples=JSON.parse(await readFile(new URL('./metrics.json',import.meta.url),'utf8'));
const fingerprints=new Set();
for(const sample of samples){
 const start=performance.now(),first=spaceColonizationVariation(sample.seed),second=spaceColonizationVariation(sample.seed);
 const fingerprint=hash(first);assert.equal(fingerprint,hash(second));fingerprints.add(fingerprint);
 assert.deepEqual(first.parameters,second.parameters);assert.deepEqual(first.parameters,sample.parameters);
 const p=first.parameters;
 assert.ok(p.nutrientCount>=2820&&p.nutrientCount<=3180);
 assert.ok(p.influence>=76*.94&&p.influence<=76*1.06);
 assert.ok(p.consumption>=8*.94&&p.consumption<=8*1.06);
 assert.ok(p.step>=5.5*.96&&p.step<=5.5*1.04);
 for(const line of first.segments){
  Object.values(line).forEach(value=>assert.ok(Number.isFinite(value)));
  assert.ok(line.width>0&&line.alpha>0&&line.alpha<=1);
  for(const [x,y] of [[line.x,line.y],[line.nx,line.ny]])assert.ok(x>=AREA.left&&x<=AREA.right&&y>=AREA.top&&y<=AREA.bottom);
 }
 const markers=markerPositions(first.nodes);
 assert.equal(markers.length,10);assert.equal(new Set(markers.map(p=>`${p.x},${p.y}`)).size,10);
 assert.ok(first.segments.length>4000&&first.segments.length<9000);
 const ms=Math.round(performance.now()-start);assert.ok(ms<10000);
 console.log(`${sample.seed}: repeatable, subtle parameters, finite bounds, 10 markers; two runs ${ms}ms`);
}
assert.equal(fingerprints.size,5,'Different seeds must produce different geometry');
console.log('All five space-colonization variations passed.');
