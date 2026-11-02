import {G,V,settings} from './state.js';
import {CFG,SHCOL} from './config.js';
import {copies,prog,tier} from './util.js';
import {hint} from './ui.js';
export const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const PL={triangle:[[0,-.5],[.5,.5],[-.5,.5]],diamond:[[0,-.5],[.5,0],[0,.5],[-.5,0]],hex:[[-.25,-.5],[.25,-.5],[.5,0],[.25,.5],[-.25,.5],[-.5,0]],shield:[[-.5,-.5],[.5,-.5],[.5,.1],[0,.5],[-.5,.1]],
 octagon:Array.from({length:8},(_,i)=>[Math.cos(i*Math.PI/4+Math.PI/8)*.5,Math.sin(i*Math.PI/4+Math.PI/8)*.5]),
 star:Array.from({length:10},(_,i)=>{const r=i%2?.22:.5,a=i*Math.PI/5-Math.PI/2;return[Math.cos(a)*r,Math.sin(a)*r]}),
 cross:[[-.17,-.5],[.17,-.5],[.17,-.17],[.5,-.17],[.5,.17],[.17,.17],[.17,.5],[-.17,.5],[-.17,.17],[-.5,.17],[-.5,-.17],[-.17,-.17]]};
function shapePath(k,w,h){ctx.beginPath();
 if(k=='circle')ctx.ellipse(0,0,w/2,h/2,0,0,7);
 else if(k=='square')ctx.roundRect(-w/2,-h/2,w,h,Math.min(w,h)*.18);
 else if(k=='pill')ctx.roundRect(-w/2,-h/2,w,h,Math.min(w,h)/2);
 else{PL[k].forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x*w,y*h));ctx.closePath()}}
function poly(pts,fill){ctx.beginPath();pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function corridor(px,py,iw,ih){const{W,H}=V,L=px-iw/2,R=px+iw/2,T=py-ih/2,B=py+ih/2;
 poly([[0,0],[W,0],[R,T],[L,T]],'#2b2840');poly([[0,H],[W,H],[R,B],[L,B]],'#3a3550');
 poly([[0,0],[0,H],[L,B],[L,T]],'#322e48');poly([[W,0],[W,H],[R,B],[R,T]],'#2e2a44');
 ctx.fillStyle='#0c0a14';ctx.fillRect(L,T,iw,ih);ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1.5;
 for(let k=1;k<7;k++){const t=Math.pow(k/7,.6);ctx.strokeRect(L*t,T*t,W+(R-W)*t-L*t,H+(B-H)*t-T*t)}}
function face(e,w,h,n){ // expressions: personality (by id) + mood (hurt, about to attack, low hp, close, frozen); pupils follow your finger
 const u=Math.min(w,h),ex=w*.2,ey=-h*.1,r=u*.1,dying=e.hp<=0,hurt=e.fl>.4||dying,atk=e.atk>.2||e.d<=1,low=e.hp<e.max*.4,close=e.pf>=2,fz=e.fz>0,pn=e.id%4,my=h*.18,slp=pn==1&&!atk&&!close;
 const c=[(e.c+e.w/2)/n,(e.r+e.h/2)/n],L=G.look||[c[0],c[1]+.5],dx=L[0]-c[0],dy=L[1]-c[1],dl=Math.hypot(dx,dy)||1,lx=dx/dl,ly=dy/dl;
 ctx.save();if(e.shape=='triangle')ctx.translate(0,h*.15);
 ctx.lineCap=ctx.lineJoin='round';ctx.lineWidth=Math.max(1.5,u*.035);ctx.strokeStyle='#2a2013';
 for(const s of[-1,1]){const x=s*ex;
  if(hurt){ctx.beginPath();ctx.moveTo(x+s*r,ey-r);ctx.lineTo(x-s*r,ey);ctx.lineTo(x+s*r,ey+r);ctx.stroke()}
  else{const big=atk?1.45:pn==3&&s>0?1.35:1.1;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,ey,r*big,0,slp?Math.PI:7);ctx.fill();ctx.stroke();
   ctx.fillStyle='#2a2013';ctx.beginPath();ctx.arc(x+lx*r*.45,ey+(slp?r*.45:ly*r*.45),r*(atk?.4:slp?.5:.55),0,7);ctx.fill();
   const ang=atk||close||pn==2&&!low,wor=low&&!atk;
   if(ang||wor){ctx.beginPath();ctx.moveTo(x+s*r*1.5,ey-r*(ang?2.5:1.7));ctx.lineTo(x-s*r,ey-r*(ang?1.5:2.7));ctx.stroke()}}}
 ctx.fillStyle='#2a2013';ctx.beginPath();
 if(hurt||atk){ctx.ellipse(0,my,w*(atk&&!hurt?.2:.09),u*(atk&&!hurt?.13:.1),0,0,7);ctx.fill();if(atk&&!hurt){ctx.fillStyle='#fff';ctx.fillRect(-w*.13,my-u*.12,w*.26,u*.05)}}
 else if(low||fz){ctx.moveTo(-w*.14,my);ctx.quadraticCurveTo(-w*.07,my-u*.07,0,my);ctx.quadraticCurveTo(w*.07,my+u*.07,w*.14,my);ctx.stroke()}
 else if(close||pn==3){ctx.arc(0,my-u*.05,w*.16,.15*Math.PI,.85*Math.PI);ctx.stroke();if(pn==3&&!close){ctx.fillStyle='#ff7a9a';ctx.beginPath();ctx.arc(w*.05,my+u*.1,u*.05,0,7);ctx.fill()}}
 else if(pn==2){ctx.arc(0,my+u*.1,w*.14,1.15*Math.PI,1.85*Math.PI);ctx.stroke()}
 else if(pn==1){ctx.arc(0,my,u*.05,0,7);ctx.stroke()}
 else{ctx.moveTo(-w*.15,my);ctx.lineTo(w*.15,my);ctx.stroke()}
 if(low&&!hurt){ctx.fillStyle='#6cf';ctx.beginPath();ctx.ellipse(w*.33,-h*.18,u*.04,u*.07,0,0,7);ctx.fill()}
 ctx.restore()}
