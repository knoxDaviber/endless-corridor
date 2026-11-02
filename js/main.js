import {G,V} from './state.js';
import {cv,draw} from './render.js';
import {update,newGame} from './combat.js';
import {ui,showMenu,applySettings,pause} from './ui.js';
import {initInput} from './input.js';
function resize(){const r=cv.getBoundingClientRect(),d=devicePixelRatio||1;V.dpr=d;V.W=r.width;V.H=r.height;cv.width=r.width*d;cv.height=r.height*d;V.S=Math.min(V.W-12,V.H*.68);V.bx=(V.W-V.S)/2;V.by=V.H-V.S-4}
let last=performance.now();
function loop(now){const dt=Math.min(100,now-last);last=now;if(G.state!='pause'&&G.state!='menu')update(dt);draw();ui();requestAnimationFrame(loop)}
new ResizeObserver(resize).observe(document.getElementById('stage'));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
applySettings();initInput();newGame('menu');showMenu();resize();requestAnimationFrame(loop);
