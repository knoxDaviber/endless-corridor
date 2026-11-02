import {G,settings} from './state.js';
import {CFG} from './config.js';
import {sfx} from './audio.js';
export const fx_=s=>s.map(p=>[1-p[0],p[1]]),fy_=s=>s.map(p=>[p[0],1-p[1]]);
export function copies(st){
 if(G.buffs.kaleido)return[...st,...st.map(fx_),...st.map(fy_),...st.map(s=>fx_(fy_(s)))];
 if(G.buffs.mirror)return[...st,...st.map(fx_)];
 return st}
export function samp(s){const o=[];for(let i=1;i<s.length;i++){const a=s[i-1],b=s[i],k=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.02));for(let j=0;j<=k;j++)o.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k])}return o}
// hitboxes are grid-cell rectangles, whatever shape is drawn; the snake has several cells
export const cellsOf=e=>e.cells||[[e.c,e.r,e.w,e.h]];
export function touches(e,pts,n,R=CFG.R){return cellsOf(e).some(([c,r,w,h])=>{const x0=c/n,x1=(c+w)/n,y0=r/n,y1=(r+h)/n;return pts.some(([x,y])=>Math.hypot(Math.max(x0-x,0,x-x1),Math.max(y0-y,0,y-y1))<=R)})}
export const ec=(e,n)=>[(e.c+e.w/2)/n,(e.r+e.h/2)/n];
export const dE=(e,x,y,n)=>Math.min(...cellsOf(e).map(([c,r,w,h])=>Math.hypot(Math.max(c/n-x,0,x-(c+w)/n),Math.max(r/n-y,0,y-(r+h)/n))));
export function burst(x,y,n,c){if(settings.calm)n=Math.ceil(n/3);for(let i=0;i<n;i++){const an=Math.random()*6.283,v=.15+Math.random()*.6;G.pts.push({x,y,vx:Math.cos(an)*v,vy:Math.sin(an)*v,l:400+Math.random()*500,c})}}
export function float(x,y,s,c,z=15,l=700){G.txt.push({x,y,s,c,z,l,m:l})}
export const tier=p=>p>=CFG.critAt?3:p>=CFG.perfAt?2:p>=CFG.goodAt?1:0;
export const prog=e=>Math.max(0,1-Math.max(0,e.d-G.acc/1000)/e.d0);
/* Timing: crit x2 at 95-100% approach, full 80-95%, half 45-80%, miss below.
   Secret pity: after a run of misses, a near-miss lands as a GOOD hit. */
let lastS=0;
export function rate(e){const p=prog(e),now=performance.now(),[x,y]=ec(e,G.active.n);
 let t=tier(p);
 if(!t&&G.pity>=CFG.pityAfter&&p>=CFG.goodAt-CFG.pityRange)t=1;
 if(t){G.pity=0;G.pityT=now}else if(now-G.pityT>250){G.pity++;G.pityT=now}
 float(x,y,['MISS','GOOD','PERFECT','CRIT!'][t],['#f88','#bde','#ffe27a','#ff7a45'][t],t==3?21:15);
 if(t==3)burst(x,y,24,'#ff7a45');
 if(now-lastS>120){lastS=now;sfx[['miss','good','perfect','crit'][t]]()}
 return[0,.5,1,CFG.critMult][t]}
