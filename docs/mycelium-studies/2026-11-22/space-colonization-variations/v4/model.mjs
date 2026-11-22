/** Five independent generative drawing families, inspired by inspected visual references. */
import{WIDTH,HEIGHT,AREA,PALETTES,rng,settings,makeBaseline,drawSeed}from'./base.mjs';
export{WIDTH,HEIGHT,AREA,PALETTES,drawSeed};
export const STYLES={
 clean:{name:'Hifas abertas',description:'Colonização do espaço, com corredores leves e áreas vazias.',species:'Phanerochaete velutina',context:'redes exploratórias de cordões em solo e serapilheira',source:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6976561/'},
 fuzzy:{name:'Felpudo e cordado',description:'Exploradores finos, tufos curvos ramificados e cordões que engrossam com a idade.',species:'Phallus impudicus',context:'filamentos finos e felpudos que se agregam em feixes',source:'https://www.youtube.com/watch?v=BuI8StesF74'},
 mesh:{name:'Malha com fusões',description:'Pontas exploram, ramificam e se conectam: surgem ciclos e corredores irregulares.',species:'Modelo de ramificação e fusão',context:'anastomoses e conexões locais; estudo generativo independente inspirado em Mycorust e no modelo mínimo de redes',source:'https://arxiv.org/html/2601.03877v1'},
 tufts:{name:'Emaranhado em profundidade',description:'Filamentos secundários sobem, arqueiam e se enredam em tufos sobre uma rede rasteira.',species:'Modelo de filamentos em 2,5D',context:'ramificação secundária aérea; referências visuais Cyberfungi e Pycelium, sem reproduzir seu modelo de vizinhança',source:'https://davidmoore.org.uk/CyberWEB/Cyber06.htm'},
 fans:{name:'Leques rizomórficos',description:'Feixes de filamentos paralelos e franjas finas; a região antiga se adensa.',species:'Hypholoma fasciculare',context:'setores de crescimento em leque em resposta a um novo recurso',source:'https://www.davidmoore.org.uk/21st_century_guidebook_to_fungi_platinum/REPRINT_collection/Dowson_etal_mycelia_cord-forming_basidiomycetes.pdf'},
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
/** Local tips follow a persistent heading, patchy nutrients and short-range avoidance.
 * A tip that reaches an older, non-adjacent node closes an actual graph edge. */
function meshGeometry(seed){
 const config=settings(seed),random=rng(seed+':fusion-network'),origin=config.origin;
 const nodes=[{...origin,parent:-1,role:'cord',width:3,alpha:.86}],tips=[],cells=new Map(),patches=Array.from({length:12},()=>({x:AREA.left+random()*(AREA.right-AREA.left),y:AREA.top+random()*(AREA.bottom-AREA.top),strength:.4+random()}));
 const cell=24,key=(x,y)=>`${Math.floor(x/cell)},${Math.floor(y/cell)}`;
 const register=index=>{const n=nodes[index],k=key(n.x,n.y);if(!cells.has(k))cells.set(k,[]);cells.get(k).push(index);};register(0);
 const nearby=(x,y)=>{const list=[],cx=Math.floor(x/cell),cy=Math.floor(y/cell);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)list.push(...(cells.get(`${cx+a},${cy+b}`)??[]));return list;};
 for(let i=0;i<7;i++)tips.push({node:0,angle:i/7*Math.PI*2+random()*.4,curve:0,age:0,depth:0});
 let cursor=0;
 while(cursor<tips.length&&nodes.length<8500){
  const tip=tips[cursor++];let previous=tip.node,angle=tip.angle,curve=tip.curve;
  const steps=35+Math.floor(random()*70);
  for(let step=0;step<steps&&nodes.length<8500;step++){
   const p=nodes[previous];let gx=0,gy=0;
   for(const patch of patches){const d=distance(p,patch),force=patch.strength*Math.exp(-((d/210)**2));gx+=(patch.x-p.x)*force;gy+=(patch.y-p.y)*force;}
   const desired=Math.atan2(gy,gx),turn=Math.atan2(Math.sin(desired-angle),Math.cos(desired-angle));curve=curve*.84+(random()-.5)*.085;angle+=curve+turn*.005;
   // Soft boundary steering avoids geometric clipping around the complete colony.
   const margin=55;let bx=0,by=0;if(p.x<AREA.left+margin)bx=1;if(p.x>AREA.right-margin)bx=-1;if(p.y<AREA.top+margin)by=1;if(p.y>AREA.bottom-margin)by=-1;
   if((bx||by)&&random()<.25)break;
   const x=p.x+Math.cos(angle)*5.5,y=p.y+Math.sin(angle)*5.5;if(!inside({x,y}))break;
   const neighbors=nearby(x,y);let target=-1,best=8.2;
   for(const i of neighbors){if(i===previous||i===p.parent||nodes[i].parent===previous||i>previous-40)continue;let ancestor=previous,close=false;for(let back=0;back<14&&ancestor>=0;back++,ancestor=nodes[ancestor].parent)if(ancestor===i){close=true;break;}if(close)continue;const d=Math.hypot(nodes[i].x-x,nodes[i].y-y);if(d<best){best=d;target=i;}}
   if(target>=0&&step>10){const q=nodes[target],index=addNode(nodes,previous,q.x,q.y,'cord',.6+random()*.65,.67);if(index>=0)nodes[index].fuseTo=target;break;}
   const width=Math.max(.48,1.9-tip.depth*.18)*(1-step/steps*.4),index=addNode(nodes,previous,x,y,'cord',width,.57+random()*.17);if(index<0)break;register(index);previous=index;
   if(step>8&&random()<.10&&tips.length<310)tips.push({node:index,angle:angle+(random()<.5?-1:1)*(.45+random()*.65),curve:0,depth:tip.depth+1});
   if(step===steps-1&&tip.depth<8&&tips.length<310)tips.push({node:index,angle:angle+(random()-.5)*.35,curve,depth:tip.depth+1});
  }
 }
 return{nodes,config};
}
/** A substrate network supports genuinely elevated secondary filaments. Each tip
 * has 3D position/tangent and correlated curvature;
 * projection y-z*0.72 and depth-dependent width/alpha give a 2.5D drawing. */
function tuftGeometry(seed){
 const baseline=makeBaseline(seed),config=baseline.config,random=rng(seed+':aerial-filaments');
 const nodes=baseline.nodes.map((n,index)=>({...n,z:0,role:'cord',width:index?baseline.segments[index-1].width*1.18:4,alpha:.47})),baseCount=nodes.length,origin=config.origin;
 const candidates=[];for(let i=8;i<baseCount;i+=13)if(distance(nodes[i],origin)<460)candidates.push(i);
 const anchors=[];while(candidates.length&&anchors.length<35){const at=Math.floor(random()*candidates.length),index=candidates.splice(at,1)[0];if(anchors.every(j=>distance(nodes[index],nodes[j])>38))anchors.push(index);}
 for(const anchor of anchors){
  const base=nodes[anchor],mainHeading=Math.atan2(base.y-origin.y,base.x-origin.x)+(random()-.5)*1.4,tuftHeight=24+random()*65,strands=22+Math.floor(random()*25);
  for(let strand=0;strand<strands;strand++){
   let previous=anchor,x=base.x,y=base.y,z=0,heading=mainHeading+(random()-.5)*2.5,curve=(random()-.5)*.04;
   const length=65+random()*125,steps=Math.ceil(length/3),phase=random()*Math.PI*2,height=tuftHeight*(.5+random()*.7),spread=(random()-.5)*1.4;
   for(let step=1;step<=steps;step++){
    const t=step/steps;curve=curve*.94+(random()-.5)*.055;heading+=curve+spread*.009;
    x+=Math.cos(heading)*3;y+=Math.sin(heading)*3;z=Math.sin(t*Math.PI*.87)*height;
    const projected={x,y:y-z*.72};if(!inside(projected))break;
    const width=(.34+height/140)*(.95-t*.45),alpha=.16+.22*z/100+.12*(1-t);
    const index=addNode(nodes,previous,projected.x,projected.y,'aerial',width,alpha);if(index<0)break;nodes[index].z=z;nodes[index].world={x,y,z};previous=index;
    if(step===Math.floor(steps*.53)&&strand%3===0){
     // Secondary curved shoots grow from an actual elevated parent, not painted ticks.
     let last=index,tx=x,ty=y,tz=z,a=heading+(strand%2?1:-1)*.45;
     for(let k=1;k<17;k++){a+=.025*Math.sin(k*.15+phase);tx+=Math.cos(a)*2.7;ty+=Math.sin(a)*2.7;tz=z+Math.sin(k/17*Math.PI)*13-k*.2;const child=addNode(nodes,last,tx,ty-tz*.72,'aerial',width*.65,.24);if(child<0)break;nodes[child].z=tz;last=child;}
    }
   }
  }
 }
 return{nodes,config,markerIndices:baseline.markers.map(m=>m.index),bounds:baseline.bounds};
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
 const phases=[400,1600,2800,3900,4800,5700],phaseOrder=[0,5,1,4,2,3],activation=[];phaseOrder.forEach((sector,rank)=>activation[sector]=phases[rank]+random()*150);
 const segments=[];
 for(let index=1;index<nodes.length;index++){
  const n=nodes[index],parent=nodes[n.parent],heading=Math.atan2(n.y-config.origin.y,n.x-config.origin.x),continuation=n.parent>0&&principal[n.parent]===index;
  const newFront=n.parent===0||(n.role==='cord'&&!continuation&&distance(parent,config.origin)<75);fronts[index]=newFront?index:fronts[n.parent];
  const alignment=(1+Math.cos(heading-config.preferred))/2,target=(n.role==='cord'?65:43)+alignment*16;
  speeds[index]=n.parent===0?target:bound(speeds[n.parent]*.97+target*.03+(random()-.5)*.35,34,90);
  let start=ends[n.parent]+(continuation?0:n.role==='hair'?100+random()*550:70+random()*140);
  if(newFront){const relative=(heading-config.preferred+Math.PI*4)%(Math.PI*2);start=Math.max(start,activation[Math.floor(relative/(Math.PI*2)*6)%6]);}
  if(n.fuseTo!==undefined)start=Math.max(start,ends[n.fuseTo]);
  const end=start+distance(n,parent)/speeds[index]*1000;ends[index]=end;
  const matures=n.role==='cord'&&n.width>1.1;
  segments.push({x:parent.x,y:parent.y,nx:n.x,ny:n.y,parent:n.parent-1,node:index,width:n.width,alpha:n.alpha,role:n.role,z:n.z??0,fuseTo:n.fuseTo,start,end,continuation,front:fronts[index],speed:speeds[index],initialWidth:matures?Math.max(.25,n.width*.18):n.width,matureAt:end+(matures?3000+random()*4500:0)});
 }
 const first=segments.reduce((value,s)=>Math.min(value,s.start),Infinity),last=segments.reduce((value,s)=>Math.max(value,s.matureAt),0),duration=style==='mesh'?27000:style==='tufts'?31000:style==='fuzzy'?29000:31000,factor=(duration-400)/(last-first);
 segments.forEach(s=>{s.start=bound(400+(s.start-first)*factor,400,duration);s.end=bound(400+(s.end-first)*factor,400,duration);s.matureAt=bound(400+(s.matureAt-first)*factor,400,duration);s.speed/=factor;});
 const markers=geometry.markerIndices?geometry.markerIndices.map(index=>({...nodes[index],index,at:segments[index-1].end})):selectMarkers(nodes,segments,config.origin);
 return{seed,style,config,nodes,segments,markers,duration,bounds:geometry.bounds??AREA};
}
export function makeGrowth(seed,requested='auto'){
 const style=requested==='auto'?pickStyle(seed):requested;if(!STYLES[style])throw new Error('Unknown style');
 if(style==='clean'){const g=makeBaseline(seed);return{...g,style,segments:g.segments.map(s=>({...s,role:'cord',initialWidth:s.width,matureAt:s.end})),markers:g.markers};}
 return schedule(seed,style==='mesh'?meshGeometry(seed):style==='tufts'?tuftGeometry(seed):style==='fuzzy'?fuzzyGeometry(seed):fanGeometry(seed),style);
}
export function strokeSegment(context,s,amount=1,palette='ivory',time=Infinity){
 const rgb=(PALETTES[palette]??PALETTES.ivory).rgb.join(','),maturity=s.matureAt>s.end?bound((time-s.end)/(s.matureAt-s.end),0,1):1;
 context.strokeStyle=`rgba(${rgb},${s.alpha*(.64+.36*maturity)})`;context.lineWidth=s.initialWidth+(s.width-s.initialWidth)*maturity;context.lineCap='round';context.beginPath();context.moveTo(s.x,s.y);context.lineTo(s.x+(s.nx-s.x)*amount,s.y+(s.ny-s.y)*amount);context.stroke();
}
