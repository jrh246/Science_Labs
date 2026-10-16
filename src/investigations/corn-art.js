// Original vector artwork; geometry and highlights never change the scored phenotype.
export function cornKernel(type,index=0,prefix='kernel'){
 const id=`${prefix}-${index}`,purple=type===0;
 // Stable variation keeps each kernel's appearance consistent when students tally or mark it.
 let seed=Math.imul(index+1,2654435761)>>>0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const tint=Math.round(random()*10)-5;
 const hue=purple?[`hsl(${286+tint} 30% 66%)`,`hsl(${285+tint} 38% 43%)`,`hsl(${282+tint} 40% 30%)`,'#38203f']:['#ffe675','#f9bc16','#da8d08','#80501a'];
 const top=2+random()*3,left=1+random()*2,right=47+random()*2;
 const crown=20+random()*10,shoulder=12+random()*6,base=23+random()*9;
 const crease=17+random()*12,tilt=(random()-.5)*7;
 const shape=`M${left} 24C${left-1} ${shoulder} ${crown-14} ${top-1} ${crown} ${top}C${crown+14} ${top-1} ${right} ${shoulder-3} ${right} 24C${right+1} 39 ${base+14} 52 ${base} 53C${base-16} 55 ${left-1} 42 ${left} 24Z`;
 return `<svg width="50" height="55" viewBox="0 0 50 55" preserveAspectRatio="none" role="img" aria-label="${purple?'Purple':'Yellow'} kernel"><defs><radialGradient id="${id}" cx="${30+random()*15}%" cy="${22+random()*12}%" r="78%"><stop stop-color="${hue[0]}"/><stop offset=".35" stop-color="${hue[1]}"/><stop offset=".78" stop-color="${hue[2]}"/><stop offset="1" stop-color="${hue[3]}"/></radialGradient></defs><g transform="rotate(${tilt} 25 28)"><path d="${shape}" fill="url(#${id})" stroke="${hue[3]}" stroke-width=".8"/><path d="M10 16Q${crown-4} ${top+3} ${crown+9} ${top+7}M8 22L8 29" fill="none" stroke="${hue[0]}" stroke-width="2" stroke-linecap="round" opacity=".4"/><path d="M${crease} 13Q${crease-5} 23 ${crease-1} ${30+random()*9}M38 19Q43 33 35 44" fill="none" stroke="${hue[3]}" stroke-width="1.2" opacity="${purple?'.42':'.24'}"/><path d="M${crease+2} 15Q${crease-2} 25 ${crease+1} 32M14 43Q23 49 32 45" fill="none" stroke="${hue[0]}" stroke-width=".9" opacity=".25"/></g></svg>`;
}

export function cornEarPreview(index=0,neutral=false){
 const id=`ear-preview-${index}-${neutral?'plain':'color'}`;
 return `<svg viewBox="0 0 180 430" role="img" aria-label="${neutral?'Corn ear with sampling regions':'Genetic corn ear'}"><defs><linearGradient id="${id}"><stop stop-color="#70522e"/><stop offset=".28" stop-color="#dac48c"/><stop offset=".7" stop-color="#b19760"/><stop offset="1" stop-color="#60472b"/></linearGradient></defs><path d="M83 393l-8 32h28l-6-32" fill="#a68d59"/><path d="M90 8C35 10 25 65 27 130L32 348Q34 396 90 404Q146 396 148 348L153 130C155 65 145 10 90 8Z" fill="url(#${id})" stroke="#87683b" stroke-width="2"/>${Array.from({length:144},(_,j)=>{const row=Math.floor(j/6),col=j%6,w=16+Math.min(row,23-row,3)*1.2;const x=90+(col-2.5)*w-w/2,y=22+row*15.5+(col%2)*1.2;const type=neutral?1:(j*17+index*11)%13<3?1:0;return `<g transform="translate(${x} ${y}) scale(${w/50} ${15.8/55})"${neutral?' opacity=".65"':''}>${cornKernel(type,j,id)}</g>`;}).join('')}<path d="M43 360Q17 338 16 276Q4 371 75 410L78 389Q50 380 43 360" fill="#a7a56a"/><path d="M137 360Q163 338 164 276Q176 371 105 410L102 389Q130 380 137 360" fill="#858b50"/><path d="M23 309Q25 375 72 399M157 309Q155 375 108 399" stroke="#d6cd91" fill="none" stroke-width="2"/></svg>`;
}
