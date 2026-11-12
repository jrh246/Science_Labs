import {coding,template,codons,carriers} from './genetics-model.js';
import {polymeraseGeometry} from './genetics-geometry.js';
const colors={A:'#dba969',T:'#799bb7',U:'#799bb7',G:'#93b590',C:'#b69ac1'};
const defs=id=>`<defs><radialGradient id="${id}-green" cx=".3" cy=".22"><stop stop-color="#c5dac0"/><stop offset=".55" stop-color="#759e83"/><stop offset="1" stop-color="#355b4b"/></radialGradient><radialGradient id="${id}-purple" cx=".3" cy=".22"><stop stop-color="#d3c9e1"/><stop offset=".5" stop-color="#9c8cb4"/><stop offset="1" stop-color="#635377"/></radialGradient><radialGradient id="${id}-cell" cx=".35" cy=".3"><stop stop-color="#f2ead3"/><stop offset="1" stop-color="#d1d8bb"/></radialGradient><filter id="${id}-shadow" x="-.4" y="-.4" width="1.8" height="1.8"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#223f36" flood-opacity=".15"/></filter></defs>`;
const svg=(body,id,view='0 0 680 320')=>`<svg viewBox="${view}" aria-hidden="true" focusable="false">${defs(id)}${body}</svg>`;
export function cellArt(phase,exported=false){
 const cyto=phase>=4;
 return svg(`<path d="M77 52C156-5 398 8 459 83S482 246 392 286 141 310 68 247 17 100 77 52Z" fill="url(#cell-cell)" stroke="#a6b4a0" stroke-width="5"/><path d="M79 62C155 4 392 20 450 89S469 237 386 276 148 299 78 239 29 104 79 62Z" fill="none" stroke="#fffbe9" stroke-width="3"/>${Array.from({length:48},(_,i)=>`<circle cx="${55+(i*79)%365}" cy="${57+(i*43)%210}" r="${1+i%3}" fill="#869d75" opacity=".22"/>`).join('')}
 <g opacity=".65" fill="none" stroke="#abb89c" stroke-width="8"><path d="M271 71q67-14 106 20m-104 3q63-15 104 23m-102 2q58-8 89 26"/><path d="M294 224q54 8 73-32m-79 47q73 13 96-40"/></g>
 <g fill="#be9d76" stroke="#8e8565" stroke-width="2"><ellipse cx="114" cy="251" rx="42" ry="17" transform="rotate(15 114 251)"/><ellipse cx="399" cy="163" rx="36" ry="16" transform="rotate(-48 399 163)"/></g><path d="M81 243l15 13 10-13 15 18 10-12 14 13M380 184l-2-18 15 3-2-18 14 1" fill="none" stroke="#ede1bf" stroke-width="3"/>
 <ellipse cx="190" cy="143" rx="92" ry="86" fill="${cyto?'#c9c1d6':'#c6b5d8'}" stroke="${cyto?'#978aa7':'#765c94'}" stroke-width="7"/><ellipse cx="190" cy="143" rx="83" ry="77" fill="none" stroke="#e7deef" stroke-width="3"/>
 <path d="M139 110q21-31 43 4t34 12 31 22m-108 9q27 35 42-2t48 31m-69-88q-20 16 10 38t-10 54" fill="none" stroke="#89719f" stroke-width="5" opacity=".6"/><circle cx="210" cy="113" r="21" fill="#9e87ad" opacity=".7"/>
 <g transform="translate(273 151) rotate(20)"><rect x="-13" y="-20" width="26" height="40" rx="11" fill="#ede2b9" stroke="#927747" stroke-width="3"/><path d="M-10-8h20m-20 16h20" stroke="#9a8455" stroke-width="4"/></g>
 <g transform="translate(332 220)"><path d="M-29-8q-16-25 12-34t40 6 10 28Z" fill="url(#cell-green)"/><path d="M-27-2q22-12 53 0 5 24-23 22t-30-22" fill="url(#cell-purple)"/><path d="M-45-3q22-4 89 0" stroke="#ae7743" stroke-width="4" fill="none"/></g>
 ${exported?'<path class="gi-export-path" d="M251 146Q303 154 328 203" stroke="#b17d44" stroke-width="5" stroke-linecap="round" stroke-dasharray="7 8" fill="none"/>':''}
 <text x="188" y="218" text-anchor="middle">NUCLEUS</text><text x="344" y="68" text-anchor="middle">CYTOPLASM</text><path d="M287 151l49-23" stroke="#7c755c"/><text x="340" y="125">Nuclear pore</text><text x="346" y="268" text-anchor="middle">Ribosome</text>
 <ellipse cx="${cyto?333:190}" cy="${cyto?213:143}" rx="${cyto?65:104}" ry="${cyto?59:98}" fill="none" stroke="#c09343" stroke-width="2" stroke-dasharray="4 6"/>`,'cell','0 0 500 325');
}
export function moleculeIcon(type){
 const id='icon-'+type;
 const shapes={
  helicase:`<path d="M28 25Q53 9 76 29L84 66 57 88 22 71 14 45Z" fill="url(#${id}-purple)"/><ellipse cx="49" cy="48" rx="17" ry="15" fill="#f0f2e5"/><path d="M44 6v84m13-80v78" stroke="#c79658" stroke-width="3"/>`,
  'dna-polymerase':`<path d="M24 20Q44 2 63 21L78 14Q99 38 81 60L71 81Q44 97 18 74L11 48 37 35 43 51 63 50 58 28Z" fill="url(#${id}-green)"/><path d="M15 54l29 8 35-3" stroke="#e8dd9c" stroke-width="5" fill="none"/>`,
  'rna-polymerase':`<path d="M17 29Q25 4 52 19 79 4 88 37L80 75Q50 99 18 76L7 52Z" fill="url(#${id}-purple)"/><path d="M8 57q27-11 79-1m-48 5q6 20 32 29" stroke="#e2b36e" stroke-width="5" fill="none"/>`,
  mrna:'<path d="M12 32q22-30 37 1t37 3M13 54q19-18 30 7t39-4" stroke="#b1824e" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="12" cy="32" r="9" fill="#73a69b"/>',
  dna:'<path d="M29 8q50 22 0 44t0 43M71 8Q21 30 71 52t0 43" stroke="#8c78ab" stroke-width="6" fill="none"/><path d="M29 10h42M36 28h28M30 48h40M35 68h30M29 93h42" stroke="#c5ad72" stroke-width="3"/>',
  cap:`<path d="M16 25Q45 1 78 22L91 56 65 86 24 80 7 49Z" fill="url(#${id}-green)"/><path d="M22 48h52" stroke="#dce8bd" stroke-width="7"/><circle cx="76" cy="79" r="17" fill="#8bc0ad" stroke="#467e6c" stroke-width="2"/><text x="76" y="85" text-anchor="middle" font-size="18">G</text>`,
  splice:`<path d="M17 26Q47 3 79 25L89 58 67 85 24 80 9 52Z" fill="url(#${id}-purple)"/><path d="M23 40q18-24 30 0t25 2M24 60q21 22 45-6" fill="none" stroke="#e1d6e9" stroke-width="5"/>`,
  tail:`<path d="M18 20Q40 2 64 20L83 30 88 63 61 87 22 77 9 45Z" fill="url(#${id}-green)"/><path d="M23 50h53" stroke="#dce8bd" stroke-width="6"/><path d="M65 70l21 18" stroke="#c79d59" stroke-width="5"/><text x="69" y="90" fill="#6d512b" font-size="16">AA</text>`,
  release:`<path d="M35 11q23-4 24 18L51 49l28 11q15 17-8 28L40 68l-15 8-11-24 22-20Z" fill="url(#${id}-green)"/>`
 };
 return svg(`<g filter="url(#${id}-shadow)">${shapes[type]||shapes.dna}</g>`,id,'0 0 100 105');
}
export function trnaArt(t){return svg(`<path d="M28 19v42q0 22 25 23h18V65H52V20" fill="none" stroke="#9bb6ae" stroke-width="11" stroke-linecap="round"/><path d="M28 19v42q0 22 25 23h18V65H52V20" fill="none" stroke="#eff5e7" stroke-width="3"/><circle cx="40" cy="14" r="12" fill="${t.color}" stroke="#fff8df" stroke-width="2"/><path d="M63 66v18m7-18v18m7-15v12" stroke="#816792" stroke-width="3"/>`,'trna-'+t.id,'0 0 100 105');}
const row=(seq,y,color,label)=>`<path d="M60 ${y}H620" stroke="${color}" stroke-width="7" stroke-linecap="round"/>${[...seq].map((b,i)=>`<g transform="translate(${80+i*47} ${y})"><rect x="-17" y="-15" width="34" height="30" rx="8" fill="${colors[b]}" stroke="#ffffff99"/><text y="5" text-anchor="middle" class="gi-base-text">${b}</text></g>`).join('')}<text x="24" y="${y+5}" font-size="14">${label}</text>`;
// Spatial close-up: the enzyme and the changing DNA share one coordinate system.
export function dnaArt(s,motion=null){
 const opening=motion?.kind==='unwind',extending=motion?.kind==='extend',done=s.repBases.length===6&&!extending;
 const frames=Array.from({length:25},(_,i)=>i/24),duration='2.6s';
 const separation=(i,t)=>Math.max(0,Math.min(1,t*14-i));
 const yAt=(side,i,t)=>(side?180:144)+(side?64:-64)*separation(i,t);
 const strandPath=(side,t)=>`M36 ${side?244:80} `+Array.from({length:12},(_,i)=>`L${80+i*47} ${yAt(side,i,t)}`).join(' ')+` L620 ${yAt(side,11,t)}`;
 const animate=(attribute,values,dur=duration)=>`<animate attributeName="${attribute}" values="${values.join(';')}" dur="${dur}" fill="freeze"/>`;
 const base=(b,x,y,extra='')=>`<g transform="translate(${x} ${y})">${extra}<rect x="-17" y="-14" width="34" height="28" rx="8" fill="${colors[b]}" stroke="#ffffffaa"/><text y="5" text-anchor="middle" class="gi-base-text">${b}</text></g>`;
 const original=(seq,side)=>{
  const t=s.opened?1:0;
  return `<path d="${strandPath(side,t)}" stroke="#8d79a8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">${opening?animate('d',frames.map(f=>strandPath(side,f))):''}</path>`+[...seq].map((b,i)=>base(b,80+i*47,yAt(side,i,t),opening?`<animateTransform attributeName="transform" type="translate" values="${frames.map(f=>`${80+i*47} ${yAt(side,i,f)}`).join(';')}" dur="${duration}" fill="freeze"/>`:'')).join('');
 };
 if(done)return svg(`<text x="36" y="25">Daughter 1</text>${row(template,62,'#8d79a8','3′')}${row(coding,99,'#bd9555','5′')}<text x="642" y="67">5′</text><text x="642" y="104">3′</text><text x="36" y="159">Daughter 2</text>${row(template,196,'#bd9555','3′')}${row(coding,233,'#8d79a8','5′')}<text x="642" y="201">5′</text><text x="642" y="238">3′</text><text x="36" y="303">Purple: original DNA · Gold: new DNA</text><text x="36" y="334">Each molecule has one original strand and one new partner.</text>`,'dna','0 0 680 360');
 let body='<text x="28" y="27">DNA REPLICATION · a close-up of the original strands</text>';
 // Keep polymerase around the primer-template junction, behind the visible bases.
 const before=extending?motion.beforeBases:s.repBases.length;
 const {second,x:nextX,y:enzymeY,targetY:chainY,tipX,step,direction}=polymeraseGeometry('dna',before);
 if(s.repEnzyme){
  const fromX=nextX,toX=extending?nextX+direction*step:nextX;
  body+=`<g class="gi-dna-polymerase" transform="translate(${toX} ${enzymeY})">${extending?`<animateTransform attributeName="transform" type="translate" values="${fromX} ${enzymeY};${fromX} ${enzymeY};${toX} ${enzymeY}" keyTimes="0;.65;1" dur="1.4s" fill="freeze"/>`:motion?.kind==='bind'?'<animateTransform attributeName="transform" type="translate" values="80 40;80 102" dur="1.1s" fill="freeze"/>':''}<path d="M-42-25Q-28-48-3-35 27-48 44-21L40 29Q12 45-21 33L-46 14-42-5-24-1-22 13 20 13 24-12-24-12Z" fill="url(#dna-green)" stroke="#426b51" stroke-width="2"/><path d="M-40 21Q0 38 39 19" fill="none" stroke="#d9e6c1" stroke-width="3"/></g>`;
 }
 body+=original(template,0)+original(coding,1);
 if(!s.opened||opening)body+=Array.from({length:12},(_,i)=>`<path d="M${80+i*47} 159v6" stroke="#b0aa91" stroke-width="3" stroke-dasharray="2 2" opacity="1">${opening?`<animate attributeName="opacity" values="1;0" dur=".15s" begin="${i/14*2.6}s" fill="freeze"/>`:''}</path>`).join('');
 body+=`<text x="8" y="85">3′</text><text x="8" y="249">5′</text><text x="642" y="${s.opened?85:149}">5′${opening?animate('y',frames.map(t=>yAt(0,11,t)+5)):''}</text><text x="642" y="${s.opened?249:185}">3′${opening?animate('y',frames.map(t=>yAt(1,11,t)+5)):''}</text>`;
 if(s.opened&&!opening){
  body+='<path d="M36 116H64M613 208H640" stroke="#729b9c" stroke-width="8" stroke-linecap="round"/><text x="28" y="155">Primer</text><text x="596" y="283">Primer</text>';
  for(const [seq,y,reverse,offset] of [[s.repBases.slice(0,3),116,false,0],[s.repBases.slice(3),208,true,3]]){
   const end=reverse?597-(seq.length-1)*47:80+(seq.length-1)*47,start=reverse?637:39;
   if(seq)body+=`<path d="M${start} ${y}H${end}" stroke="#bd9555" stroke-width="7" stroke-linecap="round">${extending&&before>=offset&&before<offset+3?animate('d',[`M${start} ${y}H${seq.length===1?(reverse?613:64):end+(reverse?47:-47)}`,`M${start} ${y}H${end}`],'1.4s'):''}</path>`;
   body+=[...seq].map((b,i)=>{
    const x=reverse?597-i*47:80+i*47,justAdded=extending&&offset+i===before;
    return base(b,x,y,justAdded?`<animateTransform attributeName="transform" type="translate" values="${x} 310;${x} ${y};${x} ${y}" keyTimes="0;.65;1" dur="1.4s" fill="freeze"/>`:'');
   }).join('');
  }
  if(s.repEnzyme)body+=`<text x="340" y="${second?285:58}" text-anchor="middle">DNA polymerase · adds to the new strand’s 3′ end</text><path d="M${Math.min(nextX+35,600)} ${second?260:61}L${nextX} ${second?246:77}" stroke="#53765d" fill="none"/><path d="M${tipX} ${chainY+(second?-18:18)}v${second?-18:18}" stroke="#8a763e"/><text x="${tipX}" y="${chainY+(second?-42:51)}" text-anchor="middle">3′ end</text>`;
 }
 if(s.opened&&!s.repEnzyme){
  body+=`<g class="gi-helicase" transform="translate(628 162)">${opening?'<animateTransform attributeName="transform" type="translate" values="62 162;628 162" dur="2.6s" fill="freeze"/>':''}<path d="M-28-15L-3-31 25-19 32 9 7 31-22 23-33-2Z" fill="url(#dna-purple)" stroke="#66577d" stroke-width="2"/><ellipse rx="12" ry="13" fill="#edf0df"/><path d="M-25-13l18 6m19-15-5 12m23 13-14 1M8 28l-3-13m-25 6 11-11" stroke="#c5b9d7" stroke-width="3"/></g><text x="628" y="${opening?290:112}" text-anchor="middle">Helicase${opening?animate('x',[62,628]):''}</text>`;
 }
 body+='<text x="28" y="328">Purple: original DNA · Gold: new DNA · Teal: supplied primer</text>';
 return svg(body,'dna','0 0 680 360');
}

