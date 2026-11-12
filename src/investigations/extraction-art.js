// Original, stateful vector illustrations. All material changes stay inspectable.
import {modelVisibility} from './extraction-model.js';
function defs(id){return `<defs>
 <linearGradient id="${id}-glass"><stop stop-color="#b1cbd0" stop-opacity=".55"/><stop offset=".16" stop-color="#fff" stop-opacity=".8"/><stop offset=".33" stop-color="#e6f1f1" stop-opacity=".13"/><stop offset=".78" stop-color="#e3eff0" stop-opacity=".18"/><stop offset="1" stop-color="#6c9399" stop-opacity=".55"/></linearGradient>
 <linearGradient id="${id}-wood"><stop stop-color="#62492e"/><stop offset=".25" stop-color="#bc9260"/><stop offset=".56" stop-color="#e1bd84"/><stop offset="1" stop-color="#785233"/></linearGradient>
 <radialGradient id="${id}-fruit" cx=".33" cy=".2" r=".85"><stop stop-color="#fd7d5c"/><stop offset=".35" stop-color="#df3d40"/><stop offset=".78" stop-color="#a91532"/><stop offset="1" stop-color="#610e29"/></radialGradient>
 <linearGradient id="${id}-juice" x2=".8" y2="1"><stop stop-color="#f59a85"/><stop offset=".4" stop-color="#cc5c65"/><stop offset="1" stop-color="#862f48"/></linearGradient>
 <linearGradient id="${id}-paper" x2="1" y2=".7"><stop stop-color="#fffaf0"/><stop offset=".65" stop-color="#e7ddc8"/><stop offset="1" stop-color="#c8bea7"/></linearGradient>
 <linearGradient id="${id}-liquid" x2="0" y2="1"><stop stop-color="#bce3e5" stop-opacity=".5"/><stop offset="1" stop-color="#78afb8" stop-opacity=".7"/></linearGradient>
 <filter id="${id}-shadow" x="-.4" y="-.4" width="1.8" height="1.8"><feDropShadow dx="1" dy="6" stdDeviation="5" flood-color="#233e38" flood-opacity=".2"/></filter>
 </defs>`;}
