import {G,settings,maxInk} from './state.js';
import {CFG,levelOf,power} from './config.js';
import {shape,cen,inter,kind} from './recog.js';
import {sfx} from './audio.js';
import {samp,touches,dE,ec,burst,rate,float} from './util.js';
import {strike,afterStrike} from './combat.js';
import {toast} from './ui.js';

export const spellOf=st=>{const x=shape(st);return x&&maxInk()>=(x.need||0)?x:null};
export const lvOf=k=>levelOf((G.use&&G.use[k])||0);
const GROUP={storm:3,bolt:1,frost:1};
// Fire a drawing: spells get level-scaled power; freeform drawings use plain strikes.
export function volley(cps,sp,m,echo,col){
 if(!sp){sfx.cast();strike(cps,m,echo,col);return}
 const lv=lvOf(sp.k),mm=m*power(lv),g=GROUP[sp.k]||2;sfx[sp.k]();
 for(let i=0;i<cps.length;i+=g)fire(sp.k,cps.slice(i,i+g),mm,lv,sp.c);
 G.fx.push({cps,t:0,echo,col,lv});
}
// bolt path with fixed jaggedness (made once, so it never flickers frame to frame)
function jag(p){const o=[],a=settings.calm?.03:.06;for(let i=1;i<p.length;i++){const s=p[i-1],q=p[i];o.push(s);for(let j=1;j<5;j++){const t=j/5,r=(Math.random()-.5)*a;o.push([s[0]+(q[0]-s[0])*t+r,s[1]+(q[1]-s[1])*t-r])}}o.push(p.at(-1));return o}
function fire(k,P,m,lv,col){
 const w=G.active,n=w.n,al=()=>w.es.filter(e=>e.hp>0),[A,B]=P,
  hit=(e,d)=>{const v=rate(e);e.hp-=d*m*v;if(v)e.fl=1},
  sure=(e,d)=>{e.hp-=d*m;e.fl=1}; // chain damage ignores timing
 if(lv>1&&m>=1)float(...cen(P.flat()),'Lv '+lv,col,16,900);
 if(k=='nova'){const L=kind(A)=='loop'?A:B,[cx,cy]=cen(L),r=Math.max(.12,L.reduce((q,p)=>q+Math.hypot(p[0]-cx,p[1]-cy),0)/L.length);
  if(m>=1){G.sh=Math.min(lv>=4?3:2,(G.sh||0)+1);toast('Shield +1')}
  G.fx.push({k:'ring',x:cx,y:cy,r,t:0,lv});burst(cx,cy,30+lv*8,'#5bb8ff')}
 else if(k=='storm'){al().forEach(e=>{const t=ec(e,n);hit(e,3);G.fx.push({k:'bolt',pts:jag([[t[0]+(Math.random()-.5)*.1,-.05],t]),t:0,lv});burst(t[0],t[1],10+lv*2,'#9fd0ff')})}
 else if(k=='sun'){const c=cen(P.flat());al().forEach(e=>hit(e,6));G.fx.push({k:'ring',x:c[0],y:c[1],r:1.1,t:0,c:'#fff3b0',lv});burst(c[0],c[1],100+lv*10,'#fff3b0')}
 else if(k=='beam'){const R=CFG.R*(1+.08*(lv-1));
  for(const s of P){let dx=s.at(-1)[0]-s[0][0],dy=s.at(-1)[1]-s[0][1];const L=Math.hypot(dx,dy)||1,pts=[];dx/=L;dy/=L;
   for(let t=-1.5;t<=1.5;t+=.02){const p=[s[0][0]+dx*t,s[0][1]+dy*t];if(p[0]>=0&&p[0]<=1&&p[1]>=0&&p[1]<=1)pts.push(p)}
   al().forEach(e=>{if(touches(e,pts,n,R))hit(e,4)});
   if(pts.length){G.fx.push({k:'beam',a:pts[0],b:pts.at(-1),t:0,lv});for(let i=0;i<pts.length;i+=4)burst(pts[i][0],pts[i][1],1+(lv>>1),'#ffe27a')}}}
 else if(k=='bolt'){const tc=al().filter(e=>touches(e,samp(A),n));tc.forEach(e=>hit(e,3));
  G.fx.push({k:'bolt',pts:jag(A.filter((_,i)=>i%3==0||i==A.length-1)),t:0,lv});tc.forEach(e=>{const c=ec(e,n);burst(c[0],c[1],8+lv*2,'#fff6a8')});
  if(lv>=3){ // chain lightning: jumps to other foes for a bit of damage, no accuracy needed
   let cur=tc.length?ec(tc.at(-1),n):A.at(-1);const path=[cur],rest=al().filter(e=>!tc.includes(e));
   for(let i=0;i<lv-2&&rest.length;i++){rest.sort((p,q)=>dE(p,cur[0],cur[1],n)-dE(q,cur[0],cur[1],n));const e=rest.shift();sure(e,1.2+.2*(lv-3));cur=ec(e,n);path.push(cur);burst(cur[0],cur[1],10,'#9fd0ff')}
   if(path.length>1)G.fx.push({k:'bolt',pts:jag(path),t:0,lv,chain:1})}}
 else if(k=='frost'){const[cx,cy]=cen(A),r=Math.max(.15,A.reduce((q,p)=>q+Math.hypot(p[0]-cx,p[1]-cy),0)/A.length)+.08;
  al().forEach(e=>{if(dE(e,cx,cy,n)<=r){e.hp-=m;e.fl=1;const f=2+lv,t=ec(e,n);e.fz=Math.min(8,(e.fz||0)+(['basic','large','minion'].includes(e.type)?f:Math.ceil(f/2)));float(t[0],t[1],'FROZEN','#bdf',16,900);burst(t[0],t[1],8,'#d8f6ff')}});
  G.fx.push({k:'ring',x:cx,y:cy,r,t:0,c:'#9fe8ff',lv});burst(cx,cy,30+lv*6,'#d8f6ff')}
 else if(k=='quake'){const pts=P.flatMap(samp);
  al().forEach(e=>{if(touches(e,pts,n,CFG.R*2.2)){hit(e,3);e.d=Math.min(e.d0+3,e.d+1+(lv>>1))}});
  G.fx.push({k:'trail',ss:P,c:'#c9a27a',t:0,lv});P.forEach(s=>{for(let i=0;i<s.length;i+=4)burst(s[i][0],s[i][1],2,'#c9a27a')});if(m>=1)G.shk=Math.max(G.shk,.5)}
 else{const X=inter(A,B)||A[0],wv=G.active;G.fx.push({k:'meteor',x:X[0],y:X[1],t:0,lv});
  G.timers.push({t:350,f:()=>{if(G.active!==wv||G.state!='play')return;const rr=.2+.015*(lv-1);
   al().forEach(e=>{if(dE(e,X[0],X[1],n)<=rr)hit(e,5)});
   G.fx.push({k:'ring',x:X[0],y:X[1],r:rr,t:.3,c:'#ff9a3c',lv});burst(X[0],X[1],50+lv*6,'#ff9a3c');
   G.zones.push({x:X[0],y:X[1],r:rr*.9,life:3+lv,max:3+lv,dmg:(.5+.15*lv)*m}); // lingering burning ground
   afterStrike()}})}
}
