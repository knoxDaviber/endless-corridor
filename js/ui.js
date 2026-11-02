import {G,settings,saveSettings,maxInk,best,setBest} from './state.js';
import {CFG,BUFFS,REP,SPELLS,LEVELS,levelOf} from './config.js';
import {audioInit} from './audio.js';
import {newGame,pickBuff} from './combat.js';
const $=id=>document.getElementById(id);let tt,lastHits=0,cache={};
export function toast(m){const t=$('toast');t.textContent=m;t.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>t.style.opacity=0,2200)}
export const hide=()=>{$('ov').style.display='none'};
function show(html,wire){const o=$('ov');o.innerHTML=html;o.style.display='flex';o.scrollTop=0;if(wire)wire(id=>o.querySelector('#'+id))}
const btn=(id,t,c='')=>`<button class="mb ${c}" id="${id}">${t}</button>`;
export function applySettings(){document.body.classList.toggle('calm',settings.calm)}
const home=()=>G.state=='pause'?showPause():showMenu();
/* ---------- screens ---------- */
export function showMenu(){G.state='menu';
 show(`<h1>Endless Corridor</h1><p class="sub">Draw your own spells. Survive the paper horde.</p>${best()?`<p class="sub">Best: wave ${best()}</p>`:''}${btn('p','Play','big')}${btn('h','How to Play','alt')}${btn('b','Spellbook','alt')}${btn('s','Settings','alt')}<p class="sub" style="font-size:12px">Sensitive to flashing lights? Turn on <b>Reduce flashing</b> in Settings.</p>`,q=>{
  q('p').onclick=()=>{audioInit();const go=()=>{newGame('play');hide()};if(localStorage.getItem('ec.tut'))go();else showTutorial(go)};
  q('h').onclick=()=>showTutorial(showMenu);q('b').onclick=()=>showBook(showMenu);q('s').onclick=()=>showSettings(showMenu)})}
export function pause(){if(G.state!='play')return;G.state='pause';showPause()}
export function resume(){if(G.state!='pause')return;hide();G.state='play'}
export const togglePause=()=>G.state=='play'?pause():resume();
function showPause(){show(`<h2>Paused</h2>${btn('r','Resume','big')}${btn('b','Spellbook','alt')}${btn('h','How to Play','alt')}${btn('s','Settings','alt')}${btn('q','Quit to menu','alt')}`,q=>{
 q('r').onclick=resume;q('b').onclick=()=>showBook(showPause);q('h').onclick=()=>showTutorial(showPause);q('s').onclick=()=>showSettings(showPause);q('q').onclick=()=>{newGame('menu');showMenu()}})}
const SET=[['sound','Sound','Sound effects'],['music','Music',''],['calm','Reduce flashing','Removes flashes, screen shake, flicker and sparkle bursts. Recommended for photosensitive epilepsy.'],['shake','Screen shake','Shake the screen when you take a hit'],['vibe','Vibration','Buzz your device when you take a hit']];
function showSettings(back){
 show('<h2>Settings</h2>'+SET.map(([k,n,d])=>`<div class="row"><div><b>${n}</b>${d?`<small>${d}</small>`:''}</div><button id="t-${k}" class="${settings[k]?'':'off'}">${settings[k]?'On':'Off'}</button></div>`).join('')+btn('x','Back','alt'),q=>{
  SET.forEach(([k])=>q('t-'+k).onclick=()=>{settings[k]=!settings[k];saveSettings();applySettings();showSettings(back)});q('x').onclick=back})}
const TUT=[['👾','Survive the horde','Paper monsters march toward you — one step every second. Clear every monster on the sheet to reach the next wave. Your hearts are at the top.'],
 ['✏️','Draw on the paper','Drag your finger (or mouse) over a monster. Your line uses ink — the blue bar at the top shows how much you have left.'],
 ['✨','Cast it','Stop drawing and your spell casts by itself after half a second. You can also tap Cast, or press Space.'],
 ['⏱️','Timing is power','Monsters grow as they get closer. Their outline shows your damage: none = miss, white = half, gold = full, red = CRIT ×2. Wait for the moment, then strike!'],
 ['🔁','Learn your own skills','Draw the same shape 3 times and you learn it. Learned skills live in the bar at the bottom and recast themselves every 8 seconds.'],
 ['📖','Special spells','Secret gestures — like a zigzag ⚡ for Lightning — unlock powerful spells. Find them all in Pause → Spellbook. Spells level up (to Lv 5) the more you cast them.'],
 ['👑','Bosses & buffs','Every 5th wave is a boss. Beat it to grow the board and pick a buff. Good luck!']];
function showTutorial(end,i=0){const[ic,h,b]=TUT[i],last=i==TUT.length-1;
 show(`<div class="step">${ic}</div><h2>${h}</h2><p>${b}</p><div class="dots">${TUT.map((_,j)=>`<i class="${j==i?'on':''}"></i>`).join('')}</div>${btn('n',last?'Got it!':'Next','big')}${i?btn('k','Back','alt'):''}${last?'':btn('s','Skip','ghost')}`,q=>{
  const fin=()=>{try{localStorage.setItem('ec.tut',1)}catch{}end()};
  q('n').onclick=()=>last?fin():showTutorial(end,i+1);if(i)q('k').onclick=()=>showTutorial(end,i-1);if(!last)q('s').onclick=fin})}
