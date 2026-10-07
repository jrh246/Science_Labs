import {newLeafRun,restoreLeafRun,infiltrate,setLeafLight,advanceLeaf,floating,comparisonReadings} from './leaf-model.js';
import {chart} from './visuals.js';
export const infiltrationLesson=`<section class="panel"><h2>Why do we infiltrate the leaf disks?</h2><p>Leaves contain air spaces. That trapped air can make freshly cut disks float before photosynthesis has produced any oxygen. <strong>Infiltration replaces that air with solution so the disks start at the bottom.</strong></p><ol><li>Put the disks and bicarbonate solution in a <strong>needle-free syringe</strong>. The bicarbonate supplies a source of carbon dioxide. A trace of detergent helps wet the leaf surface.</li><li>Gently push out excess air, cover the syringe tip, and pull back the plunger. The reduced pressure expands trapped gas so it can escape from the leaf spaces.</li><li>Uncover the tip and release the vacuum gently. Solution enters the spaces left by the gas. Repeat as needed until the disks sink; do not crush the leaves.</li><li>Transfer ten sunken disks to a cup of the same solution. Oxygen produced during photosynthesis can accumulate inside them and make them float again.</li></ol><p>In the virtual lab, use <strong>Pull plunger</strong> and <strong>Release vacuum</strong> three times to prepare the disks. Real leaves may need a different number of cycles. You can also start without complete infiltration to explore why preparation matters.</p><p>Floating measures net gas accumulation, not sugar production directly. Respiration continues in both light and darkness.</p></section>`;

