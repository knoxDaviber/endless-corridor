export const CFG={ink:2,R:.055,learn:3,sim:.17,hp:5,autoDelay:500,idle:500,skillCd:8000,regen:.15,echoDelay:500,minLen:.2,critAt:.95,perfAt:.8,goodAt:.45,critMult:2,pityAfter:2,pityRange:.15};
export const BUFFS={mirror:['Mirror','Reflect your drawing across the centerline. Free.'],kaleido:['Kaleidoscope','Four symmetric copies of your drawing. Ink for the original only.'],slot:['Extra Skill Slot','Hold 4 learned skills instead of 3.'],echo:['Echo','After each cast, repeat it once at half effect on survivors. Free.'],heal:['Full Heal','Restore all hearts. Repeatable.'],ink:['Extra Ink','+10% ink budget. Repeatable.'],regen:['Ink Regen','+10% ink regeneration while drawing. Repeatable.']};
export const REP={heal:1,ink:1,regen:1};
export const ADJ=['Ember','Gale','Thorn','Wisp','Rune','Frost','Spark','Dusk'];
// Spell power: level 1-5 from cast counts; each level adds +15% power and bigger visuals.
export const LEVELS=[0,5,15,30,50];
export const levelOf=n=>LEVELS.filter(t=>n>=t).length;
export const power=l=>1+.15*(l-1);
const ci=Array.from({length:40},(_,i)=>[.5+.5*Math.cos(i/39*6.283),.5+.5*Math.sin(i/39*6.283)]);
const half=ci.map(p=>[.5+(p[0]-.5)*.5,.5+(p[1]-.5)*.5]);
// i = icon strokes for the spellbook. need = max ink required.
export const SPELLS=[
 {k:'bolt',n:'Lightning',d:'ONE zigzag stroke (Z). Strikes what it crosses. From Lv3 it also chains to other foes.',c:'#fff6a8',i:[[[0,0],[1,0],[0,1],[1,1]]]},
 {k:'nova',n:'Shield',d:'Circle + a line grants a blue shield (max 2, Lv4+ max 3).',c:'#5bb8ff',i:[ci,[[0,.5],[1,.5]]]},
 {k:'beam',n:'Twin Beam',d:'Two parallel lines pierce the whole board.',c:'#ffe27a',i:[[[0,.3],[1,.3]],[[0,.7],[1,.7]]]},
 {k:'meteor',n:'Meteor',d:'Cross two lines. Explodes, then leaves burning ground that keeps damaging foes.',c:'#ff9a3c',i:[[[0,0],[1,1]],[[1,0],[0,1]]]},
 {k:'storm',n:'Tempest',d:'3 long parallel lines: lightning rain on every foe.',c:'#9fd0ff',need:2.4,i:[[[0,.2],[1,.2]],[[0,.5],[1,.5]],[[0,.8],[1,.8]]]},
 {k:'sun',n:'Supernova',d:'Two nested circles: board-wide blast.',c:'#fff3b0',need:3,i:[ci,half]},
 {k:'frost',n:'Frost',d:'ONE big circle. Freezes foes inside it so they stop advancing, plus a little damage. Longer freeze each level.',c:'#9fe8ff',i:[ci]},
 {k:'quake',n:'Quake',d:'Draw a T (one line standing on another). Shakes foes along both lines: damage and pushes them back.',c:'#c9a27a',i:[[[0,.2],[1,.2]],[[.5,.2],[.5,1]]]}];
export const SHCOL={circle:'#e9b44c',triangle:'#6fc3a0',diamond:'#e07a9b',hex:'#7aa6e0',square:'#c9a0e8',pill:'#d1603d',shield:'#e0906a',star:'#a064d0',octagon:'#c0527a',cross:'#52b0b0'};