function berry(id){
 const seeds=Array.from({length:8},(_,row)=>Array.from({length:9-row},(_,col)=>{
 const x=20+row*4.1+col*7.5+(row%2)*1.8,y=32+row*8;
 return `<g transform="translate(${x} ${y}) rotate(${(col-3)*5})"><ellipse rx="1.8" ry="2.8" fill="#74152c" opacity=".65"/><ellipse cy="-.6" rx=".9" ry="1.8" fill="#e5b778"/></g>`;
 }).join('')).join('');
 return `<path d="M12 36C6 12 35 9 49 19C66 6 97 16 92 41C88 63 65 103 52 108C39 111 15 63 12 36Z" fill="url(#${id}-fruit)" stroke="#9d2936" stroke-width=".8"/>${seeds}<path d="M20 29q5-12 20-9" stroke="#ffb09a" stroke-width="3" opacity=".35" fill="none"/><path d="M50 20L28 11l10 13-23 1 22 7 13-7 12 8 22-8-21-2 12-16-20 12 1-15-7 11Z" fill="#50733f"/><path d="M50 19l2-18" stroke="#618241" stroke-width="4"/>`;
}
const wrap=(body,id,view='0 0 110 120')=>`<svg viewBox="${view}" aria-hidden="true" focusable="false">${defs(id)}${body}</svg>`;
export function toolArt(tool,id='tool-'+tool){
 if(tool==='fruit')return wrap(`<g filter="url(#${id}-shadow)">${berry(id)}</g>`,id);
 if(tool==='masher')return wrap(`<g transform="rotate(25 55 60)" filter="url(#${id}-shadow)"><rect x="43" y="5" width="23" height="80" rx="11" fill="url(#${id}-wood)"/><path d="M42 67q-8 8-8 25v15q20 12 40 0V92q0-17-9-25" fill="url(#${id}-wood)"/><path d="M50 14v52m-8 13v22m18-19v24" stroke="#65492c" opacity=".25" fill="none"/></g>`,id);
 if(['filter','used-filter'].includes(tool))return wrap(`<g filter="url(#${id}-shadow)"><path d="M8 30L47 80v32h16V80l39-50" fill="url(#${id}-glass)" stroke="#7c9c9b"/><path d="M14 29L55 77 95 29Z" fill="url(#${id}-paper)"/><ellipse cx="55" cy="29" rx="41" ry="12" fill="#f4ecda" stroke="#b9b29f"/><path d="M14 29l41 48 40-48m-28 10L55 77 40 39" fill="none" stroke="#c8c1ad"/>${tool==='used-filter'?'<ellipse cx="55" cy="30" rx="29" ry="8" fill="#b65762"/><path d="M39 30l7-3 9 7 11-9 7 7" stroke="#dd8b81" stroke-width="4" fill="none"/>':''}</g>`,id);
 if(tool==='salt')return wrap(`<g transform="rotate(-18 55 60)" filter="url(#${id}-shadow)"><path d="M49 10h10l3 69H46Z" fill="#adb9b5" stroke="#788d87"/><ellipse cx="54" cy="86" rx="24" ry="21" fill="url(#${id}-glass)" stroke="#7d9390"/><path d="M35 88q18-33 38 0q-18 12-38 0" fill="#fffdf2"/>${Array.from({length:25},(_,i)=>`<rect x="${39+(i*13)%30}" y="${78+(i*7)%12}" width="2" height="2" fill="#d6d6cf"/>`).join('')}</g>`,id);
 if(['mix','sample'].includes(tool))return wrap(`<path d="M19 10h73l3 96q-35 10-79 0Z" fill="url(#${id}-glass)" stroke="#8fa7a1"/><path d="M20 75q30-12 72 1l1 29q-40 9-75 0Z" fill="url(#${id}-juice)" opacity=".8"/><path d="M19 20h74m-72 5h70" stroke="#6c9490" stroke-width="2"/><path d="M23 30l4 65 10-9m47-53-5 53" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`,id);
 if(tool==='water')return wrap(`<path d="M28 13h52v92q-26 12-52 0V13Z" fill="url(#${id}-glass)" stroke="#819e9e"/><path d="M30 45h48v58q-23 8-48 0Z" fill="url(#${id}-liquid)"/><ellipse cx="54" cy="13" rx="26" ry="5" fill="#dfe9e5" stroke="#819e9e"/>${[30,45,60,75,90].map(y=>`<path d="M29 ${y}h12" stroke="#7d9997"/>`).join('')}<path d="M37 20v79" stroke="#fff" stroke-width="3" opacity=".8"/>`,id);
 return wrap(`<g transform="rotate(24 55 60)" filter="url(#${id}-shadow)"><path d="M44 30h22v52l-7 24-4 8-4-8-7-24Z" fill="url(#${id}-glass)" stroke="#6f9293"/><path d="M49 59h12v25l-6 20-6-20Z" fill="${tool==='soap'?'#dab15a':'#b7dade'}" opacity=".8"/><path d="M42 14q0-12 13-12t13 12v22H42Z" fill="${tool==='soap'?'#b39548':'#465e65'}"/><path d="M46 10v19" stroke="#fff" stroke-width="3" opacity=".25"/></g>`,id);
}
export function bagArt(s,id='sample-bag'){
 const pulp=s.step>=2,wet=s.step>=3,emptied=s.step>=8;
 const chunks=Array.from({length:pulp?23:5},(_,i)=>`<ellipse cx="${42+(i*37)%150}" cy="${pulp?180+(i*17)%55:172+(i*23)%49}" rx="${pulp?5+(i%4)*2:12}" ry="${pulp?3+i%4:13}" fill="${i%3?'#bd4056':'#f08a78'}" opacity=".75"/>`).join('');
 return wrap(`<ellipse cx="120" cy="253" rx="99" ry="12" fill="#254b41" opacity=".1"/><path d="M22 20Q120 10 218 20L226 240Q129 264 15 241Z" fill="url(#${id}-glass)" stroke="#849e9a" stroke-width="1.6"/>
 ${s.step>0?`<g opacity="${emptied?.17:1}">${wet?`<path d="M24 163q84-15 191-1l7 77q-95 22-202 0Z" fill="url(#${id}-juice)" opacity=".72"/><ellipse cx="119" cy="163" rx="94" ry="7" fill="#efa492" opacity=".65"/>`:''}${pulp?chunks:`<g transform="translate(52 132) rotate(-20) scale(.74)">${berry(id)}</g><g transform="translate(106 115) rotate(25) scale(.66)">${berry(id)}</g>${s.passes?chunks:''}`}</g>`:''}
 <path d="M23 30q99-7 193 0m-192 7q95-6 193 0" fill="none" stroke="#65918b" stroke-width="3"/><path d="M30 43l8 172-15 19m180-185-13 164 23 19M39 221l38-25-22 43m103-30 32 32" fill="none" stroke="#fff" stroke-width="2" opacity=".65"/><path d="M34 51l9 116m150-110-5 88" stroke="#fff" stroke-width="6" opacity=".27"/><rect x="67" y="62" width="108" height="40" rx="3" fill="#fafbf2" opacity=".8"/><text x="121" y="79" text-anchor="middle" fill="#4b645c" font-family="sans-serif" font-size="10">FRUIT SAMPLE</text><text x="121" y="93" text-anchor="middle" fill="#61756d" font-family="sans-serif" font-size="10">10 g · strawberry</text>`,id,'0 0 240 270');
}
export function tubeArt(level=0,{id='collection',filtered=true,alcohol=true,blank=false,funnel=false}={}){
 const strands=Array.from({length:[0,3,12,26][level]||0},(_,i)=>{
 const x=65+(i*13)%54,y=147+(i*7)%30;
 return `<path d="M${x} ${y}q${i%2?12:-9} -13 ${i%3-1} -29t${i%2?-5:7} -18" stroke="${i%3?'#fffff3':'#ecebdd'}" stroke-width="${.8+(i%3)*.55}" opacity="${.55+(i%4)*.12}" fill="none"/>`;
 }).join('');
 return wrap(`<ellipse cx="92" cy="274" rx="51" ry="10" fill="#254b41" opacity=".13"/><path d="M53 35v196a39 39 0 0 0 78 0V35" fill="url(#${id}-glass)" stroke="#829d9b" stroke-width="1.5"/>
 ${filtered?`<path d="M56 169h72v62a36 36 0 0 1-72 0Z" fill="${blank?'#d6e3d4':`url(#${id}-juice)`}" opacity=".8"/><ellipse cx="92" cy="169" rx="36" ry="4" fill="${blank?'#edf3e9':'#eca38f'}"/>`:''}
 ${alcohol?`<path d="M56 94h72v75q-36 8-72 0Z" fill="#c6e2e7" opacity=".35"/><ellipse cx="92" cy="94" rx="36" ry="4" fill="#e5f2f0" opacity=".8"/>${level>1?`<ellipse cx="92" cy="166" rx="${25+level*2}" ry="${level*3}" fill="#faf9ec" opacity=".6"/>`:''}${strands}`:''}
 <path d="M61 48v179q0 25 16 29" stroke="#fff" stroke-width="4" opacity=".68" fill="none"/><path d="M122 50v179q0 23-10 27" stroke="#6a9797" opacity=".25" fill="none"/>
 ${[109,139,169,199].map(y=>`<path d="M125 ${y}h-9" stroke="#6d8c88"/>`).join('')}<ellipse cx="92" cy="35" rx="39" ry="6" fill="url(#${id}-glass)" stroke="#7c9895"/>
 ${funnel?`<path d="M24 7l61 65v23h14V72l61-65" fill="url(#${id}-glass)" stroke="#819d94"/><path d="M30 7l62 57 62-57Z" fill="url(#${id}-paper)"/><path d="M55 8l37 56 38-56M30 7l62 57 62-57" stroke="#bcb8a5" fill="none"/>${filtered?'<ellipse cx="92" cy="15" rx="36" ry="6" fill="#b6535a"/>':''}`:''}`,id,'0 0 184 292');
}
export function benchArt(s,effect=null){
 const filtering=s.step===7,level=modelVisibility(s.seed,0,s.elapsed);
 return `<div class="dna-bench" data-effect="${effect?.tool||''}" aria-label="DNA extraction workbench"><div class="dna-backwall"><span>EXTRACTION STATION</span><span>01 / CELL BIOLOGY</span></div><div class="dna-bench-light"></div><div class="dna-mat"><span>PREPARE</span><span>SEPARATE</span></div>
 <button type="button" class="dna-object dna-bag ${s.step===7?'dna-grabbable':''}" data-target="bag" ${s.step===7?'data-tool="sample"':''} aria-label="Sample bag${s.step===7?' — drag to funnel':''}">${bagArt(s)}</button>
 <button type="button" class="dna-object dna-tube" data-target="${filtering?'funnel':'tube'}" aria-label="${filtering?'Filter funnel':'Collection tube'}">${tubeArt(level,{filtered:s.step>=8,alcohol:s.step>=9,funnel:s.step===7,id:'bench-tube'})}</button>
 ${s.step>=8?`<div class="dna-spent-filter">${toolArt('used-filter','spent-filter')}<span>Retained debris</span></div>`:''}
 <span class="dna-object-label dna-bag-label">${s.step>=8?'Emptied sample bag':'Sample bag'}</span><span class="dna-object-label dna-tube-label">${s.step>=9?'Filtrate + alcohol':s.step>=8?'5 mL filtrate':'Collection tube'}</span>
 ${s.step>=9?'<div class="dna-layer-label"><span>Alcohol layer</span><span>Look at the interface</span><span>Fruit filtrate</span></div>':''}
 ${effect&&effect.tool!=='mix'?`<div class="dna-action-visual ${effect.target==='bag'?'over-bag':'over-tube'}" data-ingredient="${effect.tool}" aria-hidden="true"><div>${toolArt(effect.tool,'action-tool')}</div>${['water','soap','salt','sample','alcohol'].includes(effect.tool)?'<i></i>':''}</div>`:''}</div>`;
}
