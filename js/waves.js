export const gridFor=w=>Math.min(10,3+Math.floor((w-1)/5));
export function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const SH=['circle','triangle','diamond','hex','square'],LG=['pill','hex','shield'],BS=['star','cross'];
export function genWave(w){
 const n=gridFor(w),r=rng(w*7919+13),boss=w%5==0,es=[],occ=Array(n*n).fill(0),base=Math.max(5,8-Math.floor(w/8)),pick=a=>a[Math.floor(r()*a.length)];
 const fits=(c,y,cw,ch)=>{if(c+cw>n||y+ch>n)return 0;for(let i=0;i<cw;i++)for(let j=0;j<ch;j++)if(occ[(y+j)*n+c+i])return 0;return 1};
 const put=(c,y,cw,ch,type,shape,hp,d)=>{for(let i=0;i<cw;i++)for(let j=0;j<ch;j++)occ[(y+j)*n+c+i]=1;es.push({c,r:y,w:cw,h:ch,type,shape,hp,max:hp,d:Math.ceil(d*.7),d0:d,atk:0,fl:0,id:es.length})};
 if(boss){const k=(w/5)%3,bh=8+2*w; // boss cycle: block -> snake -> summoner
  if(k==2){const L=Math.min(4,n),cells=[];for(let i=L-1;i>=0;i--)cells.push([i,0,1,1]);const h=Math.round(bh*.8);es.push({c:L-1,r:0,w:1,h:1,cells,type:'snake',shape:'snake',hp:h,max:h,d:9,d0:14,atk:0,fl:0,id:0})}
  else if(k==0)put(Math.floor((n-2)/2),0,2,2,'summoner','octagon',Math.round(bh*.9),14);
  else{const s=Math.min(n-1,3);put(Math.floor(r()*(n-s+1)),Math.floor(r()*(n-s+1)),s,s,'boss',BS[Math.floor(w/15)%2],bh,12)}}
 else{const cnt=w==1?1:Math.min(Math.floor(n*n*.5),2+Math.floor(w/3)),calm=w<=2?4:0; // wave 1-2 are gentle
  for(let i=0;i<cnt;i++){const big=w>1&&r()<.3,[cw,ch]=big?(r()<.5?[2,1]:[1,2]):[1,1];
   for(let k=0;k<20;k++){const c=Math.floor(r()*n),y=Math.floor(r()*n);
    if(fits(c,y,cw,ch)){put(c,y,cw,ch,big?'large':'basic',pick(big?LG:SH),(big?3:1)+Math.floor(w/(big?5:8)),Math.max(3,base+(big?1:0)+[-2,0,0,3][Math.floor(r()*4)])+calm);break}}}}
 return{n,w,es,boss};
}