const anim=(name,values,dur='2.2s',extra='')=>`<animate attributeName="${name}" values="${values}" dur="${dur}" fill="freeze" ${extra}/>`;
const move=(values,dur='2.2s',extra='')=>`<animateTransform attributeName="transform" type="translate" values="${values}" dur="${dur}" fill="freeze" ${extra}/>`;
function enzymeShape(type,id){
 const fill=`url(#${id}-${type==='rna-polymerase'||type==='splice'?'purple':'green'})`;
 if(type==='splice')return `<path d="M-37-15Q-24-43 0-31 23-46 40-16L43 14 21 37-19 33-44 9Z" fill="${fill}" stroke="#766587" stroke-width="2"/><path d="M-29-3q19-23 30 0t28-1M-24 13q20 20 44-4" fill="none" stroke="#ded3e8" stroke-width="4"/>`;
 return `<path d="M-37-21Q-17-43 6-29 30-37 42-11L35 27Q8 45-27 26L-43 1-24-4-18 12 18 12 22-10-20-10Z" fill="${fill}" stroke="#527761" stroke-width="2"/><path d="M-27 22q27 14 57-3" stroke="#e0e7c9" stroke-width="3" fill="none"/>`;
}
function workingEnzyme(type,x,y,id,motion){return `<g class="gi-working-enzyme" transform="translate(${x} ${y})">${motion?move(`${x} ${y-70};${x} ${y};${x} ${y};${x+40} ${y-50}`,'2.2s','keyTimes="0;.25;.75;1"')+anim('opacity','0;1;1;0','2.2s','keyTimes="0;.2;.8;1"'):''}${enzymeShape(type,id)}</g>`;}
function rnaMessage(s,motion=null,id='processing',y=198){
 const splicing=motion?.kind==='splice',capping=motion?.kind==='cap',tailing=motion?.kind==='tail';
 const intron=!s.processing.splice||splicing;
 return `<path d="M80 ${y}H${intron?`275 M395 ${y}H600`:'600'}" stroke="#ae8150" stroke-width="6"/><text x="38" y="${y+5}">5′</text><text x="628" y="${y+5}">3′</text>
 <rect x="100" y="${y-18}" width="170" height="36" rx="9" fill="#cbdcc5"/><text x="185" y="${y+6}" text-anchor="middle" class="gi-seq">AUG GCU</text>
 <rect x="400" y="${y-18}" width="180" height="36" rx="9" fill="#cbdcc5"/><text x="490" y="${y+6}" text-anchor="middle" class="gi-seq">UUU UAA</text>
 ${intron?`<g class="gi-intron" transform="translate(0 0)">${splicing?move('0 0;0 0;0 -75','2.2s','keyTimes="0;.5;1"')+anim('opacity','1;1;0','2.2s','keyTimes="0;.7;1"'):''}<path d="M275 ${y}q25-110 65-72t55 72" fill="none" stroke="#a18bb5" stroke-width="12"/><text x="338" y="${y-102}" text-anchor="middle">Intron</text></g>`:`<text x="337" y="${y-30}" text-anchor="middle">Exons joined</text>`}
 ${s.processing.splice?`<path d="M270 ${y}H400" stroke="#79a184" stroke-width="9" stroke-linecap="round" ${splicing?'stroke-dasharray="130" stroke-dashoffset="130"':''}>${splicing?anim('stroke-dashoffset','130;130;0','2.2s','keyTimes="0;.6;1"'):''}</path>`:''}
 <text x="180" y="${y+52}" text-anchor="middle">Exon · kept</text><text x="489" y="${y+52}" text-anchor="middle">Exon · kept</text>
 ${s.processing.cap?`<g class="gi-rna-cap" transform="translate(80 ${y})">${capping?move(`80 ${y-80};80 ${y};80 ${y}`,'2.2s','keyTimes="0;.65;1"'):''}<circle r="19" fill="#73a99a" stroke="#4c8073" stroke-width="2"/><text y="6" text-anchor="middle">G</text></g><text x="80" y="${y+83}" text-anchor="middle">5′ cap</text>`:''}
 ${s.processing.tail?`<g class="gi-poly-a-tail"><path d="M600 ${y}q35 18 13 55h-84" fill="none" stroke="#c29a62" stroke-width="5"/>${Array.from({length:5},(_,i)=>`<g opacity="1">${tailing?anim('opacity','0;0;1','2.2s',`keyTimes="0;${.3+i*.1};1"`):''}<circle cx="${607-i*19}" cy="${y+55}" r="9" fill="#e4bf85"/><text x="${607-i*19}" y="${y+59}" text-anchor="middle" font-size="10">A</text></g>`).join('')}<text x="555" y="${y+88}" text-anchor="middle">A tail</text></g>`:''}
 ${capping?workingEnzyme('cap',80,y-15,id,true):splicing?workingEnzyme('splice',338,y-55,id,true):tailing?workingEnzyme('tail',602,y+10,id,true):''}`;
}
export function transcriptArt(s,motion=null){
 if(s.phase===3)return processingArt(s,motion);
 const id='rna',full=s.rnaFinished,n=s.rnaBases.length,adding=motion?.kind==='rna-extend',before=adding?motion.beforeBases:n;
 const dnaRow=(seq,y,prime)=>`<path d="M130 ${y}H620" stroke="#8d79a8" stroke-width="6"/><text x="107" y="${y+5}">${prime}</text>${[...seq].map((b,i)=>`<rect x="${134+i*39}" y="${y-14}" width="32" height="28" rx="7" fill="${colors[b]}"/><text x="${150+i*39}" y="${y+5}" text-anchor="middle" class="gi-base-text">${b}</text>`).join('')}`;
 const dnaRows=`${dnaRow(coding,52,'5′')}${dnaRow(template,88,'3′')}<text x="642" y="57">3′</text><text x="642" y="93">5′</text>`;
 if(full)return svg(`<text x="28" y="25">DNA stays in the nucleus</text>${dnaRows}${rnaMessage(s,null,id,218)}${motion?.kind==='rna-finish'?`<g transform="translate(250 120)">${move('250 120;570 120;640 80','2.2s')+anim('opacity','1;1;0','2.2s')}${enzymeShape('rna-polymerase',id)}</g>`:''}` ,id,'0 0 680 360');
 const x=polymeraseGeometry('rna',before).x,nextX=polymeraseGeometry('rna',n).x;
 let body=`<text x="28" y="25">TRANSCRIPTION · DNA guides an RNA copy</text><rect x="44" y="37" width="70" height="69" rx="12" fill="#e6cf8d55" stroke="#b89b56" stroke-dasharray="3 4"/><text x="78" y="127" text-anchor="middle">Promoter</text>`;
 if(s.transEnzyme){
  body+=`<g class="gi-rna-polymerase" transform="translate(${nextX} 120)">${motion?.kind==='rna-bind'?move('76 10;76 77;150 120','1.6s','keyTimes="0;.5;1"'):adding?move(`${x} 120;${x} 120;${nextX} 120`,'1.6s','keyTimes="0;.65;1"'):''}${enzymeShape('rna-polymerase',id)}</g><text x="400" y="135" text-anchor="middle">RNA polymerase</text>`;
  body+=dnaRows;
  body+=`<path d="M130 154H${n?150+(n-1)*39:138}" stroke="#ba8c52" stroke-width="6"/><text x="105" y="159">5′</text>`;
  body+=[...s.rnaBases].map((b,i)=>`<g transform="translate(${150+i*39} 154)">${adding&&i===before?move(`${150+i*39} 285;${150+i*39} 154;${150+i*39} 154`,'1.6s','keyTimes="0;.65;1"'):''}<rect x="-16" y="-14" width="32" height="28" rx="7" fill="${colors[b]}"/><text y="5" text-anchor="middle" class="gi-base-text">${b}</text></g>`).join('');
  body+=`<text x="${Math.max(150,130+n*39)}" y="211" text-anchor="middle">Growing RNA · 3′ end</text><text x="28" y="308">RNA bases pair with the DNA template: T–A, A–U, C–G, G–C.</text>`;
 }else body+=dnaRows+'<text x="28" y="250">Start at the promoter. Helper proteins are provided by the model.</text>';
 return svg(body,id,'0 0 680 360');
}
function processingArt(s,motion){
 const processingMotion=['cap','splice','tail'].includes(motion?.kind);
 if(Object.values(s.processing).every(Boolean)&&!processingMotion)return exportArt(s,motion);
 return svg(`<text x="28" y="29">RNA PROCESSING · inside the nucleus</text>${rnaMessage(s,motion)}<text x="28" y="337">This short RNA drawing shows parts to keep and a part to remove.</text>`,'processing','0 0 680 360');
}
function exportArt(s,motion){
 const moving=motion?.kind==='export',x=s.exported?490:170;
 return svg(`<rect x="0" y="0" width="340" height="360" fill="#ddd3e43a"/><rect x="340" y="0" width="340" height="360" fill="#dce9d33a"/><text x="50" y="35">NUCLEUS</text><text x="449" y="35">CYTOPLASM</text><path d="M321 50V135m0 100v95M359 50V135m0 100v95" stroke="#a295b3" stroke-width="9"/><g fill="#b29a70" stroke="#867454" stroke-width="2"><rect x="305" y="134" width="70" height="23" rx="9"/><rect x="305" y="216" width="70" height="23" rx="9"/></g><path d="M314 162h52m-52 47h52" stroke="#d6c8a7" stroke-width="5"/><text x="340" y="283" text-anchor="middle">Nuclear pore</text><path d="M340 266v-26" stroke="#817653"/>
 <path d="M80 67q95 15 0 43t0 43M160 67q-95 15 0 43t0 43" stroke="#8d79a8" stroke-width="5" fill="none"/><path d="M80 69h80m-65 20h50m-48 20h46m-56 21h66m-73 22h80" stroke="#bda770" stroke-width="3"/><text x="121" y="177" text-anchor="middle">DNA stays here</text>
 <g class="gi-exported-mrna" transform="translate(${x} 192)">${moving?move('170 192;270 185;420 185;490 192','2.5s','keyTimes="0;.35;.75;1"'):''}<path d="M-70 0q25-30 48 0t47 0 46 0" fill="none" stroke="#b4834e" stroke-width="6"/><circle cx="-70" r="10" fill="#73a99a"/><path d="M69 0l16 16 11-11" fill="none" stroke="#c29a62" stroke-width="4"/></g><text x="${x}" y="245" text-anchor="middle">mRNA message${moving?anim('x','170;490','2.5s'):''}</text><text x="28" y="337">The cap, joined exons, and A tail are part of this prepared message.</text>`,'export','0 0 680 360');
}
function drawnTrna(x,carrier,motion=false){
 return `<g class="gi-delivering-trna" transform="translate(${x} 0)">${motion?move(`${x+55} -50;${x} 0;${x} 0;${x-65} 5`,'2.8s','keyTimes="0;.3;.7;1"')+anim('opacity','0;1;1;0','2.8s','keyTimes="0;.2;.75;1"'):''}<path d="M-22 83v84q0 25 23 26h23v-20H0V83" fill="none" stroke="#91b2a5" stroke-width="10" stroke-linecap="round"/><path d="M-22 83v84q0 25 23 26h23v-20H0V83" fill="none" stroke="#e9f0dc" stroke-width="3"/><text x="12" y="207" text-anchor="middle" font-size="12">${carrier.anticodon}</text><circle cx="-12" cy="72" r="17" fill="${carrier.color}">${motion?anim('opacity','1;1;0;0','2.8s','keyTimes="0;.45;.55;1"'):''}</circle><text x="-12" y="77" text-anchor="middle" font-size="11">${carrier.short}${motion?anim('opacity','1;1;0;0','2.8s','keyTimes="0;.45;.55;1"'):''}</text></g>`;
}
export function ribosomeArt(s,motion=null){
 const delivering=motion?.kind==='deliver',releasing=motion?.kind==='release',loading=motion?.kind==='load';
 const index=Math.min(s.peptide.length,3),x=s.ribosomeLoaded?112+index*139:250,beforeX=delivering?112+motion.beforePeptide*139:x;
 let body='<text x="28" y="27">TRANSLATION · at a ribosome in the cytoplasm</text>';
 // The message is placed into a visible ribosome, rather than into an empty box.
 body+=`<g class="gi-ribosome-body" transform="translate(${x} 0)">${delivering?move(`${beforeX} 0;${beforeX} 0;${x} 0`,'2.8s','keyTimes="0;.75;1"'):loading?move('250 0;112 0','1.8s'):''}<path d="M-80 217Q-102 165-68 141-49 98-15 127 19 102 64 141 105 171 80 217Z" fill="url(#ribo-green)" stroke="#5e806b" stroke-width="2"/><path d="M-69 261Q-39 306 11 294 66 300 80 261Z" fill="url(#ribo-purple)" stroke="#8a769e" stroke-width="2"/><path d="M-63 195q50-31 124 1" stroke="#b6c9a6" stroke-width="5" fill="none"/><text x="0" y="176" text-anchor="middle">Ribosome</text></g>`;
 if(s.ribosomeLoaded){
  body+=`<g class="gi-loaded-message">${loading?anim('opacity','0;1','1.8s'):''}<path d="M43 238H635" stroke="#ac8053" stroke-width="7"/><text x="16" y="244">5′</text><text x="647" y="244">3′</text>${codons.map((c,i)=>`<rect x="${65+i*139}" y="219" width="100" height="38" rx="10" fill="${i===(delivering?motion.beforePeptide:index)&&!s.released?'#f1d68d':'#e0e7d7'}" stroke="#c2ccb9"/><text x="${115+i*139}" y="244" class="gi-seq" text-anchor="middle">${c}</text>`).join('')}</g>`;
 }else body+='<path d="M153 237h194" stroke="#b49a6d" stroke-width="8" stroke-dasharray="5 6"/><text x="465" y="235" text-anchor="middle">mRNA fits in this groove</text>';
 if(delivering)body+=drawnTrna(beforeX,carriers[motion.beforePeptide],true);
 if(s.peptide.length){
  body+=`<g class="gi-peptide-chain" transform="translate(${s.released?210:x-42} 76)">${delivering?move(`${beforeX-42} 76;${beforeX-42} 76;${x-42} 76`,'2.8s','keyTimes="0;.75;1"')+anim('opacity','0;0;1;1','2.8s','keyTimes="0;.5;.6;1"'):releasing?move(`${x-42} 76;${x-42} 76;210 76`,'2.5s','keyTimes="0;.5;1"'):''}${s.peptide.map((aa,i)=>`<g transform="translate(${i*38} ${-i*15})">${i?'<path d="M-25 10L-13 3" stroke="#96886d" stroke-width="4"/>':''}<circle r="20" fill="${carriers[i].color}" stroke="#fff8df" stroke-width="2"/><text y="5" text-anchor="middle" font-size="12">${aa}</text></g>`).join('')}</g>`;
  if(!s.released&&!delivering)body+=`<path d="M${x-42} 96V124q-12 8-8 35" fill="none" stroke="#8cad9d" stroke-width="6"/><text x="${Math.min(580,x+63)}" y="87" text-anchor="middle">Growing chain</text>`;
 }
 if(releasing)body+=`<g class="gi-release-factor" transform="translate(${x} 175)">${move(`${x+50} 70;${x} 175;${x} 175`,'2.5s','keyTimes="0;.4;1"')}${enzymeShape('release','ribo')}</g>`;
 if(s.released)body+='<text x="210" y="128" text-anchor="middle">Released · Met–Ala–Phe</text>';
 body+=`<text x="28" y="337">${s.released?'UAA means stop. It adds no amino acid.':s.ribosomeLoaded?'tRNA brings amino acids. The ribosome links them in the order set by mRNA.':'The model provides the helper proteins that start translation.'}</text>`;
 return svg(body,'ribo','0 0 680 360');
}
