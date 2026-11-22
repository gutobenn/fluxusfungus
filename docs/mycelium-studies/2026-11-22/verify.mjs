import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { ALGORITHMS, AREA, ORIGIN, SEED, markerPositions } from './algorithms.mjs';
const fingerprint = result => createHash('sha256').update(JSON.stringify(result.segments)).digest('hex');
const fingerprints = new Set();
for (const algorithm of ALGORITHMS) {
  const started=performance.now();
  const first=algorithm.run(SEED), second=algorithm.run(SEED);
  const hash=fingerprint(first);
  assert.equal(hash,fingerprint(second),`${algorithm.id}: deterministic output`);
  assert.ok(first.segments.length>1000 && first.segments.length<100000);
  for(const segment of first.segments) {
    Object.values(segment).forEach(value=>assert.ok(Number.isFinite(value)));
    for(const [x,y] of [[segment.x,segment.y],[segment.nx,segment.ny]]) assert.ok(x>=AREA.left&&x<=AREA.right&&y>=AREA.top&&y<=AREA.bottom,`${algorithm.id}: bounds`);
    assert.ok(segment.width>0 && segment.width<6 && segment.alpha>0 && segment.alpha<=1);
  }
  assert.ok(first.segments.some(segment=>Math.hypot(segment.x-ORIGIN.x,segment.y-ORIGIN.y)<.01));
  const markers=markerPositions(first.nodes);
  assert.equal(markers.length,10);
  assert.equal(new Set(markers.map(point=>`${point.x},${point.y}`)).size,10);
  const xs=first.nodes.map(point=>point.x),ys=first.nodes.map(point=>point.y);
  assert.ok(Math.max(...xs)-Math.min(...xs)>500 && Math.max(...ys)-Math.min(...ys)>400,`${algorithm.id}: nontrivial spatial coverage`);
  const milliseconds=Math.round(performance.now()-started);
  assert.ok(milliseconds<60000,`${algorithm.id}: finite time budget for two generations`);
  fingerprints.add(hash);
  console.log(`${algorithm.id}: deterministic, finite, bounded, 10 markers; ${first.segments.length} segments; 2 runs ${milliseconds}ms`);
}
assert.equal(fingerprints.size,5);
console.log('All five independent algorithm outputs passed validation.');