function enemy(e,cx,cy,w,h,n){
 const dying=e.hp<=0,t=performance.now(),u=Math.min(w,h);
 ctx.save();ctx.translate(cx,cy);
 if(dying){const k=Math.min(1,e.dt/300);ctx.globalAlpha*=1-k;ctx.rotate(k*.6);w*=1+k*.5;h*=1+k*.5}
 else if(!settings.calm){ctx.translate(0,Math.sin(t/400+e.id*2)*h*.03);ctx.rotate(Math.sin(t/500+e.id)*.03)} // idle bob
 if(e.fl>0&&!settings.calm&&!dying){const s=1+.12*e.fl;ctx.scale(s,1/s)} // squash when hit
 ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=5;ctx.shadowOffsetX=2;ctx.shadowOffsetY=3;
 if(e.pf===0&&!dying)ctx.globalAlpha*=.6;
 const hit=e.fl>.4&&!dying;ctx.fillStyle=hit&&!settings.calm?'#fff':SHCOL[e.shape];
 ctx.strokeStyle=hit&&settings.calm?'#fff':e.pf==3?'#ff5a36':e.pf==2?'#ffd400':e.pf==1?'#fff':'#2a2013';ctx.lineWidth=hit&&settings.calm?5:e.pf==3?7:e.pf==2?5:2;
 shapePath(e.shape,w,h);ctx.fill();ctx.shadowColor='transparent';ctx.stroke();
 if(e.fz>0){ctx.fillStyle='rgba(160,225,255,.55)';shapePath(e.shape,w,h);ctx.fill();ctx.strokeStyle='#e8fbff';ctx.lineWidth=3;ctx.stroke()}
 face(e,w,h,n);
 if(e.max>1&&!dying){ctx.fillStyle='#2a2013';ctx.font=`700 ${Math.max(10,u*.2)}px system-ui`;ctx.textAlign='center';ctx.fillText(Math.ceil(e.hp),0,h*.42)}
 if(!dying&&e.d<=1){ctx.font=`900 ${Math.max(14,u*.4)}px system-ui`;ctx.textAlign='center';ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.fillStyle='#e22';ctx.strokeText('!',w*.34,-h*.4);ctx.fillText('!',w*.34,-h*.4)} // about to strike
 ctx.restore()}
