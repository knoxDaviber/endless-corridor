import {G,settings,maxInk} from './state.js';
import {CFG,levelOf,SHCOL} from './config.js';
import {identify,nm,shape} from './recog.js';
import {copies,samp,touches,ec,rate,float,cellsOf,burst} from './util.js';
import {sfx} from './audio.js';
import {genWave} from './waves.js';
import {volley,spellOf,lvOf} from './spells.js';
import {toast,showBuff,showOver,hide,skills} from './ui.js';

export function newGame(state){
 for(const k in G)delete G[k];
 Object.assign(G,{wave:1,hp:CFG.hp,state,acc:0,strokes:[],cur:null,aid:null,inkUsed:0,pend:null,idle:null,timers:[],fx:[],pts:[],txt:[],zones:[],sh:0,hits:0,casts:0,kills:0,use:{},shk:0,buffs:{},maxSlots:3,pats:[],slots:[],match:null,hurt:0,pity:0,pityT:-1e3});
 G.active=genWave(1);G.next=genWave(2);skills();
}
// death effects: confetti poof, kill count (also runs for the wave being left behind)
function reap(w){for(const e of w.es){if(e.hp>0||e.dead)continue;e.dead=1;e.dt=0;G.kills++;const[x,y]=ec(e,w.n),big=['boss','snake','summoner'].includes(e.type);
 burst(x,y,big?60:20,SHCOL[e.shape]||'#4fa84f');burst(x,y,big?20:6,'#fff');float(x,y,big?'BOOM!':['POOF!','POP!','SPLAT!'][e.id%3],'#fff',big?30:18,800);sfx.pop()}}
export function advance(){reap(G.active);sfx.clear();G.wave++;G.active=G.next;G.next=genWave(G.wave+1);G.zones=[];toast(G.active.boss?`Wave ${G.wave} — BOSS`:`Wave ${G.wave}`)}
export function pickBuff(k){if(k){G.buffs[k]=(G.buffs[k]||0)+1;if(k=='slot')G.maxSlots=4;if(k=='heal')G.hp=CFG.hp}hide();G.state='play';advance();skills()}
const cleared=()=>{const es=G.active.es,s=es.find(e=>e.type=='summoner');if(s&&s.hp<=0)es.forEach(e=>e.hp=Math.min(e.hp,0));return es.every(e=>e.hp<=0)}; // killing the summoner removes its minions
export function afterStrike(){if(G.state!='play'||!cleared())return;float(.5,.45,G.active.boss?'BOSS DOWN!':'WAVE CLEAR!','#ffe27a',30,1200);burst(.5,.5,40,'#ffe27a');if(G.active.w%5==0){G.state='buff';showBuff()}else advance()}
// freeform strike: every separate stroke (or copy), and every re-entry into an enemy, is one hit
export function strike(cps,dmg){
 const w=G.active,sp=cps.map(samp);
 for(const e of w.es){if(e.hp<=0)continue;let h=0;
  for(const pts of sp){let inn=false;for(const p of pts){const t=touches(e,[p],w.n);if(t&&!inn)h++;inn=t}}
  if(h){const v=rate(e);e.hp-=dmg*h*v;if(v)e.fl=1}}
}
export function fire(st,bonus,col){
 const sp=spellOf(st),cps=copies(st),wv=G.active;volley(cps,sp,1+bonus,false,col);
 if(G.buffs.echo&&!cleared())G.timers.push({t:CFG.echoDelay,f:()=>{if(G.active===wv&&G.state=='play'){volley(cps,sp,.5*(1+bonus),true,col);afterStrike()}}});
 afterStrike();
}
export function updateMatch(){const r=identify(G.strokes,G.pats),sp=spellOf(G.strokes);G.match=r&&r.p;skills();const lk=shape(G.strokes);
 if(lk&&!sp)return toast('🔒 '+lk.n+' needs '+lk.need+' max ink (you have '+maxInk().toFixed(1)+')');
 if(sp)return toast(`✦ ${sp.n} Lv ${lvOf(sp.k)} ready`);
 if(G.match&&G.match.learned)toast(`${G.match.name} recognized — +1 damage`);else if(G.match)toast(`Pattern seen ${G.match.count}×`)}
