import assert from'node:assert/strict';import{createHash}from'node:crypto';import{writeFile}from'node:fs/promises';import{makeGrowth,pickStyle,STYLES,PALETTES,AREA}from'./model.mjs';import{makeGrowth as oldGrowth}from'../v3/model.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex'),report=[];
assert.equal(Object.keys(STYLES).length,5);assert.equal(Object.keys(PALETTES).length,8);assert.equal(new Set(Array.from({length:100},(_,i)=>pickStyle(`sample-${i}`))).size,5);
const shape=g=>g.segments.map(s=>[s.x,s.y,s.nx,s.ny,s.width,s.alpha,s.start,s.end,s.matureAt]);
for(const style of['clean','fuzzy','fans'])assert.equal(hash(shape(makeGrowth('ff-colony-v3-reference',style))),hash(shape(oldGrowth('ff-colony-v3-reference',style))));
for(const style of['mesh','tufts'])for(const seed of['ff-colony-v4-reference','other-colony-1','other-colony-2']){
 const started=performance.now(),g=makeGrowth(seed,style),again=makeGrowth(seed,style);assert.equal(hash(g),hash(again));let loops=0,continuations=0;
 for(const s of g.segments){for(const key of['x','y','nx','ny','width','start','end','matureAt','z'])assert.ok(Number.isFinite(s[key]));assert.ok(s.end>s.start&&s.matureAt>=s.end&&s.matureAt<=g.duration+.001);assert.ok(s.nx>=AREA.left&&s.nx<=AREA.right&&s.ny>=AREA.top&&s.ny<=AREA.bottom);
 if(s.parent>=0){const p=g.segments[s.parent];assert.ok(p.end<=s.start+.00001);assert.ok(Math.hypot(s.x-p.nx,s.y-p.ny)<.00001);if(s.continuation&&s.fuseTo===undefined){assert.ok(Math.abs(p.end-s.start)<.00001);continuations++;}}
 if(s.fuseTo!==undefined){loops++;const n=g.nodes[s.fuseTo];assert.ok(Math.hypot(n.x-s.nx,n.y-s.ny)<.00001);assert.ok(s.fuseTo<s.node);assert.ok(g.segments[s.fuseTo-1]?.end<=s.start+.00001||s.fuseTo===0);}}
 assert.equal(g.markers.length,10);assert.equal(new Set(g.markers.map(m=>m.index)).size,10);for(const m of g.markers)assert.equal(m.at,g.segments[m.index-1].end);
 if(style==='mesh')assert.ok(loops>0);if(style==='tufts')assert.ok(g.segments.filter(s=>s.z>20).length>1000);
 // Each fusion terminal is identified with its older target. E - V + 1 equals loops.
 const vertices=g.nodes.length-loops,edges=g.segments.length;assert.equal(edges-vertices+1,loops);
 report.push({style,seed,segments:edges,graphVertices:vertices,cycleRank:loops,continuations,duration:g.duration,ms:Math.round(performance.now()-started)});
}
await writeFile(new URL('./verification.json',import.meta.url),JSON.stringify({oldThreeGeometryAndTimingIdentical:true,fiveAutoFamilies:true,eightColors:true,cases:report},null,2));console.log(report);
