import assert from'node:assert/strict';import{createHash}from'node:crypto';import{makeGrowth,pickStyle,STYLES,PALETTES,AREA}from'./model.mjs';
assert.equal(Object.keys(PALETTES).length,8);assert.ok(!('luminous'in PALETTES));const chosen=new Set(Array.from({length:40},(_,index)=>pickStyle(`sample-${index}`)));assert.equal(chosen.size,3);
const shapes=new Set();
for(const style of Object.keys(STYLES)){
 const started=performance.now(),g=makeGrowth('ff-colony-v3-reference',style),again=makeGrowth('ff-colony-v3-reference',style),hash=x=>createHash('sha256').update(JSON.stringify(x.segments)).digest('hex');assert.equal(hash(g),hash(again));shapes.add(hash(g));
 let growing=0,continuations=0;
 for(const s of g.segments){
  for(const key of['x','y','nx','ny','width','initialWidth','alpha','start','end','matureAt'])assert.ok(Number.isFinite(s[key]),`${style}:${key}`);
  assert.ok(s.end>s.start&&s.matureAt>=s.end&&s.matureAt<=g.duration+.00001&&s.width>0);
  for(const[x,y]of[[s.x,s.y],[s.nx,s.ny]])assert.ok(x>=AREA.left&&x<=AREA.right&&y>=AREA.top&&y<=AREA.bottom);
  if(s.parent>=0){const p=g.segments[s.parent];assert.ok(p.end<=s.start+.00001);assert.ok(Math.abs(p.nx-s.x)<.00001&&Math.abs(p.ny-s.y)<.00001);if(s.continuation){assert.ok(Math.abs(p.end-s.start)<.00001);continuations++;}}
  if(s.matureAt>s.end){assert.ok(s.width/s.initialWidth>3);growing++;}
 }
 assert.equal(g.markers.length,10);assert.equal(new Set(g.markers.map(p=>`${p.x},${p.y}`)).size,10);for(const m of g.markers){assert.equal(m.at,g.segments[m.index-1].end);assert.ok(m.at<=g.duration);assert.ok(Math.hypot(m.x-g.config.origin.x,m.y-g.config.origin.y)>70);}
 if(style!=='clean'){assert.ok(growing>200);assert.ok(g.segments.filter(s=>s.role==='hair'||s.role==='fiber').length>5000);}
 assert.ok(performance.now()-started<12000);console.log(`${style}: ${g.segments.length} connected segments,${growing} thickening cords,${continuations} gap-free continuations,10 markers,deterministic; two runs ${Math.round(performance.now()-started)}ms`);
}
assert.equal(shapes.size,3);console.log('Three deterministic families; auto diversity;8colors;connected paths;age-thickening;parent timing passed.');