export function cast(){
 if(G.state!='play'||!G.strokes.length)return;
 const st=G.strokes,msgs=[];
 G.strokes=[];G.cur=null;G.inkUsed=0;G.pend=null;G.idle=null;G.aid=null;G.match=null;G.casts++;
 let bonus=0;const r=identify(st,G.pats),sp=spellOf(st);
 if(r){let p=r.p;
  if(!p){p={id:G.pats.length,t:r.n1,count:0,learned:0,name:(sp||{}).n||nm(r.f,G.pats.length),th:st};G.pats.push(p)}
  bonus=p.learned?1:0;p.count++;
  if(!p.learned&&p.count>=CFG.learn){
   if(G.slots.length<G.maxSlots){p.learned=1;p.cd=0;G.slots.push(p);msgs.push('New skill learned: '+p.name)}
   else{const lo=G.slots[G.slots.length-1];if(p.count>lo.count){lo.learned=0;p.learned=1;p.cd=0;G.slots[G.slots.length-1]=p;msgs.push(`Skill replaced: ${lo.name} → ${p.name}`)}}}
  G.slots.sort((a,b)=>b.count-a.count)}
 if(sp){const o=lvOf(sp.k);G.use[sp.k]=(G.use[sp.k]||0)+1;const l=lvOf(sp.k);if(l>o)msgs.push(`${sp.n} reached Lv ${l}!`)}
 fire(st,bonus,'#ffb347');skills();if(msgs.length){toast(msgs.join(' · '));sfx.learn()}
}
/* ---------- boss behaviours ---------- */
// snake: steps to the adjacent cell that keeps most of its body away from your ink
function slither(e){
 const n=G.active.n,ip=copies(G.strokes).flatMap(samp),h=e.cells[0],occ=e.cells.map(c=>c[0]+','+c[1]);
 const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>[h[0]+a,h[1]+b,1,1]).filter(c=>c[0]>=0&&c[1]>=0&&c[0]<n&&c[1]<n&&!occ.includes(c[0]+','+c[1]));
 if(!opts.length)return;
 const bad=cs=>ip.length?cs.filter(c=>touches({cells:[c]},ip,n)).length:0;let best=1e9,pool=[];
 for(const m of opts){const s=bad([m,...e.cells.slice(0,-1)]);if(s<best){best=s;pool=[m]}else if(s==best)pool.push(m)}
 const m=pool[Math.floor(Math.random()*pool.length)];e.pc=e.cells.map(c=>c.slice());e.cells.unshift(m);e.cells.pop();e.c=m[0];e.r=m[1]}
// summoner: every 4th step it calls a minion into a free cell (capped)
function summon(){
 const w=G.active,n=w.n,occ={};
 w.es.forEach(e=>{if(e.hp>0)cellsOf(e).forEach(([c,r,cw,ch])=>{for(let i=0;i<cw;i++)for(let j=0;j<ch;j++)occ[(c+i)+','+(r+j)]=1})});
 const fr=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(!occ[i+','+j])fr.push([i,j]);
 if(!fr.length||w.es.filter(e=>e.type=='minion'&&e.hp>0).length>=Math.ceil(n*n/4))return;
 const[c,r]=fr[Math.floor(Math.random()*fr.length)];w.es.push({c,r,w:1,h:1,type:'minion',shape:'triangle',hp:1,max:1,d:4,d0:5,atk:0,fl:0,id:w.es.length});toast('The summoner calls a minion!')}
/* ---------- enemy turn ---------- */
function hurt(e){
 const[x,y]=ec(e,G.active.n);
 if(G.sh>0){G.sh--;float(x,y,'BLOCKED','#5bb8ff',22,900);sfx.block()}
 else{G.hp--;G.hits++;G.hurt=1;G.shk=1;float(x,y,'-1 ♥','#ff6b6b',28,1000);sfx.hurt();if(settings.vibe&&navigator.vibrate)navigator.vibrate([90,40,90])}
 if(G.hp<=0){G.state='over';G.pend=null;showOver();return}
 if(G.strokes.length&&G.pend==null){G.pend=CFG.autoDelay;G.idle=null;G.cur=null;G.aid=null;toast('Hit! Auto-casting…')}
}
function tick(){
 let burn=0;
 for(const z of G.zones){z.life--;for(const e of G.active.es)if(e.hp>0&&touches(e,[[z.x,z.y]],G.active.n,z.r)){e.hp-=z.dmg;e.fl=1;burn=1}}
 G.zones=G.zones.filter(z=>z.life>0);if(burn)afterStrike();
 for(const e of [...G.active.es]){if(G.state!='play')return;if(e.hp<=0)continue;if(e.fz>0){e.fz--;continue}if(e.type=='snake')slither(e);if(e.type=='summoner'&&(e.sc=(e.sc||0)+1)%4==0)summon();e.d--;if(e.d<=0){e.d=e.d0;e.atk=1;hurt(e);if(G.state!='play')return}}
}
export function update(dt){
 reap(G.active);for(const e of G.active.es)if(e.dead)e.dt+=dt;
 for(const e of G.active.es){e.fl=Math.max(0,e.fl-dt/250);e.atk=Math.max(0,e.atk-dt/400)}
 G.hurt=Math.max(0,G.hurt-dt/700);G.shk=Math.max(0,G.shk-dt/450);
 G.fx.forEach(f=>f.t+=dt/600);G.fx=G.fx.filter(f=>f.t<1);
 G.pts.forEach(p=>{p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.l-=dt});G.pts=G.pts.filter(p=>p.l>0);G.txt.forEach(t=>t.l-=dt);G.txt=G.txt.filter(t=>t.l>0);
 if(G.state!='play')return;
 G.acc+=dt;if(G.strokes.length&&G.inkUsed>0)G.inkUsed=Math.max(0,G.inkUsed-CFG.regen*(1+.1*(G.buffs.regen||0))*dt/1000);
 while(G.acc>=1000&&G.state=='play'){G.acc-=1000;tick()}
 if(G.pend!=null&&G.state=='play'){G.pend-=dt;if(G.pend<=0){G.pend=null;cast()}}
 if(G.idle!=null&&G.aid==null&&G.state=='play'){G.idle-=dt;if(G.idle<=0){G.idle=null;cast()}}
 for(const p of [...G.slots]){if(G.state!='play')break;p.cd=(p.cd||0)+dt;if(p.cd>=CFG.skillCd){p.cd=0;fire(p.th,1,'#5be0d0')}}
 if(G.state=='play'){for(const o of G.timers)o.t-=dt;const due=G.timers.filter(o=>o.t<=0);G.timers=G.timers.filter(o=>o.t>0);due.forEach(o=>o.f())}
}
