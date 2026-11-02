import {CFG} from './config.js';
export const G={};                       // current run (reset by newGame)
export const V={W:0,H:0,S:0,bx:0,by:0,dpr:1}; // canvas metrics
let saved={};try{saved=JSON.parse(localStorage.getItem('ec.settings')||'{}')}catch{}
export const settings=Object.assign({sound:true,music:true,shake:true,vibe:true,calm:matchMedia('(prefers-reduced-motion: reduce)').matches},saved);
export const saveSettings=()=>{try{localStorage.setItem('ec.settings',JSON.stringify(settings))}catch{}};
export const maxInk=()=>CFG.ink*(1+.1*((G.buffs&&G.buffs.ink)||0));
export const best=()=>{try{return+localStorage.getItem('ec.best')||0}catch{return 0}};
export const setBest=n=>{try{localStorage.setItem('ec.best',n)}catch{}};
