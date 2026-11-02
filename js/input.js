import {G,V,maxInk} from './state.js';
import {sfx} from './audio.js';
import {cast,updateMatch} from './combat.js';
import {cv} from './render.js';
import {kind} from './recog.js';
import {toast,skills,togglePause} from './ui.js';
const $=id=>document.getElementById(id);
function pt(e){const r=cv.getBoundingClientRect();return[Math.min(1,Math.max(0,(e.clientX-r.left-V.bx)/V.S)),Math.min(1,Math.max(0,(e.clientY-r.top-V.by)/V.S))]}
function endStroke(e){
 if(e.pointerId!==G.aid)return;G.aid=null;
 if(G.cur){if(G.cur.length<2)G.strokes=G.strokes.filter(s=>s!==G.cur);G.cur=null;if(G.strokes.length&&G.state=='play'){updateMatch();G.idle=G.strokes.length==1&&kind(G.strokes[0])?800:500}}
}
function flash(b,c){b.classList.remove('pop','dud');void b.offsetWidth;b.classList.add(c)}
function pressCast(){if(G.state!='play')return;const b=$('cast');if(G.strokes.length){cast();flash(b,'pop')}else{flash(b,'dud');toast('Draw something first')}}
function clearDrawing(){if(G.state!='play'||G.pend!=null)return;G.strokes=[];G.idle=null;G.cur=null;G.inkUsed=0;G.match=null;skills()}
export function initInput(){
 cv.addEventListener('pointerdown',e=>{
  if(G.state!='play'||G.pend!=null||G.aid!=null||G.inkUsed>=maxInk())return;
  if(e.clientY-cv.getBoundingClientRect().top<V.by-10)return;
  G.aid=e.pointerId;G.idle=null;cv.setPointerCapture(e.pointerId);G.cur=[pt(e)];G.strokes.push(G.cur);e.preventDefault()});
 cv.addEventListener('pointermove',e=>{
  G.look=pt(e);if(e.pointerId!==G.aid||!G.cur)return;
  let p=pt(e);const l=G.cur.at(-1);let d=Math.hypot(p[0]-l[0],p[1]-l[1]);
  if(d<.004)return;const rem=maxInk()-G.inkUsed;if(rem<=0)return;
  if(d>rem){const t=rem/d;p=[l[0]+(p[0]-l[0])*t,l[1]+(p[1]-l[1])*t];d=rem}
  G.cur.push(p);G.inkUsed+=d;sfx.draw()});
 cv.addEventListener('pointerup',endStroke);cv.addEventListener('pointercancel',endStroke);
 $('cast').addEventListener('pointerdown',e=>{e.preventDefault();pressCast()});
 $('cast').addEventListener('click',e=>{if(e.detail===0)pressCast()});
 $('clear').onclick=clearDrawing;$('pause').onclick=togglePause;
 addEventListener('keydown',e=>{
  if(e.code=='Escape'||e.code=='KeyP'){if(!e.repeat)togglePause();return}
  if(G.state!='play')return;
  if(e.code=='Space'){e.preventDefault();if(!e.repeat)pressCast()}
  else if(e.code=='KeyC'||e.code=='Backspace')clearDrawing()});
 addEventListener('keyup',e=>{if(e.code=='Space'&&G.state=='play')e.preventDefault()});
}
