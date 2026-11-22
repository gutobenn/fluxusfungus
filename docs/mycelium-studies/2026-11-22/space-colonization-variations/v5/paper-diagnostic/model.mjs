/** Independent implementation of the four geometric rules in Lucas et al. §II.
 * No nutrient field, curvature, mature width, or neighbour-node snapping. */
import{WIDTH,HEIGHT,AREA,PALETTES,rng,drawSeed}from'./base.mjs';export{WIDTH,HEIGHT,AREA,PALETTES,drawSeed};
export const STYLES={paper:{name:'Ramificação e fusão · regras publicadas',species:'Modelo mínimo de ramificação e fusão',context:'estudo da figura 2D/E direita; parâmetros e semente escolhidos, não réplica exata',source:'https://arxiv.org/html/2601.03877v1'}};
export const PARAMETERS={branch:.2,stop:.001,sensing:10,angle:Math.PI/6,unit:1,targetLength:10000,roots:8};
function crossing(a,b,c,d){const ux=b.x-a.x,uy=b.y-a.y,vx=d.x-c.x,vy=d.y-c.y,den=ux*vy-uy*vx;if(Math.abs(den)<1e-10)return null;const wx=c.x-a.x,wy=c.y-a.y,t=(wx*vy-wy*vx)/den,u=(wx*uy-wy*ux)/den;return t>1e-7&&t<=1+1e-9&&u>=-1e-9&&u<=1+1e-9?{t:Math.min(1,t),u:Math.max(0,Math.min(1,u)),x:a.x+t*ux,y:a.y+t*uy}:null;}
export function simulate(seed,options={}){
 const p={...PARAMETERS,...options},random=rng(seed+':published-rules'),nodes=[{x:0,y:0}],edges=[],draws=[],grid=new Map(),cell=5;let tips=[],length=0,fusions=0,stops=0,step=0;
 const cells=(a,b)=>{const keys=[];for(let x=Math.floor(Math.min(a.x,b.x)/cell);x<=Math.floor(Math.max(a.x,b.x)/cell);x++)for(let y=Math.floor(Math.min(a.y,b.y)/cell);y<=Math.floor(Math.max(a.y,b.y)/cell);y++)keys.push(`${x},${y}`);return keys;};
 const addEdge=(a,b)=>{const index=edges.length;edges.push({a,b,alive:true});for(const key of cells(nodes[a],nodes[b])){if(!grid.has(key))grid.set(key,[]);grid.get(key).push(index);}return index;};
 const obstacles=(a,b)=>{const ids=new Set();for(const key of cells(a,b))for(const id of grid.get(key)??[])ids.add(id);return ids;};
 const nearest=(from,to)=>{const a=nodes[from];let found=null;for(const id of obstacles(a,to)){const e=edges[id];if(!e.alive||e.a===from||e.b===from)continue;const hit=crossing(a,to,nodes[e.a],nodes[e.b]);if(hit&&(!found||hit.t<found.t))found={...hit,edge:id};}return found;};
 const split=(hit)=>{const e=edges[hit.edge];if(hit.u<1e-7)return e.a;if(hit.u>1-1e-7)return e.b;const node=nodes.length;nodes.push({x:hit.x,y:hit.y});e.alive=false;addEdge(e.a,node);addEdge(node,e.b);return node;};
 const extend=(tip,heading,distance)=>{
  const a=nodes[tip.node],to={x:a.x+Math.cos(heading)*distance,y:a.y+Math.sin(heading)*distance},hit=nearest(tip.node,to);let node;
  if(hit){node=split(hit);fusions++;}else{node=nodes.length;nodes.push(to);}
  const b=nodes[node],len=Math.hypot(b.x-a.x,b.y-a.y);if(len<1e-8)return null;
  addEdge(tip.node,node);length+=len;const drawing=draws.length;draws.push({a:tip.node,b:node,parent:tip.drawing,step,length:len,fusion:Boolean(hit),heading,root:tip.root});
  return hit?null:{node,heading,drawing,root:tip.root};
 };
 // The paper specifies a star, but not this example's n or exact root angles.
 const rotation=random()*Math.PI*2;
 for(let i=0;i<p.roots;i++){const heading=rotation+i/p.roots*Math.PI*2;const tip=extend({node:0,drawing:-1,root:i},heading,p.unit);if(tip)tips.push(tip);}
 while(length<p.targetLength&&tips.length&&step++<6000){const next=[];
  for(const tip of tips){
   if(length>=p.targetLength)break;
   const a=nodes[tip.node],probe={x:a.x+Math.cos(tip.heading)*p.sensing*p.unit,y:a.y+Math.sin(tip.heading)*p.sensing*p.unit};
   if(nearest(tip.node,probe)&&random()<p.stop){stops++;continue;}
   if(random()<p.branch){const left=extend(tip,tip.heading,p.unit/2),right=extend(tip,tip.heading+(random()<.5?-1:1)*p.angle,p.unit/2);if(left)next.push(left);if(right)next.push(right);}
   else{const grown=extend(tip,tip.heading,p.unit);if(grown)next.push(grown);}
  }tips=next;
 }
 const graphEdges=edges.filter(e=>e.alive);return{seed,parameters:p,nodes,graphEdges,draws,totalLength:length,fusions,stops,steps:step,remainingTips:tips.length,cycleRank:graphEdges.length-nodes.length+1};
}
export function makeGrowth(seed){
 const simulation=simulate(seed),random=rng(seed+':display'),xs=simulation.nodes.map(n=>n.x),ys=simulation.nodes.map(n=>n.y);let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;for(const n of simulation.nodes){minX=Math.min(minX,n.x);maxX=Math.max(maxX,n.x);minY=Math.min(minY,n.y);maxY=Math.max(maxY,n.y);}
 const scale=Math.min(1100/(maxX-minX),650/(maxY-minY)),ox=(WIDTH-(maxX-minX)*scale)/2-minX*scale,oy=170+(650-(maxY-minY)*scale)/2-minY*scale,project=n=>({x:ox+n.x*scale,y:oy+n.y*scale});
 const nodes=simulation.nodes.map(project),segments=[],fronts=Array.from({length:PARAMETERS.roots},(_,i)=>({delay:i===0?300:400+random()*3800,speed:55+random()*35}));
 for(let i=0;i<simulation.draws.length;i++){const d=simulation.draws[i],a=nodes[d.a],b=nodes[d.b],front=fronts[d.root],start=d.parent<0?front.delay:segments[d.parent].end,end=start+Math.hypot(b.x-a.x,b.y-a.y)/front.speed*1000;segments.push({x:a.x,y:a.y,nx:b.x,ny:b.y,parent:d.parent,node:d.b,width:.9,initialWidth:.9,alpha:.7,role:'cord',z:0,start,end,matureAt:end,fusion:d.fusion});}
 const last=segments.reduce((m,s)=>Math.max(m,s.end),0),duration=26000;for(const s of segments){s.start=s.start/last*duration;s.end=s.end/last*duration;s.matureAt=s.end;}
 const candidates=segments.map((s,index)=>({...s,index,x:s.nx,y:s.ny})).filter(s=>Math.hypot(s.x-ox,s.y-oy)>65),markers=[];
 for(let i=0;i<10;i++){let best=null,score=-1;for(let j=0;j<candidates.length;j+=Math.max(1,Math.floor(candidates.length/2200))){const c=candidates[j],d=markers.length?Math.min(...markers.map(m=>Math.hypot(m.x-c.x,m.y-c.y))):Math.hypot(c.x-ox,c.y-oy);if(d>score){score=d;best=c;}}if(best)markers.push({...best,index:best.index+1,at:best.end});}
 return{seed,style:'paper',config:{origin:{x:ox,y:oy},...simulation.parameters},nodes,segments,markers,duration,simulation};
}
export function strokeSegment(ctx,s,amount=1,palette='ivory'){const rgb=(PALETTES[palette]??PALETTES.ivory).rgb.join(',');ctx.strokeStyle=`rgba(${rgb},${s.alpha})`;ctx.lineWidth=s.width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x+(s.nx-s.x)*amount,s.y+(s.ny-s.y)*amount);ctx.stroke();}