function snake(e,x,y,c,f){
 const k=Math.min(1,G.acc/300),P=e.cells.map(([a,b],i)=>{const q=e.pc&&e.pc[i]||[a,b];return[x+(q[0]+(a-q[0])*k+.5)*c,y+(q[1]+(b-q[1])*k+.5)*c]}),hit=e.fl>.4;
 ctx.save();ctx.lineCap=ctx.lineJoin='round';ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=5;ctx.shadowOffsetY=3;
 const edge=hit&&settings.calm?'#fff':e.pf==3?'#ff5a36':e.pf==2?'#ffd400':'#1f3d1f';
 for(const [w,col] of[[.8,edge],[.62,hit&&!settings.calm?'#fff':'#4fa84f']]){ctx.strokeStyle=col;ctx.lineWidth=c*w*f;ctx.beginPath();P.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p[0],p[1]));ctx.stroke();ctx.shadowColor='transparent'}
 const h=P[0],u=c*f;ctx.fillStyle='#fff';
 for(const s of[-1,1]){ctx.beginPath();ctx.arc(h[0]+s*u*.17,h[1]-u*.08,u*.11,0,7);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(h[0]+s*u*.17,h[1]-u*.08,u*.05,0,7);ctx.fill();ctx.fillStyle='#fff'}
 ctx.font='800 '+Math.max(10,u*.25)+'px system-ui';ctx.textAlign='center';const q=P[1]||h;ctx.fillText(Math.ceil(e.hp),q[0],q[1]+u*.08);ctx.restore()}
function sheet(w,x,y,s,live,alpha){
 ctx.save();ctx.globalAlpha=alpha;ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=12;ctx.shadowOffsetY=4;
 ctx.fillStyle='#efe6cf';ctx.fillRect(x,y,s,s);ctx.shadowColor='transparent';
 ctx.strokeStyle='#c9bd9c';ctx.lineWidth=1;const c=s/w.n;ctx.beginPath();
 for(let i=0;i<=w.n;i++){ctx.moveTo(x+i*c,y);ctx.lineTo(x+i*c,y+s);ctx.moveTo(x,y+i*c);ctx.lineTo(x+s,y+i*c)}ctx.stroke();
 for(const e of w.es){if(e.hp<=0&&!(e.dt<300))continue;
  const pr=prog(e),f=live?(.55+.45*pr)*(1+.35*e.atk):1; // attacking enemies lunge toward you
  if(live)e.pf=tier(pr);
  if(e.type=='snake'){if(e.hp>0)snake(e,x,y,c,f);continue}
  enemy(e,x+(e.c+e.w/2)*c,y+(e.r+e.h/2)*c+(live?e.atk*c*.15:0),e.w*c*f*.9,e.h*c*f*.9,w.n)}
 ctx.restore()}
function inkPath(cps,col,a,wide){const{bx,by,S}=V;
 ctx.save();ctx.lineCap=ctx.lineJoin='round';
 for(const pass of wide?[1,0]:[0]){ctx.strokeStyle=col;ctx.globalAlpha=pass?a*.25:a;ctx.lineWidth=pass?CFG.R*2*S:4;
  for(const s of cps){ctx.beginPath();s.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](bx+p[0]*S,by+p[1]*S));ctx.stroke()}}
 ctx.restore()}
// spell visuals grow with spell level (f.lv 1-5)
function spellFx(f,a){const{bx,by,S}=V,X=v=>bx+v[0]*S,Y=v=>by+v[1]*S,lv=f.lv||1;
 ctx.save();ctx.beginPath();ctx.rect(bx,by,S,S);ctx.clip();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=a;
 if(f.k=='ring'){const col=f.c||'#5bb8ff';ctx.strokeStyle=ctx.fillStyle=col;ctx.shadowColor=col;ctx.shadowBlur=14+4*lv;ctx.lineWidth=(10+2*lv)*a+2;ctx.beginPath();ctx.arc(X([f.x,0]),Y([0,f.y]),f.r*S*(.3+f.t*1.4),0,7);ctx.stroke();ctx.globalAlpha=a*.2;ctx.fill()}
 else if(f.k=='beam'){ctx.strokeStyle='#fff';ctx.shadowColor='#ffe27a';ctx.shadowBlur=18+4*lv;ctx.lineWidth=(18+4*lv)*a+2;ctx.beginPath();ctx.moveTo(X(f.a),Y(f.a));ctx.lineTo(X(f.b),Y(f.b));ctx.stroke()}
 else if(f.k=='bolt'){ctx.strokeStyle=f.chain?'#9fd0ff':'#fff6a8';ctx.shadowColor=f.chain?'#5b8cff':'#ffe94d';ctx.shadowBlur=12+3*lv;ctx.lineWidth=2+lv*.8;ctx.beginPath();f.pts.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](X(p),Y(p)));ctx.stroke()}
 else if(f.k=='trail'){ctx.strokeStyle=f.c;ctx.shadowColor=f.c;ctx.shadowBlur=12;ctx.lineWidth=(16+4*lv)*a+2;for(const s of f.ss){ctx.beginPath();s.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](X(p),Y(p)));ctx.stroke()}}
 else if(f.k=='meteor'&&f.t<.58){const t=f.t/.58,x=X([f.x,0]),y=Y([0,f.y]),sy=y-(1-t)*S*.9;ctx.strokeStyle='#ff9a3c';ctx.shadowColor='#ff5a1f';ctx.shadowBlur=24;ctx.lineWidth=12+2*lv;ctx.beginPath();ctx.moveTo(x-(1-t)*40,sy-90);ctx.lineTo(x,sy);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,sy,10+lv,0,7);ctx.fill()}
 ctx.restore()}