function showBook(back){const mi=maxInk();
 show('<h2>Spellbook</h2><p class="sub" style="font-size:13px">Spells level up with use: Lv2 at 5 casts, Lv3 at 15, Lv4 at 30, Lv5 at 50.</p>'+SPELLS.map(s=>{const n=(G.use&&G.use[s.k])||0,l=levelOf(n),lock=s.need>mi;
  return`<div class="sp" style="${lock?'opacity:.55':''}"><canvas width="104" height="104" data-k="${s.k}"></canvas><div><b style="color:${s.c}">${s.n}</b> <span class="lv">Lv ${l}${l==5?' MAX':''}</span><div class="pips">${LEVELS.map((_,j)=>`<i class="${j<l?'on':''}"></i>`).join('')}</div><small>${s.d}</small><small>${lock?'🔒 needs '+s.need+' max ink':n+' casts'+(l<5?' · next level at '+LEVELS[l]:'')}</small></div></div>`}).join('')+btn('x','Back','alt'),q=>{
  document.querySelectorAll('#ov canvas').forEach(c=>{const s=SPELLS.find(v=>v.k==c.dataset.k),x=c.getContext('2d');x.strokeStyle=s.c;x.lineWidth=5;x.lineCap=x.lineJoin='round';
   for(const st of s.i){x.beginPath();st.forEach((p,j)=>x[j?'lineTo':'moveTo'](14+p[0]*76,14+p[1]*76));x.stroke()}});
  q('x').onclick=back})}
export function showBuff(){
 show('<h2>Boss defeated!</h2><div>Choose one buff</div><div id="cards"></div>',q=>{
  for(const k in BUFFS){if(G.active.w%10&&!REP[k])continue;const own=!!G.buffs[k],b=document.createElement('button');b.className='card';b.disabled=own&&!REP[k];
   b.innerHTML=`<b>${BUFFS[k][0]}</b><span>${BUFFS[k][1]}</span>${own&&!REP[k]?'<i>Owned</i>':own?'<i>x'+G.buffs[k]+'</i>':''}`;b.onclick=()=>pickBuff(k);q('cards').append(b)}})}
export function showOver(){const b=best(),nb=G.wave>b;if(nb)setBest(G.wave);show(`<h2>Defeated</h2><p>You reached wave ${G.wave}${nb?' — new best!':` (best ${b})`}<br>${G.kills} monsters popped</p>${btn('r','Play again','big')}${btn('m','Main menu','alt')}`,q=>{
 q('r').onclick=()=>{newGame('play');hide()};q('m').onclick=()=>{newGame('menu');showMenu()}})}
/* ---------- skill bar / HUD ---------- */
function thumb(c,st){const x=c.getContext('2d'),f=st.flat(),xs=f.map(p=>p[0]),ys=f.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),sz=Math.max(Math.max(...xs)-x0,Math.max(...ys)-y0)||1,m=10,k=(c.width-2*m)/sz;
 x.fillStyle='#f3ead7';x.fillRect(0,0,c.width,c.height);x.strokeStyle='#2236a8';x.lineWidth=4;x.lineCap=x.lineJoin='round';
 for(const s of st){x.beginPath();s.forEach((p,i)=>x[i?'lineTo':'moveTo'](m+(p[0]-x0)*k,m+(p[1]-y0)*k));x.stroke()}}
export function skills(){
 const el=$('skills');el.innerHTML='';
 for(let i=0;i<G.maxSlots;i++){const p=G.slots[i],d=document.createElement('div');d.className='slot'+(p&&G.match===p?' hot':'');
  if(p){const c=document.createElement('canvas');c.width=c.height=80;thumb(c,p.th);d.append(c);d.insertAdjacentHTML('beforeend',`<b>${p.name}</b><span>×${p.count}</span><i class="cd"><u></u></i>`)}
  else d.innerHTML='<span>empty</span>';
  el.append(d)}
}
const set=(el,k,v)=>{if(cache[k]!==v){cache[k]=v;el.innerHTML=v}};
export function hint(){if(G.state!='play'||G.casts>=3)return'';if(G.pend!=null||G.idle!=null)return'';return G.strokes.length?'Tap Cast (or press Space)':'Drag across the board to draw over a monster'}
export function ui(){
 const w=G.active;if(!w)return;
 set($('wv'),'wv',`Wave ${G.wave}${w.boss?' ★':''} · ${w.n}×${w.n}`);
 set($('hp'),'hp','♥'.repeat(Math.max(0,G.hp))+'<span style="color:#5bb8ff">'+'♥'.repeat(G.sh||0)+'</span>');
 if(G.hits!==lastHits){lastHits=G.hits;const h=$('hp');h.classList.remove('hit');void h.offsetWidth;h.classList.add('hit')}
 $('ink').style.width=Math.max(0,100*(1-G.inkUsed/maxInk()))+'%';
 $('pause').style.visibility=G.state=='play'?'visible':'hidden';
 const b=$('cast'),ac=G.pend!=null?1-G.pend/CFG.autoDelay:G.idle!=null?1-G.idle/CFG.idle:0;b.classList.toggle('idle',!(G.state=='play'&&G.strokes.length));b.style.setProperty('--p',Math.max(0,Math.min(1,ac))*100+'%');
 $('clear').disabled=G.pend!=null||!G.strokes.length;
 document.querySelectorAll('.slot').forEach((d,i)=>{const u=d.querySelector('u'),p=G.slots[i];if(u&&p)u.style.width=Math.min(100,(p.cd||0)/CFG.skillCd*100)+'%'});
}
