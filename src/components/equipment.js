import {labConfig as c} from '../data/labConfig.js';
export const beaker=(b,filled=false,tube=false)=>`<svg viewBox="0 0 140 150" role="img" aria-label="Beaker ${b.id}, ${b.sugarPercent}% sugar${tube?', tube inside':''}"><path d="M25 15V125Q25 138 38 138H102Q115 138 115 125V15" fill="#edf8f8" stroke="#416974" stroke-width="3"/>${filled?'<path d="M28 63H112V123Q112 135 100 135H40Q28 135 28 123Z" fill="#b0dce0"/>':''}${[40,60,80,100].map(y=>`<path d="M28 ${y}h12" stroke="#416974"/>`).join('')}${tube?'<rect x="58" y="70" width="24" height="55" rx="10" fill="#ffe2ac" stroke="#916d34"/>':''}<text x="70" y="48" text-anchor="middle" fill="#163e46" font-size="22">${b.id}</text></svg>`;
export const tube=id=>`<svg viewBox="0 0 90 140" role="img" aria-label="Dialysis tube ${id}"><path d="M32 12H58L54 25Q70 55 60 116L54 126H36L30 116Q20 55 36 25Z" fill="#ffe7b8" stroke="#96774a" stroke-width="2"/><path d="M31 20H59M31 123H59" stroke="#416974" stroke-width="4"/><text x="45" y="80" text-anchor="middle" font-size="23" fill="#163e46">${id}</text></svg>`;
export const balance=(mass,label)=>`<div class="balance"><div class="pan"></div><div class="readout">${mass.toFixed(2)} <small>g</small></div><span>${label}</span></div>`;
export function graph(tubes){const max=Math.max(1,...tubes.map(t=>Math.abs(t.finalMass-t.initialMass)));const scale=90/max;const ys=v=>150-v*scale;return `<svg class="graph" viewBox="0 0 640 310" role="img" aria-label="Bar graph of mass change in grams against external sugar concentration. Exact values appear in the table."><text x="10" y="20">Change in mass (g)</text>${[-max,-max/2,0,max/2,max].map(v=>`<line x1="55" x2="610" y1="${ys(v)}" y2="${ys(v)}" stroke="#d4e0e2"/><text x="25" y="${ys(v)+5}">${v.toFixed(2)}</text>`).join('')}${tubes.map((t,i)=>{const d=Number((t.finalMass-t.initialMass).toFixed(2)),x=85+i*105;return `<rect x="${x}" y="${Math.min(150,ys(d))}" width="55" height="${Math.max(1,Math.abs(d)*scale)}" fill="${d>=0?'#267c87':'#b16f40'}"/><text x="${x+27}" y="${d>=0?ys(d)-10:ys(d)+20}" text-anchor="middle">${d>0?'+':''}${d} g</text><text x="${x+27}" y="270" text-anchor="middle">${t.id} · ${c.beakers.find(b=>b.id===t.id).sugarPercent}%</text>`}).join('')}<text x="320" y="300" text-anchor="middle">External sugar concentration (% w/v)</text></svg>`;}

export function waterMovement(tube,outside){
 const inward=outside<tube.sugarPercent;
 const outward=outside>tube.sugarPercent;
 const direction=inward?'More water enters the tube':outward?'More water leaves the tube':'Water moves both ways at similar rates';
 const sugar=(concentration,start)=>Array.from({length:Math.round(concentration/2.5)},(_,index)=>{
  const x=start+(index%3)*48;
  const y=74+Math.floor(index/3)*105;
  return `<rect x="${x}" y="${y}" width="17" height="17" rx="4" fill="#b88c54" stroke="#785b39"/>`;
 }).join('');
 return `<svg class="water-movement" data-direction="${inward?'in':outward?'out':'balanced'}" viewBox="0 0 600 285" role="img" aria-label="Tube ${tube.id}. Outside ${outside}% sugar, inside ${tube.sugarPercent}%. ${direction}.">
 <defs><linearGradient id="osmosis-water"><stop stop-color="#d8eef0"/><stop offset=".5" stop-color="#f2fbfc"/><stop offset="1" stop-color="#b8d8df"/></linearGradient></defs>
 <rect x="14" y="34" width="572" height="218" rx="22" fill="url(#osmosis-water)" stroke="#729da5" stroke-width="2"/>
 <path d="M300 34V252" stroke="#c6a368" stroke-width="18"/><path d="M300 34V252" stroke="#f3dfb3" stroke-width="7" stroke-dasharray="12 9"/>
 <text x="35" y="24" font-size="18" fill="#234852">Outside the tube</text><text x="345" y="24" font-size="18" fill="#234852">Inside the tube</text>
 ${sugar(outside,40)}${sugar(tube.sugarPercent,390)}
 <g fill="none" stroke="#236e8b" stroke-linecap="round"><path d="M150 113H455m-19-14 19 14-19 14" stroke-width="${inward?10:4}"/><path d="M450 167H145m19-14-19 14 19 14" stroke-width="${outward?10:4}"/></g>
 <g class="water-in" fill="#4c96bf"><circle cx="196" cy="113" r="8"/><circle cx="250" cy="113" r="6"/></g>
 <g class="water-out" fill="#4c96bf"><circle cx="405" cy="167" r="8"/><circle cx="355" cy="167" r="6"/></g>
 <text x="36" y="232" font-size="16" fill="#234852">${outside}% sugar</text><text x="390" y="232" font-size="16" fill="#234852">${tube.sugarPercent}% sugar</text>
 <text x="300" y="278" text-anchor="middle" font-size="15" fill="#234852">Water crosses the membrane. Sugar stays on its side.</text></svg>`;
}
