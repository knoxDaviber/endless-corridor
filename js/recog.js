import {CFG,ADJ,SPELLS} from './config.js';
export const plen=a=>{let l=0;for(let i=1;i<a.length;i++)l+=Math.hypot(a[i][0]-a[i-1][0],a[i][1]-a[i-1][1]);return l};
export function rs(a,n){const L=plen(a);if(!L)return Array(n).fill(a[0]);const I=L/(n-1),o=[a[0]],q=a.map(x=>x.slice());let D=0;
 for(let i=1;i<q.length;i++){const d=Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]);
  if(D+d>=I&&d>0){const t=(I-D)/d,m=[q[i-1][0]+t*(q[i][0]-q[i-1][0]),q[i-1][1]+t*(q[i][1]-q[i-1][1])];o.push(m);q.splice(i,0,m);D=0}else D+=d}
 while(o.length<n)o.push(q[q.length-1]);return o.slice(0,n)}
export function norm(a){const p=rs(a,32),cx=p.reduce((s,q)=>s+q[0],0)/32,cy=p.reduce((s,q)=>s+q[1],0)/32,an=-Math.atan2(p[0][1]-cy,p[0][0]-cx),c=Math.cos(an),s=Math.sin(an);
 const q=p.map(([x,y])=>[(x-cx)*c-(y-cy)*s,(x-cx)*s+(y-cy)*c]),xs=q.map(v=>v[0]),ys=q.map(v=>v[1]);
 const sz=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))||1;return q.map(([x,y])=>[x/sz,y/sz])}
const pd=(a,b)=>a.reduce((s,q,i)=>s+Math.hypot(q[0]-b[i][0],q[1]-b[i][1]),0)/a.length;
export function identify(st,pats){
 const f=st.flat();if(f.length<2||plen(f)<CFG.minLen)return null;
 const n1=norm(f),n2=norm([...f].reverse());let best=null,bd=1e9;
 for(const p of pats){const d=Math.min(pd(n1,p.t),pd(n2,p.t));if(d<bd){bd=d;best=p}}
 return{p:bd<CFG.sim?best:null,n1,f}}
export function nm(f,i){const L=plen(f),l=f.at(-1),ch=Math.hypot(f[0][0]-l[0],f[0][1]-l[1]);return ADJ[i%ADJ.length]+' '+(ch<.15*L?'Loop':ch>.85*L?'Slash':'Scrawl')}
/* ---- spell gestures ---- */
export const kind=s=>{const L=plen(s),ch=Math.hypot(s[0][0]-s.at(-1)[0],s[0][1]-s.at(-1)[1]);return L<.15?0:L>.35&&ch<.25*L?'loop':ch>.8*L?'line':0};
export function inter(A,B){const p=A[0],q=A.at(-1),r=B[0],s=B.at(-1),d=(q[0]-p[0])*(s[1]-r[1])-(q[1]-p[1])*(s[0]-r[0]);if(!d)return null;const t=((r[0]-p[0])*(s[1]-r[1])-(r[1]-p[1])*(s[0]-r[0]))/d,u=((r[0]-p[0])*(q[1]-p[1])-(r[1]-p[1])*(q[0]-p[0]))/d;return t>.12&&t<.88&&u>.12&&u<.88?[p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]:null}
export const cen=s=>[0,1].map(i=>s.reduce((q,p)=>q+p[i],0)/s.length);
function rdp(p,e){if(p.length<3)return p;let m=0,k=0;const a=p[0],b=p.at(-1),dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;
 for(let i=1;i<p.length-1;i++){const d=Math.abs(dx*(a[1]-p[i][1])-dy*(a[0]-p[i][0]))/L;if(d>m){m=d;k=i}}
 return m>e?[...rdp(p.slice(0,k+1),e).slice(0,-1),...rdp(p.slice(k),e)]:[a,b]}
// one stroke, 3-5 straight legs, sharp alternating turns = zigzag
function zig(s){if(plen(s)<.6)return 0;const v=rdp(s,.07);if(v.length<4||v.length>6)return 0;let sg=0;
 for(let i=1;i<v.length-1;i++){const a=[v[i][0]-v[i-1][0],v[i][1]-v[i-1][1]],b=[v[i+1][0]-v[i][0],v[i+1][1]-v[i][1]],la=Math.hypot(...a),lb=Math.hypot(...b);
  if(la<.1||lb<.1)return 0;const cr=a[0]*b[1]-a[1]*b[0];if(Math.acos((a[0]*b[0]+a[1]*b[1])/(la*lb))<1.25)return 0;if(sg&&Math.sign(cr)===sg)return 0;sg=Math.sign(cr)}
 return 1}
function tempest(st){if(!st.every(s=>kind(s)=='line'&&plen(s)>.6))return null;const d=s=>{const u=[s.at(-1)[0]-s[0][0],s.at(-1)[1]-s[0][1]],l=Math.hypot(...u)||1;return[u[0]/l,u[1]/l]},a=d(st[0]);return st.every(s=>{const b=d(s);return Math.abs(a[0]*b[0]+a[1]*b[1])>.85})?SPELLS.find(s=>s.k=='storm'):null}
function segD(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2));return[Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy),t]}
const tee=(a,b)=>[a[0],a.at(-1)].some(p=>{const[d,t]=segD(p,b[0],b.at(-1));return d<.1&&t>.2&&t<.8}); // end of one line touches the middle of the other
export function shape(st){const by=k=>SPELLS.find(s=>s.k==k);
 if(st.length==1)return zig(st[0])?by('bolt'):kind(st[0])=='loop'&&plen(st[0])>.7?by('frost'):null;
 if(st.length==3)return tempest(st);if(st.length!=2)return null;
 const[A,B]=st,ka=kind(A),kb=kind(B);
 if(ka=='loop'&&kb=='loop'&&plen(A)>1&&plen(B)>1&&Math.hypot(cen(A)[0]-cen(B)[0],cen(A)[1]-cen(B)[1])<.12)return by('sun');
 if(ka=='loop'&&kb=='line'||ka=='line'&&kb=='loop')return by('nova');
 if(ka!='line'||kb!='line')return null;
 const u=[A.at(-1)[0]-A[0][0],A.at(-1)[1]-A[0][1]],v=[B.at(-1)[0]-B[0][0],B.at(-1)[1]-B[0][1]],c=Math.abs(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)||1);
 if(inter(A,B)&&c<.9)return by('meteor');
 if(c<.35&&(tee(A,B)||tee(B,A)))return by('quake');
 return c>.9?by('beam'):null}