class LeafSimulator extends HTMLElement {
 init(config){
  this.config=config;this.r=restoreLeafRun(config.state,config.condition,config.trial,config.seed);this.speed=60;this.running=false;this.note='';
  this.attachShadow({mode:'open'});
  this.shadowRoot.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;this.focusTarget=b.dataset.light!==undefined?`[data-light="${b.dataset.light}"]`:`[data-action="${b.dataset.action}"]`;
   if(b.dataset.light!==undefined){setLeafLight(this.r,b.dataset.light);this.publish();this.render();return;}
   const a=b.dataset.action;
   if(a==='infiltrate')infiltrate(this.r);
   if(a==='start'){this.running=!this.running;this.note='';if(this.running)this.schedule();else this.stop();}
   if(a==='advance')this.advance(2);
   if(a==='finish')this.advance(Math.max(0,20-this.r.ticks/4));
   if(a==='fresh'&&confirm('Replace this trial with fresh disks? Download exploration data first if you want to keep it.')){this.stop();this.r=newLeafRun(config.condition,config.trial,config.seed);this.note='Fresh disks. Infiltrate before starting a controlled trial.';}
   this.publish();this.render();
  });
  this.shadowRoot.addEventListener('input',e=>{if(e.target.id==='intensity'){setLeafLight(this.r,e.target.value);this.publish();this.updateLive();}});
  this.shadowRoot.addEventListener('change',e=>{if(e.target.id==='speed'){this.speed=Number(e.target.value);if(this.running)this.schedule();}});
  this.render();
 }
 disconnectedCallback(){this.stop();}
 stop(){clearInterval(this.timer);this.running=false;}
 schedule(){clearInterval(this.timer);this.timer=setInterval(()=>{if(document.hidden){this.stop();this.note='Paused while this tab was hidden.';this.render();return;}this.advance(.25);this.publish();this.updateLive();},15000/this.speed);}
 advance(minutes){
  if(this.r.vacuum){this.note='Release the syringe vacuum before starting the lamp experiment.';this.stop();return;}
  const before=this.r.ticks;advanceLeaf(this.r,minutes);
  if(before<80&&this.r.ticks>=80){this.stop();this.note='20-minute observation window finished. Resume the timer to explore longer, or choose another trial.';}
  if(this.r.ticks>=480){this.stop();this.note='120 simulated minutes reached. Use fresh disks to start another experiment.';}
 }
 publish(){this.dispatchEvent(new CustomEvent('leaf-update',{bubbles:true,detail:{state:this.r,readings:comparisonReadings(this.r)}}));}
 scene(){
  const r=this.r;const n=floating(r);const intensity=r.light/100;
  return `<svg viewBox="0 0 580 320" role="img" aria-label="Lamp at ${r.light}% intensity; ${n} of 10 disks floating"><path d="M45 255h95M88 255V75l60-35" fill="none" stroke="#657d81" stroke-width="9"/><path d="M135 27l45 25-30 35-35-22Z" fill="#47655b"/><ellipse cx="161" cy="68" rx="21" ry="9" transform="rotate(-40 161 68)" fill="${r.light?'#ffe06b':'#85948e'}"/><path d="M153 76L245 272H523L173 57Z" fill="#ffdb55" opacity="${intensity*.35}"/><text x="28" y="293" font-size="17" fill="#264f46">Lamp: ${r.light===0?'OFF':r.light+'%'}</text><path d="M226 75v207h316V75" fill="#eff9f6" fill-opacity=".75" stroke="#628d84" stroke-width="4"/><path d="M230 112h308v166H230Z" fill="#d3ece5" fill-opacity=".8"/><path d="M230 112h308" stroke="#78a99d" stroke-width="2"/>${r.disks.map((d,i)=>{const ratio=Math.min(1,d.gas/d.threshold);const bottom=263-Math.floor(i/5)*9,top=111+Math.floor(i/5)*9;const y=bottom-(bottom-top)*Math.max(0,(ratio-.45)/.55);return `<ellipse cx="${255+i%5*60}" cy="${y}" rx="16" ry="6" fill="#528844" stroke="#2e6536"/>`;}).join('')}<text x="384" y="95" text-anchor="middle" font-size="18" fill="#264f46">${n} / 10 floating</text><text x="384" y="308" text-anchor="middle" font-size="13" fill="#45645b">Same cup, same disks · changing gas accumulation</text></svg>`;
 }
 updateLive(){
  const root=this.shadowRoot;const r=this.r;
  root.querySelector('#scene').innerHTML=this.scene();root.querySelector('#clock').textContent=`${Math.floor(r.ticks/4).toString().padStart(2,'0')}:${((r.ticks%4)*15).toString().padStart(2,'0')}`;
  root.querySelector('#lamp-value').textContent=r.light+'%';
  root.querySelectorAll('[data-light]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.light)===r.light));
  root.querySelector('[data-action="start"]').textContent=this.running?'Pause timer':r.ticks?'Resume timer':'Start trial';
  root.querySelector('[data-action="finish"]').disabled=r.ticks>=80||r.vacuum;
  root.querySelector('[data-action="advance"]').disabled=r.ticks>=480||r.vacuum;
  root.querySelector('[data-action="start"]').disabled=r.ticks>=480||r.vacuum;
  root.querySelector('[data-action="infiltrate"]').disabled=r.ticks>0||r.cycles>=3;
  root.querySelector('#run-note').textContent=this.note;
  root.querySelector('#quality').textContent=r.altered?'Exploratory trial: lighting changed or infiltration was incomplete. Kept in the exploration log, excluded from the fixed-light comparison.':`Controlled comparison target: ${r.planned}% light. Keep that setting and fully infiltrate the disks for all 20 minutes.`;
  root.querySelector('#readings').innerHTML=`<table><caption>Recorded every 2 simulated minutes</caption><thead><tr><th>Minutes</th><th>Floating / 10</th><th>Lamp %</th></tr></thead><tbody>${r.points.map(p=>`<tr><td>${p.time}</td><td>${p.value}</td><td>${p.light}</td></tr>`).join('')}</tbody></table>`;
  root.querySelector('#plot').innerHTML=chart([{label:'This trial',points:r.points}], 'Floating disks',Math.max(20,r.ticks/4),10);
  root.querySelector('#changes').textContent=r.events.map(e=>`${e.time.toFixed(2)} min: ${e.light}%`).join(' → ')||'No lamp changes recorded yet.';
 }
 render(){
  const r=this.r;
  this.shadowRoot.innerHTML=`<style>:host{display:block;color:#234d43;font:inherit}*{box-sizing:border-box}button,select,input{font:inherit}button,select{padding:10px;border:1px solid #8aa392;border-radius:7px;background:#fff;color:#234d43}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}button[aria-pressed=true]{background:#245f4c;color:white}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #cb7d2e;outline-offset:2px}h2{font-size:1.3rem}p,li{line-height:1.5}.layout{display:grid;grid-template-columns:1.3fr 1fr;gap:20px}.panel{padding:22px;background:white;border:1px solid #d9e4d5;border-radius:12px}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.lamp label{display:block;margin:12px 0}.lamp input{width:100%}svg{width:100%;display:block}.clock{font-size:2rem;font-variant-numeric:tabular-nums}.prep{background:#eef3e5;padding:16px;border-radius:9px;margin-bottom:16px}.prep strong{display:block}.syringe{height:64px}.scroll{max-height:260px;overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:7px;border-bottom:1px solid #d9e4d5}caption{font-size:.8rem}figure{margin:12px 0}figcaption,.small{font-size:.85rem}#quality{padding:12px;background:#f8f1de}#run-note{font-weight:600}.plot span{display:block}@media(max-width:700px){.layout{grid-template-columns:1fr}.panel{padding:16px}}</style>
  <div class="layout"><section class="panel"><h2>Prepare and experiment</h2><div class="prep"><strong>Infiltration: ${r.cycles} / 3 vacuum cycles</strong><svg class="syringe" viewBox="0 0 360 70" role="img" aria-label="${r.vacuum?'Plunger pulled back; trapped air expands and escapes':'Syringe contains solution and leaf disks'}"><path d="M28 32h32" stroke="#58766b" stroke-width="6"/><rect x="60" y="12" width="170" height="46" rx="4" fill="#d1e9e1" stroke="#58766b" stroke-width="3"/><path d="M${r.vacuum?208:135} 14v42m0-21h${r.vacuum?100:70}" stroke="#58766b" stroke-width="5"/><path d="M${r.vacuum?308:205} 18v34" stroke="#58766b" stroke-width="5"/>${[0,1,2].map(i=>`<ellipse cx="${80+i*17}" cy="${r.cycles===3?48:30}" rx="7" ry="3" fill="#54844c"/>`).join('')}${r.vacuum?'<circle cx="92" cy="18" r="5" fill="white"/><circle cx="121" cy="23" r="4" fill="white"/>':''}</svg><p>${r.vacuum?'Vacuum: trapped gas expands and escapes. Release so solution can enter the spaces.':r.cycles===3?'Solution has replaced trapped air; the disks now start sunken.':'Disks contain trapped air. Pull the plunger with the tip covered, then release the vacuum to let solution enter.'}</p><button data-action="infiltrate">${r.vacuum?'Release vacuum':'Pull plunger'}</button><p class="small">This preparation uses three cycles for teaching. Real leaves vary. Starting early is allowed, but will count as an exploratory trial.</p></div>
  <div id="scene"></div><div class="lamp"><h2>Control the lamp</h2><div class="controls">${[[0,'Off'],[25,'Low'],[100,'High']].map(([v,label])=>`<button data-light="${v}" aria-pressed="${r.light===v}">${label}</button>`).join('')}</div><label>Light intensity: <strong id="lamp-value"></strong><input id="intensity" aria-label="Light intensity" type="range" min="0" max="100" step="1" value="${r.light}"></label><p class="small">Relative model intensity, not measured illuminance. Change it at any time. Turning off the lamp does not pause the timer or instantly remove accumulated oxygen.</p></div>
  <div><strong id="clock" class="clock"></strong> simulated minutes:seconds</div><label>Timer speed <select id="speed">${[30,60,120].map(v=>`<option value="${v}" ${v===this.speed?'selected':''}>${v}× (${v/60} simulated min / real second)</option>`).join('')}</select></label><div class="controls"><button data-action="start">Start trial</button><button data-action="advance">Advance 2 minutes</button><button data-action="finish">Run remaining time</button><button data-action="fresh">Fresh disks / restart trial</button></div><p id="run-note" aria-live="polite"></p><p class="small">The timer pauses at 20 minutes for the planned comparison. Resume to explore up to 120 minutes. Leaving this screen pauses it; reload restores a paused trial.</p></section>
  <section class="panel"><h2>Live observations</h2><p id="quality"></p>${this.config.legacy?'<p>Previously saved readings remain in your comparison until you begin a new trial here.</p>':''}<div id="plot"></div><div class="scroll" id="readings"></div><h3>Lamp history</h3><p id="changes"></p><p>Watch for a delay after switching the light: gas already inside a disk takes time to be consumed or lost. In this model, a floating disk can sink again in darkness.</p><p class="small">Illustrative model only. Disk variation, oxygen production, respiration, and gas loss are simplified; times are not predictions for a real leaf or lamp. Temperature and bicarbonate stay fixed.</p></section></div>`;
  this.updateLive();
  if(this.focusTarget)this.shadowRoot.querySelector(this.focusTarget)?.focus({preventScroll:true});
 }
}
customElements.define('leaf-simulator',LeafSimulator);