export function draw(){
 const{W,H,S,bx,by,dpr}=V;
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
 if(G.shk>0&&settings.shake&&!settings.calm){const m=12*G.shk;ctx.translate((Math.random()-.5)*m,(Math.random()-.5)*m)} // hit shake
 const P=S*.38;corridor(W/2,6+P/2,P*1.1,P);
 sheet(G.next,W/2-P/2,6,P,false,.8);sheet(G.active,bx,by,S,true,1);
 for(const z of G.zones){const x=bx+z.x*S,y=by+z.y*S,r=z.r*S*(settings.calm?1:.92+.08*Math.sin(performance.now()/300)),g=ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,`rgba(255,150,40,${.4*Math.min(1,z.life/z.max+.25)})`);g.addColorStop(1,'rgba(255,60,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill()}
 const cp=copies(G.strokes),n=G.strokes.length;
 inkPath(cp.slice(n),'#7a52c8',.9,true);inkPath(cp.slice(0,n),'#2236a8',1,true);
 for(const f of G.fx){const a=1-f.t;if(f.cps)inkPath(f.cps,f.echo?'#b46bff':(f.col||'#ffb347'),a*(f.echo?.8:1),true);else spellFx(f,a)}
 for(const p of G.pts){ctx.globalAlpha=Math.min(1,p.l/400);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(bx+p.x*S,by+p.y*S,3,0,7);ctx.fill()}
 ctx.globalAlpha=1;ctx.textAlign='center';
 for(const t of G.txt){ctx.font='800 '+(t.z||15)+'px system-ui';ctx.globalAlpha=Math.min(1,t.l/300);ctx.fillStyle=t.c;ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.strokeText(t.s,bx+t.x*S,by+t.y*S-(t.m-t.l)/t.m*30);ctx.fillText(t.s,bx+t.x*S,by+t.y*S-(t.m-t.l)/t.m*30)}
 ctx.globalAlpha=1;
 if(G.sh){ctx.strokeStyle='rgba(91,184,255,.6)';ctx.lineWidth=3*G.sh;ctx.strokeRect(bx,by,S,S)}
 if(G.hurt>0){ // damage: red vignette + border, fades smoothly (dimmer in reduce-flashing mode)
  const a=G.hurt*(settings.calm?.25:.6),g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.75);
  g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,30,30,${a})`);ctx.fillStyle=g;ctx.fillRect(-20,-20,W+40,H+40);
  ctx.strokeStyle=`rgba(255,70,70,${G.hurt*(settings.calm?.5:.9)})`;ctx.lineWidth=8;ctx.strokeRect(4,4,W-8,H-8)}
 const ac=G.pend??G.idle,ht=hint();ctx.fillStyle='#fff';ctx.font='700 16px system-ui';
 if(ac!=null&&ac>0)ctx.fillText('AUTO-CAST '+(ac/1000).toFixed(1)+'s',W/2,by-6);
 else if(ht){ctx.font='600 14px system-ui';const tw=ctx.measureText(ht).width+20;ctx.fillStyle='rgba(20,18,28,.8)';ctx.beginPath();ctx.roundRect(W/2-tw/2,by-26,tw,22,11);ctx.fill();ctx.fillStyle='#ffe27a';ctx.fillText(ht,W/2,by-10)}
}
