/** Three original generative drawing families, inspired by inspected visual references. */
import{WIDTH,HEIGHT,AREA,PALETTES,rng,settings,makeBaseline,drawSeed}from'./base.mjs';
export{WIDTH,HEIGHT,AREA,PALETTES,drawSeed};
export const STYLES={
 fans:{name:'Leques abertos',description:'Estudo anterior preservado, com feixes e franjas finas.',species:'Hypholoma fasciculare',context:'setores em leque como referência visual; interpretação generativa',source:'https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf'},
 full:{name:'Leques · volta completa',description:'Leques sucessivos ocupam toda a volta, com margens irregulares.',species:'Referência visual de leques fúngicos',context:'variação artística de cobertura angular completa, sem atribuição de comportamento a uma espécie',source:'https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf'},
};
const bound=(n,min,max)=>Math.max(min,Math.min(max,n));
const inside=(p)=>p.x>AREA.left&&p.x<AREA.right&&p.y>AREA.top&&p.y<AREA.bottom;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function pickStyle(seed){const keys=Object.keys(STYLES);return keys[Math.floor(rng(seed+':family')()*keys.length)];}
function addNode(nodes,parent,x,y,role,width,alpha=.5){if(!inside({x,y}))return-1;nodes.push({x,y,parent,role,width,alpha});return nodes.length-1;}
function wisp(nodes,parent,heading,length,width,random,branch=true){
 if(nodes.length>=63000)return;
 let previous=parent,angle=heading,curve=0;const count=Math.ceil(length/2.8),splitAt=Math.floor(count*(.4+random()*.25));
 for(let step=0;step<count;step++){
  curve=curve*.87+(random()-.5)*.06;angle+=curve;
  const last=nodes[previous],index=addNode(nodes,previous,last.x+Math.cos(angle)*2.8,last.y+Math.sin(angle)*2.8,'hair',width*(1-step/count*.6),.26+random()*.28);
  if(index<0)break;previous=index;
  if(branch&&step===splitAt&&random()<.8)wisp(nodes,index,angle+(random()<.5?-1:1)*(.25+random()*.4),length*(.25+random()*.3),width*.7,random,false);
 }
}
function fuzzyGeometry(seed){
 const base=makeBaseline(seed),random=rng(seed+':felted'),nodes=base.nodes.map((node,index)=>({...node,role:'cord',width:index?base.segments[index-1].width*2.1:5,alpha:.85}));
 const originalLength=nodes.length,patches=Array.from({length:4},()=>nodes[Math.floor(random()*originalLength)]);
 for(let index=5;index<originalLength;index+=12){
  const node=nodes[index],parent=nodes[node.parent];if(!parent)continue;
  const density=.2+.75*Math.max(...patches.map(p=>Math.exp(-((distance(node,p)/220)**2))));
  if(random()>density)continue;
  const heading=Math.atan2(node.y-parent.y,node.x-parent.x),strands=3+Math.floor(random()*5);
  for(let strand=0;strand<strands;strand++)wisp(nodes,index,heading+(random()-.5)*1.65,30+random()*75,.36+random()*.32,random,true);
 }
 // Curved, branching fiber mats connect nearby corridors in patchy older regions.
 const cells=new Map();for(let i=1;i<originalLength;i++){const p=nodes[i],key=`${Math.floor(p.x/75)},${Math.floor(p.y/75)}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);}
 for(let anchor=12;anchor<originalLength&&nodes.length<68000;anchor+=19){
  const a=nodes[anchor],proximity=distance(a,base.config.origin);
  if(random()>.15+.75*Math.exp(-((proximity/430)**2)))continue;
  const cx=Math.floor(a.x/75),cy=Math.floor(a.y/75),near=[];
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)near.push(...(cells.get(`${cx+dx},${cy+dy}`)??[]));
  const choices=near.filter(i=>i!==anchor&&distance(a,nodes[i])>25&&distance(a,nodes[i])<95);if(!choices.length)continue;
  const b=nodes[choices[Math.floor(random()*choices.length)]],length=distance(a,b),heading=Math.atan2(a.y-nodes[a.parent].y,a.x-nodes[a.parent].x),normal={x:-(b.y-a.y)/length,y:(b.x-a.x)/length};
  for(let fiber=0;fiber<12+Math.floor(random()*9)&&nodes.length<68000;fiber++){
   let previous=anchor;const bow=(random()-.5)*22,steps=Math.ceil(length/3.5),c1={x:a.x+Math.cos(heading)*length*.35,y:a.y+Math.sin(heading)*length*.35};
   for(let step=1;step<=steps;step++){
    const t=step/steps,q=1-t,offset=Math.sin(t*Math.PI)*bow;
    const x=q*q*a.x+2*q*t*c1.x+t*t*b.x+normal.x*offset,y=q*q*a.y+2*q*t*c1.y+t*t*b.y+normal.y*offset;
    const index=addNode(nodes,previous,x,y,'hair',.32+random()*.3,.2+random()*.24);if(index<0)break;previous=index;
   }
  }
 }
 return{nodes,config:base.config,markerIndices:base.markers.map(m=>m.index),bounds:base.bounds};
}
function fanGeometry(seed){
 const config=settings(seed),{origin}=config,random=rng(seed+':fans'),nodes=[{...origin,parent:-1,role:'cord',width:8,alpha:.95}],queue=[];
 const roots=6+Math.floor(random()*2);
 for(let index=0;index<roots;index++)queue.push({parent:0,heading:index/roots*Math.PI*2+(random()-.5)*.35,length:115+random()*70,width:5+random()*3,depth:0});
 let shoots=0;
 while(queue.length&&shoots++<360&&nodes.length<43000){
  const shoot=queue.shift(),steps=Math.ceil(shoot.length/4.4),path=[],anchor=shoot.parent;
  let previous=anchor,angle=shoot.startHeading??shoot.heading,curve=0;
  const births=(shoot.depth<2?[.12,.3,.5,.73]:[.2,.6]).map(value=>Math.floor(steps*value));
  for(let step=0;step<steps;step++){
   curve=curve*.91+(random()-.5)*.018;const turn=Math.atan2(Math.sin(shoot.heading-angle),Math.cos(shoot.heading-angle));angle+=turn*.065+curve;
   const p=nodes[previous],index=addNode(nodes,previous,p.x+Math.cos(angle)*4.4,p.y+Math.sin(angle)*4.4,'cord',shoot.width*(1-step/steps*.72),.72);
   if(index<0)break;previous=index;path.push(index);
   if(shoot.depth<3&&births.includes(step)){
    const sign=(births.indexOf(step)+shoots)%2?1:-1;
    queue.push({parent:index,startHeading:angle,heading:angle+sign*(.2+random()*.32),length:shoot.length*(.73+random()*.32),width:shoot.width*(.59+random()*.16),depth:shoot.depth+1});
   }
  }
  // Thin strands share the same base and curve alongside a cord, producing a bundle.
  const strands=shoot.depth===0?6:shoot.depth===1?5:shoot.depth===2?4:3;
  for(let strand=0;strand<strands;strand++){
   let last=anchor;const offset=(strand-(strands-1)/2)*(1.8+random()*2.2);
   for(let step=0;step<path.length;step++){
    const p=nodes[path[step]],before=nodes[step?path[step-1]:anchor],heading=Math.atan2(p.y-before.y,p.x-before.x),q=(step+1)/(path.length+1);
    const lateral=Math.sin(q*Math.PI)*offset+Math.sin(q*9+strand)*.4;
    const index=addNode(nodes,last,p.x-Math.sin(heading)*lateral,p.y+Math.cos(heading)*lateral,'fiber',.2+random()*.28,.27+random()*.18);
    if(index<0)break;last=index;
   }
   if(path.length&&shoot.depth>0){const end=nodes[last],before=nodes[end.parent],heading=Math.atan2(end.y-before.y,end.x-before.x);wisp(nodes,last,heading+(random()-.5)*.6,12+random()*25,.21,random,true);}
  }
 }
 return{nodes,config};
}
function fullFanGeometry(seed){
 const config=settings(seed),random=rng(seed+':full-fans');config.origin={x:660+random()*120,y:485+random()*30};const{origin}=config,nodes=[{...origin,parent:-1,role:'cord',width:8,alpha:.95}],queue=[];
 const roots=12+Math.floor(random()*3);const rotation=random()*Math.PI*2;
 for(let index=0;index<roots;index++)queue.push({parent:0,heading:rotation+index/roots*Math.PI*2+(random()-.5)*.22,length:105+random()*24,width:4.8+random()*2.4,depth:0});
 for(let core=0;core<220;core++)wisp(nodes,0,random()*Math.PI*2,12+random()*42,.38+random()*.35,random,true);
 let shoots=0;
 while(queue.length&&shoots++<690&&nodes.length<105000){
  const shoot=queue.shift(),steps=Math.ceil(shoot.length/4.4),path=[],anchor=shoot.parent;
  let previous=anchor,angle=shoot.startHeading??shoot.heading,curve=0;
  const births=(shoot.depth<2?[.06,.22,.47,.72]:[.2,.6]).map(value=>Math.floor(steps*value));
  for(let step=0;step<steps;step++){
   curve=curve*.91+(random()-.5)*.018;const turn=Math.atan2(Math.sin(shoot.heading-angle),Math.cos(shoot.heading-angle));angle+=turn*.065+curve;
   const p=nodes[previous],index=addNode(nodes,previous,p.x+Math.cos(angle)*4.4,p.y+Math.sin(angle)*4.4,'cord',shoot.width*(1-step/steps*.72),.72);
   if(index<0)break;previous=index;path.push(index);
   if(shoot.depth<4&&births.includes(step)){
    const sign=(births.indexOf(step)+shoots)%2?1:-1;
    queue.push({parent:index,startHeading:angle,heading:angle+sign*(.38+random()*.5),length:shoot.length*(.72+random()*.22),width:shoot.width*(.59+random()*.16),depth:shoot.depth+1});
   }
  }
  // Thin strands share the same base and curve alongside a cord, producing a bundle.
  const strands=shoot.depth===0?18:shoot.depth===1?14:shoot.depth===2?10:7;
  for(let strand=0;strand<strands;strand++){
   let last=anchor;const offset=(strand-(strands-1)/2)*(2.2+random()*2.3);
   for(let step=0;step<path.length;step++){
    const p=nodes[path[step]],before=nodes[step?path[step-1]:anchor],heading=Math.atan2(p.y-before.y,p.x-before.x),q=(step+1)/(path.length+1);
    const lateral=Math.sin(q*Math.PI)*offset+Math.sin(q*9+strand)*.4;
    const index=addNode(nodes,last,p.x-Math.sin(heading)*lateral,p.y+Math.cos(heading)*lateral,'fiber',.34+random()*.28,.38+random()*.2);
    if(index<0)break;last=index;
   }
   if(path.length&&shoot.depth>0){const end=nodes[last],before=nodes[end.parent],heading=Math.atan2(end.y-before.y,end.x-before.x);wisp(nodes,last,heading+(random()-.5)*.6,5+random()*9,.24,random,false);}
  }
 }
 return{nodes,config};
}
function selectMarkers(nodes,segments,origin){
 const candidates=nodes.map((node,index)=>({...node,index})).filter(p=>p.role==='cord'&&p.index>0&&distance(p,origin)>75&&p.x>AREA.left+15&&p.x<AREA.right-15&&p.y>AREA.top+15&&p.y<AREA.bottom-15),markers=[];
 for(let index=0;index<10;index++){
  let best=null,score=-1;
  for(let i=0;i<candidates.length;i+=Math.max(1,Math.floor(candidates.length/2200))){const p=candidates[i],d=markers.length?Math.min(...markers.map(m=>distance(m,p))):distance(p,origin);if(d>score){score=d;best=p;}}
  if(best)markers.push({...best,at:segments[best.index-1].end});
 }
 return markers;
}
function schedule(seed,geometry,style){
 const{nodes,config}=geometry,random=rng(seed+':age-and-flow'),children=nodes.map(()=>[]),loads=new Float64Array(nodes.length).fill(1);
 nodes.forEach((n,index)=>{if(n.parent>=0)children[n.parent].push(index);});for(let i=nodes.length-1;i>0;i--)loads[nodes[i].parent]+=loads[i];
 const principal=children.map(list=>list.reduce((best,index)=>best<0||((nodes[index].role==='cord'?1e6:0)+loads[index])>((nodes[best].role==='cord'?1e6:0)+loads[best])?index:best,-1));
 const ends=new Float64Array(nodes.length),speeds=new Float64Array(nodes.length),fronts=new Int32Array(nodes.length);speeds[0]=65;
 const phases=style==='full'?[400,2700,5100,7400,9700,11900]:[400,1600,2800,3900,4800,5700],phaseOrder=[0,5,1,4,2,3],activation=[];phaseOrder.forEach((sector,rank)=>activation[sector]=phases[rank]+random()*150);
 const segments=[];
 for(let index=1;index<nodes.length;index++){
  const n=nodes[index],parent=nodes[n.parent],heading=Math.atan2(n.y-config.origin.y,n.x-config.origin.x),continuation=n.parent>0&&principal[n.parent]===index;
  const newFront=n.parent===0||(n.role==='cord'&&!continuation&&distance(parent,config.origin)<75);fronts[index]=newFront?index:fronts[n.parent];
  const alignment=(1+Math.cos(heading-config.preferred))/2,target=(n.role==='cord'?65:43)+alignment*16;
  speeds[index]=n.parent===0?target:bound(speeds[n.parent]*.97+target*.03+(random()-.5)*.35,34,90);
  let start=ends[n.parent]+(continuation?0:n.role==='hair'?100+random()*550:70+random()*140);
  if(newFront){const relative=(heading-config.preferred+Math.PI*4)%(Math.PI*2);start=Math.max(start,activation[Math.floor(relative/(Math.PI*2)*6)%6]);}
  const end=start+distance(n,parent)/speeds[index]*1000;ends[index]=end;
  const matures=n.role==='cord'&&n.width>1.1;
  segments.push({x:parent.x,y:parent.y,nx:n.x,ny:n.y,parent:n.parent-1,node:index,width:n.width,alpha:n.alpha,role:n.role,start,end,continuation,front:fronts[index],speed:speeds[index],initialWidth:matures?Math.max(.25,n.width*.18):n.width,matureAt:end+(matures?3000+random()*4500:0)});
 }
 const first=segments.reduce((value,s)=>Math.min(value,s.start),Infinity),last=segments.reduce((value,s)=>Math.max(value,s.matureAt),0),duration=style==='full'?41000:style==='fuzzy'?29000:31000,factor=(duration-400)/(last-first);
 segments.forEach(s=>{s.start=bound(400+(s.start-first)*factor,400,duration);s.end=bound(400+(s.end-first)*factor,400,duration);s.matureAt=bound(400+(s.matureAt-first)*factor,400,duration);s.speed/=factor;});
 const markers=geometry.markerIndices?geometry.markerIndices.map(index=>({...nodes[index],index,at:segments[index-1].end})):selectMarkers(nodes,segments,config.origin);
 return{seed,style,config,nodes,segments,markers,duration,bounds:geometry.bounds??AREA};
}
export function makeGrowth(seed,requested='auto'){
 const style=requested==='auto'?pickStyle(seed):requested;if(!STYLES[style])throw new Error('Unknown style');
 if(style==='clean'){const g=makeBaseline(seed);return{...g,style,segments:g.segments.map(s=>({...s,role:'cord',initialWidth:s.width,matureAt:s.end})),markers:g.markers};}
 return schedule(seed,style==='full'?fullFanGeometry(seed):style==='fuzzy'?fuzzyGeometry(seed):fanGeometry(seed),style);
}
export function strokeSegment(context,s,amount=1,palette='ivory',time=Infinity){
 const rgb=(PALETTES[palette]??PALETTES.ivory).rgb.join(','),maturity=s.matureAt>s.end?bound((time-s.end)/(s.matureAt-s.end),0,1):1;
 context.strokeStyle=`rgba(${rgb},${s.alpha*(.64+.36*maturity)})`;context.lineWidth=s.initialWidth+(s.width-s.initialWidth)*maturity;context.lineCap='round';context.beginPath();context.moveTo(s.x,s.y);context.lineTo(s.x+(s.nx-s.x)*amount,s.y+(s.ny-s.y)*amount);context.stroke();
}
