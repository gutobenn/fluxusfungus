/** Offline space-colonization experiment: geometry and a parent-safe growth schedule. */
export const WIDTH=1440,HEIGHT=900,AREA={left:48,right:1392,top:156,bottom:846};
export const PALETTES={
 ivory:{name:'Marfim',rgb:[243,238,226],species:'Chlorociboria aeruginascens',context:'micélio claro não pigmentado',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6617353/'},
 amber:{name:'Âmbar suave',rgb:[220,139,85],species:'Pycnoporus cinnabarinus',context:'cinabarina alaranjada nas paredes das hifas',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10709268/'},
 teal:{name:'Azul-esverdeado',rgb:[99,168,157],species:'Chlorociboria aeruginascens',context:'pigmento azul-esverdeado xilindeína',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6617353/'},
 yellow:{name:'Amarelo-dourado',rgb:[224,190,82],species:'Piloderma croceum',context:'pigmento micelial amarelo corticrocin',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12441137/'},
 pink:{name:'Rosa',rgb:[221,152,180],species:'Limonomyces roseipellis',context:'micélio rosado e felpudo',source:'https://extension.psu.edu/turfgrass-diseases-pink-patch-causal-fungus-limonomyces-roseipellis'},
 coral:{name:'Coral-avermelhado',rgb:[218,111,111],species:'Laetisaria fuciformis',context:'massas de hifas de tons rosa-coral a vermelho',source:'https://ipm.illinois.edu/diseases/rpds/413.pdf'},
 lilac:{name:'Lilás',rgb:[181,160,208],species:'Lepista sordida',context:'isolados A1/A4 em cultivo, com hifas lilases',source:'https://researchers-admin.westernsydney.edu.au/ws/portalfiles/portal/94793243/uws_495.pdf#page=151'},
 violet:{name:'Violeta',rgb:[162,139,198],species:'Lepista spp.',context:'isolados A2/A3 em cultivo, com hifas violetas; espécie não conclusiva',source:'https://researchers-admin.westernsydney.edu.au/ws/portalfiles/portal/94793243/uws_495.pdf#page=151'},
};
export function rng(seed){let state=2166136261;for(const c of String(seed))state=Math.imul(state^c.charCodeAt(0),16777619);return()=>{state+=0x6D2B79F5;let t=Math.imul(state^state>>>15,state|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function spatialGrid(size){const cells=new Map();return{add(p){const key=`${Math.floor(p.x/size)},${Math.floor(p.y/size)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(p);},near(p,radius=1){const x=Math.floor(p.x/size),y=Math.floor(p.y/size),found=[];for(let dx=-radius;dx<=radius;dx++)for(let dy=-radius;dy<=radius;dy++)found.push(...(cells.get(`${x+dx},${y+dy}`)??[]));return found;}};}
export function settings(seed){
 const random=rng(seed+':settings');
 // Extent and thickness are independent, so a dense drawing can still have fine hyphae.
 return{
  origin:{x:360+random()*710,y:310+random()*340},
  nutrientCount:Math.round(1800+random()*2400),
  influence:70+random()*21,consumption:7.2+random()*2.8,step:5.3+random()*.9,
  trunk:2.1+random()*3.2,fine:.18+random()*.28,
  extentX:.67+random()*.33,extentY:.72+random()*.28,
  preferred:random()*Math.PI*2,
 };
}
export function makeBaseline(seed){
 const config=settings(seed),random=rng(seed+':nutrients'),{origin}=config;
 const nodes=[{...origin,parent:-1}],grid=spatialGrid(70);grid.add({...nodes[0],index:0});

 let left=AREA.left+(1-config.extentX)*(AREA.right-AREA.left)*random(),right=left+config.extentX*(AREA.right-AREA.left);
 let top=AREA.top+(1-config.extentY)*(AREA.bottom-AREA.top)*random(),bottom=top+config.extentY*(AREA.bottom-AREA.top);
 left=Math.max(AREA.left,Math.min(left,origin.x-100));right=Math.min(AREA.right,Math.max(right,origin.x+100));
 top=Math.max(AREA.top,Math.min(top,origin.y-100));bottom=Math.min(AREA.bottom,Math.max(bottom,origin.y+100));
 const patches=Array.from({length:5},()=>({x:left+random()*(right-left),y:top+random()*(bottom-top),rx:95+random()*200,ry:65+random()*160,weight:.6+random()*.8}));
 const voids=Array.from({length:3},()=>({x:left+random()*(right-left),y:top+random()*(bottom-top),r:65+random()*110}));
 let nutrients=[];
 for(let attempt=0;nutrients.length<config.nutrientCount&&attempt<config.nutrientCount*35;attempt++){
  const point={x:left+random()*(right-left),y:top+random()*(bottom-top)};
  const patch=patches.reduce((sum,p)=>sum+p.weight*Math.exp(-(((point.x-p.x)/p.rx)**2+((point.y-p.y)/p.ry)**2)),0);
  const hole=voids.reduce((sum,p)=>sum+Math.exp(-((dist(point,p)/p.r)**2)),0);
  const weight=clamp(.22+patch*.48-hole*.35,.035,.97);
  if(random()<weight)nutrients.push(point);
 }
 // A small local nutrient bed starts one connected colony, even near a sparse pocket.
 for(let index=0;index<45;index++){const angle=random()*Math.PI*2,r=18+random()*65;nutrients.push({x:origin.x+Math.cos(angle)*r,y:origin.y+Math.sin(angle)*r});}
 for(let round=0;round<360&&nutrients.length&&nodes.length<16000;round++){
  const forces=new Map(),remaining=[];
  for(const nutrient of nutrients){
   let closest=null,minimum=config.influence;
   for(const node of grid.near(nutrient,2)){const distance=dist(node,nutrient);if(distance<minimum){minimum=distance;closest=node;}}
   if(minimum<config.consumption)continue;
   remaining.push(nutrient);
   if(closest){if(!forces.has(closest.index))forces.set(closest.index,{x:0,y:0});const f=forces.get(closest.index);f.x+=(nutrient.x-closest.x)/minimum;f.y+=(nutrient.y-closest.y)/minimum;}
  }
  nutrients=remaining;if(!forces.size)break;let added=0;
  for(const[index,f]of forces){
   const parent=nodes[index],length=Math.hypot(f.x,f.y);if(length<.01)continue;
   const next={x:parent.x+f.x/length*config.step,y:parent.y+f.y/length*config.step,parent:index};
   if(next.x<AREA.left||next.x>AREA.right||next.y<AREA.top||next.y>AREA.bottom||grid.near(next).some(p=>dist(p,next)<config.step*.52))continue;
   nodes.push(next);grid.add({...next,index:nodes.length-1});added++;
  }
  if(!added)break;
 }
 const children=nodes.map(()=>[]),loads=new Float64Array(nodes.length).fill(1);
 nodes.forEach((node,index)=>{if(node.parent>=0)children[node.parent].push(index);});
 for(let i=nodes.length-1;i>0;i--)loads[nodes[i].parent]+=loads[i];
 const timing=rng(seed+':smooth-rhythm'),segments=[],speeds=new Float64Array(nodes.length),ends=new Float64Array(nodes.length),fronts=new Int32Array(nodes.length);
 const principal=children.map(branches=>branches.reduce((best,index)=>best<0||loads[index]>loads[best]?index:best,-1));
 const activation=new Array(6),cohortOrder=[0,5,1,4,2,3],cohortTimes=[400,1600,2800,3900,4800,5700];
 cohortOrder.forEach((sector,rank)=>{activation[sector]=cohortTimes[rank]+timing()*180;});
 speeds[0]=75;ends[0]=0;fronts[0]=-1;
 for(let index=1;index<nodes.length;index++){
  const node=nodes[index],parent=nodes[node.parent],heading=Math.atan2(node.y-origin.y,node.x-origin.x);
  const continuation=node.parent>0&&principal[node.parent]===index;
  // A major front is born near the spore, then inherited along its whole branch.
  // Turning across an angular boundary never reapplies a start gate.
  const newFront=node.parent===0||(!continuation&&dist(parent,origin)<70);
  fronts[index]=newFront?index:fronts[node.parent];
  const alignment=(1+Math.cos(heading-config.preferred))/2;
  const localTarget=64+24*alignment+5*Math.sin(node.x*.006+node.y*.004);
  if(newFront)speeds[index]=62+28*alignment;
  else speeds[index]=clamp(speeds[node.parent]*.98+localTarget*.02+(timing()-.5)*.45,53,96);
  const birthLag=continuation?0:80+timing()*100;
  let start=ends[node.parent]+birthLag;
  if(newFront){const relative=(heading-config.preferred+Math.PI*4)%(Math.PI*2);const sector=Math.min(5,Math.floor(relative/(Math.PI*2)*6));start=Math.max(start,activation[sector]);}
  const end=start+config.step/speeds[index]*1000;ends[index]=end;
  segments.push({x:parent.x,y:parent.y,nx:node.x,ny:node.y,parent:node.parent-1,node:index,
   width:config.fine+Math.pow(loads[index]/loads[0],.38)*config.trunk,
   alpha:.48+Math.min(.32,loads[index]/35),start,end,speed:speeds[index],continuation,front:fronts[index]});
 }
 // Scale continuous travel and the handful of branch-birth delays together.
 // The first actual front always starts at 400ms; the full colony takes 22.5s.
 const first=Math.min(...segments.map(s=>s.start)),last=Math.max(...segments.map(s=>s.end)),factor=(22500-400)/(last-first);
 segments.forEach(s=>{s.start=Math.min(22500,400+(s.start-first)*factor);s.end=Math.min(22500,400+(s.end-first)*factor);s.speed/=factor;});
 const duration=22500;
 const candidates=nodes.map((node,index)=>({...node,index})).filter(node=>dist(node,origin)>70&&node.x>AREA.left+15&&node.x<AREA.right-15&&node.y>AREA.top+15&&node.y<AREA.bottom-15);
 const markers=[];
 for(let index=0;index<10;index++){
  let best=null,score=-1;
  for(let i=0;i<candidates.length;i+=Math.max(1,Math.floor(candidates.length/1800))){const node=candidates[i];const d=markers.length?Math.min(...markers.map(other=>dist(node,other))):dist(node,origin);if(d>score){score=d;best=node;}}
  if(best)markers.push({...best,at:segments[best.index-1].end});
 }
 return{seed,config,nodes,segments,markers,duration,bounds:{left,right,top,bottom}};
}
export function drawSeed(context,origin){
 context.save();context.fillStyle='rgba(255,252,242,.13)';context.beginPath();context.ellipse(origin.x,origin.y,9,10,0,0,Math.PI*2);context.fill();
 context.fillStyle='#fffdf5';context.shadowColor='#fff8dc';context.shadowBlur=5;context.beginPath();context.ellipse(origin.x,origin.y,3.8,4.8,-.15,0,Math.PI*2);context.fill();context.restore();
}
/** A cheap translucent outer stroke suggests emitted light only for the luminous palette. */
export function strokeSegment(context,s,amount=1,palette='ivory'){
 const p=PALETTES[palette]??PALETTES.ivory,rgb=p.rgb.join(',');
 context.lineCap='round';context.beginPath();context.moveTo(s.x,s.y);context.lineTo(s.x+(s.nx-s.x)*amount,s.y+(s.ny-s.y)*amount);
 if(p.emission){context.strokeStyle=`rgba(${rgb},${s.alpha*.12})`;context.lineWidth=s.width+2.4;context.stroke();}
 context.strokeStyle=`rgba(${rgb},${s.alpha})`;context.lineWidth=s.width;context.stroke();
}
export function paintFrame(context,growth,time,palette='ivory'){
 context.fillStyle='#302625';context.fillRect(0,0,WIDTH,HEIGHT);
 for(const s of growth.segments){if(s.start>time)continue;strokeSegment(context,s,clamp((time-s.start)/(s.end-s.start),0,1),palette);}
 for(const marker of growth.markers)if(marker.at<=time){context.beginPath();context.arc(marker.x,marker.y,5,0,Math.PI*2);context.fillStyle='#ff6347';context.fill();context.strokeStyle='#f4eee4';context.lineWidth=1.3;context.stroke();}
 drawSeed(context,growth.config.origin);
}
