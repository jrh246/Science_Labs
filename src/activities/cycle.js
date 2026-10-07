import '../preview.js';
import '../library.css';
import './cycle.css';
import {site} from '../site.js';
import {cards,zones,validPlacements,evaluateCycle} from './cycle-model.js';

const app=document.querySelector('#app');
const key=`science-labs:${site.root.pathname}:matter-cycle:v2`;
let placements={},selected=null,checked=false,message='',warning='',destination='resp-energy';
try{const state=JSON.parse(localStorage.getItem(key)||'{}');placements=validPlacements(state.placements);checked=state.checked===true;}catch{warning='Saved practice could not be restored. You can still use this activity.';}
const save=()=>{try{localStorage.setItem(key,JSON.stringify({placements,checked}));}catch{warning='Saving is unavailable. Keep this page open while working.';}};
function illustration(c){
  const colors={C:'#535f70',H:'#388ac1',O:'#df595b'};
  let drawing='';
  if(c.type==='glucose')drawing=Array.from({length:24},(_,i)=>{const atom=i<6?'C':i<12?'O':'H';return `<circle cx="${27+(i%6)*13}" cy="${7+Math.floor(i/6)*13}" r="6" fill="${colors[atom]}"/><text x="${27+(i%6)*13}" y="${9+Math.floor(i/6)*13}" text-anchor="middle" fill="white" font-size="6">${atom}</text>`;}).join('');
  else if(c.drawing)drawing=c.drawing.map((atom,i)=>`<circle cx="${60+(i-(c.drawing.length-1)/2)*16}" cy="27" r="9" fill="${colors[atom]}"/><text x="${60+(i-(c.drawing.length-1)/2)*16}" y="30" text-anchor="middle" fill="white" font-size="9" font-weight="bold">${atom}</text>`).join('');
  else if(c.type==='light')drawing='<g stroke="#e2a129" stroke-width="3"><path d="M60 2v8m0 34v8M34 27h8m36 0h8M41 8l6 6m26 26 6 6M41 46l6-6M73 14l6-6"/></g><circle cx="60" cy="27" r="13" fill="#ffd14b"/>';
  else if(c.type==='chlorophyll')drawing='<ellipse cx="60" cy="27" rx="39" ry="21" fill="#c9eaa2" stroke="#4b8857" stroke-width="2"/><path d="M35 20h15m-15 6h15m-15 6h15m17-12h15m-15 6h15m-15 6h15" stroke="#3b8650" stroke-width="4"/>';
  else if(c.type==='mitochondrion')drawing='<ellipse cx="60" cy="27" rx="40" ry="21" fill="#f3d7a9" stroke="#af6944" stroke-width="2"/><path d="M29 30q4-35 12 0t12 0t12 0t12 0t12 0" fill="none" stroke="#af6944" stroke-width="3"/>';
  else if(c.type==='atp')drawing='<rect x="29" y="10" width="62" height="34" rx="4" fill="#d6eee4" stroke="#318064" stroke-width="3"/><path d="M94 20v14" stroke="#318064" stroke-width="5"/><path d="M41 17v20m18-20v20m18-20v20" stroke="#318064" stroke-width="11"/>';
  else drawing='<path d="M36 48q-14-12 0-24t0-22M60 48q-14-12 0-24t0-22M84 48q-14-12 0-24t0-22" fill="none" stroke="#e17d43" stroke-width="4"/>';
  return `<svg viewBox="0 0 120 54" aria-hidden="true">${drawing}</svg>`;
}
function cardMarkup(c){return `<button type="button" class="molecule-card ${c.atoms?'molecule-token':''} ${selected===c.id?'selected':''}" draggable="true" data-card="${c.id}" aria-pressed="${selected===c.id}" aria-label="${c.label}, ${c.name}${c.atoms?', molecule '+c.id.split('-')[1]:''}"><strong>${c.label}</strong>${illustration(c)}<span>${c.name}</span></button>`;}
function bankMarkup(){
  const available=cards.filter(c=>!placements[c.id]);
  return [...new Set(cards.map(c=>c.type))].map(type=>{
    const remaining=available.filter(c=>c.type===type);
    return remaining.length?`<div class="supply">${cardMarkup(remaining[0])}<span class="supply-count">${remaining.length} ${remaining[0].atoms?'molecules':'symbol'} left</span></div>`:'';
  }).join('');
}
function zoneMarkup(id){
  const z=zones.find(z=>z.id===id);const result=evaluateCycle(placements).zones.find(z=>z.id===id);
  return `<section class="drop-zone ${id} ${checked?(result.correct?'correct':'revise'):''}" data-zone="${id}" aria-label="${z.label}">${id==='photo-help'||id==='resp-place'?`<span class="process-arrow" role="img" aria-label="${id==='photo-help'?'Photosynthesis proceeds to the right':'Respiration proceeds to the left'}">${id==='photo-help'?'⟶':'⟵'}</span>`:''}<button type="button" class="place-button" data-place="${id}" aria-label="Place selected card in ${z.label}">${z.label}<span aria-hidden="true"> ＋</span></button><div class="placed-cards">${cards.filter(c=>placements[c.id]===id).map(cardMarkup).join('')||'<span class="empty-slot">Drop cards here</span>'}</div><p class="molecule-tally">${Object.entries(cards.filter(c=>placements[c.id]===id&&c.atoms).reduce((counts,c)=>({...counts,[c.label]:(counts[c.label]||0)+1}),{})).map(([formula,count])=>`${count} ${formula}`).join(' + ')}</p>${checked?`<span class="zone-feedback">${result.correct?'✓ Correct':'Revisit this group'}</span>`:''}</section>`;
}
function render(focus){
  const result=evaluateCycle(placements);const current=cards.find(c=>c.id===selected);
  app.innerHTML=`<a class="skip-link" href="#activity">Skip to activity</a><header class="site-header"><a class="brand" href="./#/">Science Labs</a><a href="./#/science/biology/the-cell/light-photosynthesis">← Activity & lab choices</a><form class="header-search" role="search"><label class="sr-only" for="search">Search library</label><input id="search" name="q" type="search" placeholder="Search the library"><button>Search</button></form></header>
  <main id="activity" class="cycle-main"><p class="eyebrow">BIOLOGY / CARD ACTIVITY</p><h1>Matter cycles. Energy flows.</h1><p class="activity-intro">Build the connection between photosynthesis and cellular respiration. Move individual molecules into the circle to balance both equations. Drag, or select an item and use the destination bar at the bottom of your screen.</p>
  <div class="activity-toolbar"><p id="selection" role="status">${message|| (current?`Selected: ${current.label}. Choose a destination.`:'Select a card to begin. Tab and Enter also work.')}</p><button data-action="check">Check my model</button><button data-action="reset" class="secondary">Start over</button></div>
  ${warning?`<p>${warning}</p>`:''}
  <div class="cycle-layout"><aside class="bank" data-zone="bank" aria-label="Card bank"><h2>Your cards <span>${cards.filter(c=>!placements[c.id]).length} left</span></h2><p>Each picture moves ONE molecule. Choose repeatedly from a supply to add more. Balance the inputs and outputs in both halves.</p><button data-place="bank" class="secondary">Return selected card to bank</button><div class="bank-cards">${bankMarkup()}</div><p class="small">Move a placed card again by selecting or dragging it. Identical copies are interchangeable.</p></aside>
  <section class="model-area" aria-label="Circular model of photosynthesis and cellular respiration"><div class="cycle-circle">
  <span class="cycle-arrow right" aria-hidden="true">↓</span><span class="cycle-arrow left" aria-hidden="true">↑</span>
  <section class="half photo-half" aria-labelledby="photo-title"><h2 id="photo-title">Photosynthesis</h2><p class="half-direction">Inputs → Outputs</p><div class="half-grid">${zoneMarkup('photo-in')}${zoneMarkup('photo-help')}${zoneMarkup('photo-out')}</div></section>
  <div class="cycle-divider"><span>Matter is reused</span></div>
  <section class="half resp-half" aria-labelledby="resp-title"><h2 id="resp-title">Cellular respiration</h2><p class="half-direction">Outputs ← Inputs</p><div class="half-grid">${zoneMarkup('resp-out')}${zoneMarkup('resp-place')}${zoneMarkup('resp-in')}</div></section></div>
  <div class="energy-exit"><span aria-hidden="true">↓</span>${zoneMarkup('resp-energy')}<p>Energy is transferred and eventually dissipated as heat; it does not cycle like matter.</p></div></section></div>
  <section id="model-feedback" class="model-feedback" aria-live="polite">${checked?`<h2>${result.complete?'Your cycle is complete!':'Keep building your model'}</h2><p>${result.zones.filter(z=>z.correct).length} of 7 groups are correct. ${result.complete?'The outputs of each process can supply the inputs of the other.':'Check inputs versus outputs and the roles of the symbols. Check both the molecule types and how many you placed. One molecule of each is not enough.'}</p><div class="atom-counts">${['photo','resp'].map(mode=>`<p><strong>${mode==='photo'?'Photosynthesis':'Respiration'} atom counts (C, H, O)</strong><br>Inputs: ${result.zones.find(z=>z.id===mode+'-in').atoms.join(', ')}<br>Outputs: ${result.zones.find(z=>z.id===mode+'-out').atoms.join(', ')}</p>`).join('')}</div><p>Each completed equation has 6 carbon, 12 hydrogen, and 18 oxygen atoms on each side. Correct direction and symbol placement matter too.</p>`:''}</section>
  <details class="activity-notes"><summary>Hints, paper cutouts, and model notes</summary><p>Start with what plants use to make sugar. Connect the sugar and oxygen produced to aerobic respiration. Then identify the molecules that can return to photosynthesis.</p><p>Light and chlorophyll belong with light absorption. Respiration begins in the cytoplasm; most later stages in plant and animal cells occur in mitochondria. Plants respire too. This is aerobic respiration, not fermentation.</p><p>ATP is a molecule, but its card is an energy-transfer annotation here. ADP and phosphate are omitted, and one card does not specify the number of ATP molecules made. Count the atoms in every individual molecule in the matter equations. Glucose art is an atom inventory, not a structural drawing. These overall equations do not show reaction stages or suggest that one process simply runs the other backward.</p><p>Paper option: use two molecule sets to display both halves at once, or reuse one set as you switch processes.</p><p><a href="./resources/light-photosynthesis-worksheet.pdf" download>Photosynthesis worksheet and cutouts (PDF)</a> · <a href="./resources/yeast-fermentation-worksheet.pdf" download>Respiration companion cutouts (PDF)</a></p><p>OpenStax Biology 2e, chapters 7 and 8. Practice saves on this device, separately from the virtual lab. No grade is submitted.</p></details></main>${current?`<div class="move-dock" aria-label="Move selected item"><div><strong>${current.label} selected</strong><span>${current.atoms?'One molecule':'One symbol'} · choose any destination without dragging</span></div><div class="destination-control"><label for="move-destination">Destination</label><select id="move-destination">${[...zones,{id:'bank',label:'Return to supply'}].map(z=>`<option value="${z.id}" ${destination===z.id?'selected':''}>${z.label}</option>`).join('')}</select></div><button data-action="move">Move here</button><button data-action="cancel" class="secondary">Cancel</button></div>`:''}`;
  if(focus)app.querySelector(focus)?.focus({preventScroll:true});
}
function place(zone){
  if(!selected){message='Select a card first, then choose where to place it.';render(`[data-place="${zone}"]`);return;}
  const card=cards.find(c=>c.id===selected);
  if(zone==='bank')delete placements[selected];else placements[selected]=zone;
  message=`${card.label} moved to ${zone==='bank'?'the card bank':zones.find(z=>z.id===zone).label}.`;
  selected=null;checked=false;save();render();
}
app.addEventListener('click',e=>{
  const card=e.target.closest('[data-card]');if(card){selected=card.dataset.card;message='';render(`[data-card="${selected}"]`);return;}
  const placeButton=e.target.closest('[data-place]');if(placeButton){place(placeButton.dataset.place);return;}
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(action==='move'){place(destination);return;}
  if(action==='cancel'){selected=null;message='Selection cleared.';render();return;}
  if(action==='check'){checked=true;message=evaluateCycle(placements).complete?'Your cycle is complete!':'Model checked. Review the feedback below the circle.';save();render('[data-action="check"]');}
  if(action==='reset'&&confirm('Clear this card activity and return all cards to the bank?')){placements={};checked=false;selected=null;message='All cards returned to the bank.';save();render('[data-action="reset"]');}
});
app.addEventListener('change',e=>{if(e.target.id==='move-destination')destination=e.target.value;});
let dragY=null,scrollFrame=null;
function stopDragScroll(){cancelAnimationFrame(scrollFrame);scrollFrame=null;dragY=null;}
function dragScroll(){if(dragY!==null){const edge=80;const speed=dragY<edge?-14:dragY>innerHeight-edge?14:0;if(speed)window.scrollBy(0,speed);scrollFrame=requestAnimationFrame(dragScroll);}}
app.addEventListener('dragend',stopDragScroll);
app.addEventListener('dragstart',e=>{const card=e.target.closest('[data-card]');if(!card)return;selected=card.dataset.card;e.dataTransfer.setData('text/plain',selected);e.dataTransfer.effectAllowed='move';card.classList.add('selected');stopDragScroll();dragY=e.clientY;dragScroll();});
app.addEventListener('dragover',e=>{dragY=e.clientY;if(e.target.closest('[data-zone]')){e.preventDefault();e.dataTransfer.dropEffect='move';}});
app.addEventListener('drop',e=>{stopDragScroll();const target=e.target.closest('[data-zone]');if(!target)return;e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(!cards.some(c=>c.id===id))return;selected=id;place(target.dataset.zone);});
app.addEventListener('submit',e=>{e.preventDefault();const query=new FormData(e.target).get('q');location.href='./#/search?q='+encodeURIComponent(query||'');});
render();
if('serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'}).catch(()=>{});
