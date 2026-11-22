// Independent, reduced implementation of Tero et al. (2010), equations 1–2.
// The arena and food positions are design inputs, not the Tokyo experiment.
export const WIDTH=1440,HEIGHT=900,DURATION=40000;
export function rng(seed){let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h+=0x6d2b79f5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export function makeState(seed){
 const random=rng(seed),nodes=[],lookup=new Map(),edges=[],phase=random()*6.28;
 for(let row=0;row<23;row++)for(let col=0;col<36;col++){
  const x=150+col*32+(row%2)*16+(random()-.5)*16,y=95+row*30+(random()-.5)*15;
  const nx=(x-720)/568,ny=(y-440)/312,a=Math.atan2(ny,nx),r=Math.hypot(nx,ny),limit=.94+.05*Math.sin(a*3+phase)+.045*Math.sin(a*5-phase);
  if(r>limit)continue;lookup.set(`${row},${col}`,nodes.length);nodes.push({x,y,row,col});
 }
 for(let i=0;i<nodes.length;i++){const n=nodes[i];for(const [r,c]of[[n.row,n.col+1],[n.row+1,n.col],[n.row+1,n.col+(n.row%2?1:-1)]]){const j=lookup.get(`${r},${c}`);if(j!==undefined)edges.push({a:i,b:j,length:Math.hypot(n.x-nodes[j].x,n.y-nodes[j].y)/32});}}
 const foods=[];let center=0;for(let i=1;i<nodes.length;i++)if(Math.hypot(nodes[i].x-720,nodes[i].y-440)<Math.hypot(nodes[center].x-720,nodes[center].y-440))center=i;foods.push(center);
 while(foods.length<36){let best=-1,bestScore=0;for(let i=0;i<nodes.length;i++){const score=Math.min(...foods.map(j=>Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y)))*(.88+random()*.24);if(score>bestScore){bestScore=score;best=i;}}foods.push(best);}
 const n=nodes.length,D=Float64Array.from(edges,()=>.014+random()*.008),pressure=new Float64Array(n);
 return{seed,nodes,edges,foods,D,pressure,random,step:0,stats:{maxResidual:0,totalIterations:0,solves:0},parameters:{gamma:1.15,I0:2,dt:.045,numericalFloor:1e-6,steps:1800,snapshotEvery:12}};
}
function solvePressure(state,source,sink){
 const {nodes,edges,D,pressure:p}=state,n=nodes.length,diag=new Float64Array(n),b=new Float64Array(n),c=Float64Array.from(edges,(e,i)=>D[i]/e.length);
 const I0=state.parameters.I0;b[source]=I0;b[sink]=-I0;b[0]=0;
 edges.forEach((e,i)=>{diag[e.a]+=c[i];diag[e.b]+=c[i];});diag[0]=1;
 function multiply(v,out){out.fill(0);for(let i=0;i<edges.length;i++){const e=edges[i],q=c[i]*(v[e.a]-v[e.b]);if(e.a)out[e.a]+=q;if(e.b)out[e.b]-=q;}out[0]=v[0];}
 const r=new Float64Array(n),z=new Float64Array(n),direction=new Float64Array(n),ap=new Float64Array(n);p[0]=0;multiply(p,ap);
 let rz=0;for(let i=0;i<n;i++){r[i]=b[i]-ap[i];z[i]=r[i]/diag[i];direction[i]=z[i];rz+=r[i]*z[i];}
 let iteration=0;
 for(;iteration<220;iteration++){
  let rr=0;for(let i=0;i<n;i++)rr+=r[i]*r[i];if(rr<1e-12)break;
  multiply(direction,ap);let denominator=0;for(let i=0;i<n;i++)denominator+=direction[i]*ap[i];if(!(denominator>0))break;
  const alpha=rz/denominator;let next=0;
  for(let i=0;i<n;i++){p[i]+=alpha*direction[i];r[i]-=alpha*ap[i];z[i]=r[i]/diag[i];next+=r[i]*z[i];}
  const beta=next/rz;for(let i=0;i<n;i++)direction[i]=z[i]+beta*direction[i];rz=next;
 }
 const balance=new Float64Array(n);for(let i=0;i<edges.length;i++){const e=edges[i],Q=c[i]*(p[e.a]-p[e.b]);balance[e.a]+=Q;balance[e.b]-=Q;}
 let residual=0;for(let i=0;i<n;i++)residual=Math.max(residual,Math.abs(balance[i]-(i===source?I0:i===sink?-I0:0)));state.stats.maxResidual=Math.max(state.stats.maxResidual,residual);state.stats.totalIterations+=iteration;state.stats.solves++;
 return c;
}
export function advance(state){
 const {foods,random,edges,D,pressure:p,parameters}=state,pool=[foods[0],foods[0],...foods];
 const source=pool[Math.floor(random()*pool.length)];let sink=source;while(sink===source)sink=pool[Math.floor(random()*pool.length)];
 const c=solvePressure(state,source,sink);
 for(let i=0;i<edges.length;i++){const e=edges[i],Q=Math.abs(c[i]*(p[e.a]-p[e.b])),power=Q**parameters.gamma,target=power/(1+power);D[i]=Math.max(parameters.numericalFloor,D[i]+parameters.dt*(target-D[i]));}
 state.step++;
}
export function snapshot(state){return Array.from(state.D,value=>Math.round(value*1e8)/1e8);}
function displayChains(state){
 const incident=state.nodes.map(()=>[]),used=new Set(),chains=[],included=new Set(),food=new Set(state.foods);
 for(let i=0;i<state.edges.length;i++)if(state.D[i]>.002){const e=state.edges[i];incident[e.a].push(i);incident[e.b].push(i);included.add(i);}
 function trace(start,first){const nodes=[start],edges=[];let node=start,edge=first;
  while(!used.has(edge)){used.add(edge);edges.push(edge);const e=state.edges[edge],next=e.a===node?e.b:e.a;nodes.push(next);node=next;if(node===start||incident[node].length!==2||food.has(node))break;const candidate=incident[node].find(i=>!used.has(i));if(candidate===undefined)break;edge=candidate;}
  chains.push({nodes,edges});
 }
 for(let node=0;node<incident.length;node++)if(incident[node].length!==2||food.has(node))for(const edge of incident[node])if(!used.has(edge))trace(node,edge);
 for(const edge of included)if(!used.has(edge))trace(state.edges[edge].a,edge);
 for(let i=0;i<state.edges.length;i++)if(!included.has(i))chains.push({nodes:[state.edges[i].a,state.edges[i].b],edges:[i]});
 return chains;
}
export function finish(state,history){
 const displayHistory=[history[0]],alpha=.18;let previous=history[0];
 // A display filter smooths stochastic source changes; the physical history is intact.
 for(let t=1;t<history.length+32;t++){const target=history[Math.min(t,history.length-1)];previous=previous.map((D,i)=>D+alpha*(target[i]-D));displayHistory.push(previous);}
 return{seed:state.seed,nodes:state.nodes.map(n=>({x:n.x,y:n.y})),edges:state.edges,foods:state.foods,chains:displayChains(state),history,displayHistory,presentation:{alpha,settlingSnapshots:32,duration:DURATION},parameters:state.parameters,stats:state.stats};
}
export function simulate(seed){const state=makeState(seed),history=[snapshot(state)];for(let i=0;i<state.parameters.steps;i++){advance(state);if(state.step%state.parameters.snapshotEvery===0)history.push(snapshot(state));}return finish(state,history);}
export async function simulateAsync(seed,progress=()=>{}){const state=makeState(seed),history=[snapshot(state)];for(let i=0;i<state.parameters.steps;i++){advance(state);if(state.step%state.parameters.snapshotEvery===0)history.push(snapshot(state));if(i%36===0){progress(i/state.parameters.steps);await new Promise(resolve=>setTimeout(resolve,0));}}return finish(state,history);}
export function render(ctx,model,time,{scale=1,showFood=true}={}){
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#302625';ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.save();ctx.translate(720,440);ctx.scale(scale,scale);ctx.translate(-720,-440);
 const history=model.displayHistory??model.history,progress=Math.min(1,Math.max(0,time/DURATION)),at=progress*(history.length-1),index=Math.floor(at),mix=at-index,left=history[index],right=history[Math.min(index+1,history.length-1)];
 let visible=0;
 ctx.lineCap='round';
 for(const chain of model.chains){
  let D=0;for(const i of chain.edges)D+=left[i]+(right[i]-left[i])*mix;D/=chain.edges.length;
  const alpha=Math.min(.94,Math.max(0,(D-.001)/.04));if(alpha<.01)continue;visible+=chain.edges.length;
  ctx.strokeStyle=`rgba(226,209,55,${alpha})`;ctx.lineWidth=Math.max(.15,7.5*Math.pow(D,.25));ctx.beginPath();const points=chain.nodes.map(i=>model.nodes[i]);ctx.moveTo(points[0].x,points[0].y);
  // Rounded presentation only. Physical pressures/fluxes still use original edges.
  for(let j=1;j<points.length-1;j++){const p=points[j],next=points[j+1];ctx.quadraticCurveTo(p.x,p.y,(p.x+next.x)/2,(p.y+next.y)/2);}
  ctx.lineTo(points.at(-1).x,points.at(-1).y);ctx.stroke();
 }
 if(showFood)for(const i of model.foods){const n=model.nodes[i];ctx.fillStyle='#e8dcc4';ctx.beginPath();ctx.arc(n.x,n.y,4.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#302625';ctx.lineWidth=1;ctx.stroke();}
 ctx.restore();return{progress,visible,total:model.edges.length,scale,time};
}
