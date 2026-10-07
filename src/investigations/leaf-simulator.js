import {newLeafRun,restoreLeafRun,infiltrate,setLeafLight,advanceLeaf,floating,comparisonReadings} from './leaf-model.js';
import {chart} from './visuals.js';
export const infiltrationLesson=`<section class="panel"><h2>What is infiltration?</h2><p><strong>Infiltration is the movement of liquid into spaces within a material.</strong> When those spaces contain trapped air, reducing the pressure can help remove the air so liquid can take its place.</p><ol><li>Place a porous material in liquid inside a <strong>needle-free syringe</strong> and gently expel excess air.</li><li>Cover the tip and pull back the plunger. This lowers the pressure, allowing trapped gas to expand and escape from spaces in the material.</li><li>Uncover the tip and gently release the vacuum. As normal pressure returns, liquid can enter the spaces previously occupied by gas.</li></ol><p>The amount of infiltration depends on the material and the procedure. Repeated cycles may be needed, and handling should be gentle to avoid damaging the sample.</p><p><strong>Before you begin:</strong> How might replacing trapped air with liquid affect a sample? Record your prediction and reasoning before testing it.</p></section>`;

class LeafSimulator extends HTMLElement {
 init(config){
  this.config=config;this.r=restoreLeafRun(config.state,config.condition,config.trial,config.seed);this.speed=60;this.running=false;this.note='';
  this.attachShadow({mode:'open'});
  this.shadowRoot.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b||b.disabled)return;this.focusTarget=b.dataset.light!==undefined?`[data-light="${b.dataset.light}"]`:`[data-action="${b.dataset.action}"]`;
   if(b.dataset.light!==undefined){setLeafLight(this.r,b.dataset.light);this.publish();this.updateLive();return;}
   const a=b.dataset.action;
   if(a==='infiltrate'){this.movePlunger();return;}
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
 disconnectedCallback(){this.stop();clearTimeout(this.prepTimer);this.plungerAnimation?.cancel();}
 stop(){clearInterval(this.timer);this.running=false;}
 movePlunger(){
  if(this.preparing||this.r.ticks||this.r.cycles>=3)return;
  this.stop();this.preparing=true;
  const pulling=!this.r.vacuum,duration=pulling?1500:500;
  this.note=pulling?'Pulling the plunger slowly...':'Releasing the vacuum gently...';
  const from=pulling?0:116,to=pulling?116:0;
  this.plungerAnimation=this.shadowRoot.querySelector('#syringe-plunger').animate(
   [{transform:`translateX(${from}px)`},{transform:`translateX(${to}px)`}],
   {duration,easing:'ease-in-out',fill:'forwards'});
  this.updateLive();
  this.prepTimer=setTimeout(()=>{
   if(!this.isConnected)return;
   infiltrate(this.r);this.preparing=false;this.note='';this.publish();this.render();
  },duration);
 }
 syringe(){
  const r=this.r;
  return `<svg class="syringe" viewBox="0 0 560 155" role="img" aria-label="Needle-free syringe with graduated transparent barrel, finger grips, and movable plunger; ${r.vacuum?'plunger pulled back':'plunger forward'}">
  <defs><linearGradient id="barrel-glass" x2="0" y2="1"><stop stop-color="#faffff"/><stop offset=".45" stop-color="#dce9ed" stop-opacity=".4"/><stop offset="1" stop-color="#afc6cf"/></linearGradient><linearGradient id="plunger-plastic" x2="0" y2="1"><stop stop-color="white"/><stop offset=".5" stop-color="#e1e9ed"/><stop offset="1" stop-color="#9caeb8"/></linearGradient></defs>
  <ellipse cx="285" cy="126" rx="230" ry="8" fill="#234d43" opacity=".08"/>
  <path d="M72 64H49l-15 6v16l15 6h23" fill="url(#plunger-plastic)" stroke="#66808d" stroke-width="2"/>
  <rect x="23" y="68" width="15" height="21" rx="4" fill="#648898" stroke="#435d69" stroke-width="2"/>
  <rect x="71" y="42" width="265" height="73" rx="10" fill="url(#barrel-glass)" stroke="#66808d" stroke-width="2"/>
  <path d="M78 78h121v29H82q-4 0-4-5Z" fill="#9ed5ca" opacity=".8"/>
  ${[0,1,2].map(i=>`<ellipse cx="${99+i*29}" cy="${r.cycles===3?101:87}" rx="10" ry="4" transform="rotate(${i*14-12} ${99+i*29} ${r.cycles===3?101:87})" fill="#528445" stroke="#376735"/>`).join('')}
  ${r.vacuum?'<g fill="white" stroke="#91b8c0"><circle cx="104" cy="67" r="5"/><circle cx="137" cy="74" r="3"/><circle cx="167" cy="62" r="6"/></g>':''}
  <g id="syringe-plunger" style="transform:translateX(${r.vacuum?116:0}px)">
   <path d="M208 71h182v15H208Z" fill="url(#plunger-plastic)" stroke="#748b99" stroke-width="2"/>
   <path d="M219 78h167" stroke="white" stroke-width="3"/>
   <rect x="197" y="46" width="18" height="65" rx="4" fill="#40515a"/>
   <path d="M202 49v59m8-59v59" stroke="#81919a" stroke-width="2"/>
   <rect x="386" y="48" width="13" height="61" rx="5" fill="url(#plunger-plastic)" stroke="#66808d" stroke-width="2"/>
  </g>
  <path d="M329 43V29q0-4 5-4h9q5 0 5 4v99q0 4-5 4h-9q-5 0-5-4v-13" fill="url(#plunger-plastic)" stroke="#66808d" stroke-width="2"/>
  <path d="M84 49h233" stroke="white" stroke-width="4" stroke-linecap="round" opacity=".9"/>
  <g stroke="#506672" stroke-width="1.5">${Array.from({length:21},(_,i)=>`<path d="M${91+i*11} 44v${i%5===0?17:8}"/>`).join('')}</g>
  <g fill="#3d5864" font-size="11" font-family="sans-serif">${[0,1,2,3,4].map(i=>`<text x="${91+i*55}" y="73" text-anchor="middle">${i*5}</text>`).join('')}<text x="288" y="102">mL</text></g>
  </svg>`;
 }
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
  root.querySelector('[data-action="finish"]').disabled=r.ticks>=80||r.vacuum||this.preparing;
  root.querySelector('[data-action="advance"]').disabled=r.ticks>=480||r.vacuum||this.preparing;
  root.querySelector('[data-action="start"]').disabled=r.ticks>=480||r.vacuum||this.preparing;
  root.querySelector('[data-action="infiltrate"]').disabled=r.ticks>0||r.cycles>=3||this.preparing;
  root.querySelector('[data-action="fresh"]').disabled=!!this.preparing;
  root.querySelector('#intensity').value=r.light;
  root.querySelector('#run-note').textContent=this.note;
  root.querySelector('#quality').textContent=r.altered?'Exploratory trial: lighting changed or infiltration was incomplete. Kept in the exploration log, excluded from the fixed-light comparison.':`Controlled comparison target: ${r.planned}% light. Keep that setting and fully infiltrate the disks for all 20 minutes.`;
  root.querySelector('#readings').innerHTML=`<table><caption>Recorded every 2 simulated minutes</caption><thead><tr><th>Minutes</th><th>Floating / 10</th><th>Lamp %</th></tr></thead><tbody>${r.points.map(p=>`<tr><td>${p.time}</td><td>${p.value}</td><td>${p.light}</td></tr>`).join('')}</tbody></table>`;
  root.querySelector('#plot').innerHTML=chart([{label:'This trial',points:r.points}], 'Floating disks',Math.max(20,r.ticks/4),10);
 }
 render(){
  const r=this.r;
  this.shadowRoot.innerHTML=`<style>:host{display:block;color:#234d43;font:inherit}*{box-sizing:border-box}button,select,input{font:inherit}button,select{padding:10px;border:1px solid #8aa392;border-radius:7px;background:#fff;color:#234d43}button{cursor:pointer}button:disabled{opacity:.5;cursor:default}button[aria-pressed=true]{background:#245f4c;color:white}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #cb7d2e;outline-offset:2px}h2{font-size:1.3rem}p,li{line-height:1.5}.layout{display:grid;grid-template-columns:1.3fr 1fr;gap:20px}.panel{padding:22px;background:white;border:1px solid #d9e4d5;border-radius:12px}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.lamp label{display:block;margin:12px 0}.lamp input{width:100%}svg{width:100%;display:block}.clock{font-size:2rem;font-variant-numeric:tabular-nums}.prep{background:#eef3e5;padding:16px;border-radius:9px;margin-bottom:16px}.prep strong{display:block}.syringe{height:auto;max-height:175px;margin:12px 0}.scroll{max-height:260px;overflow:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:7px;border-bottom:1px solid #d9e4d5}caption{font-size:.8rem}figure{margin:12px 0}figcaption,.small{font-size:.85rem}#quality{padding:12px;background:#f8f1de}#run-note{font-weight:600}.plot span{display:block}@media(max-width:700px){.layout{grid-template-columns:1fr}.panel{padding:16px}}</style>
  <div class="layout"><section class="panel"><h2>Prepare and experiment</h2><div class="prep"><strong>Infiltration: ${r.cycles} / 3 vacuum cycles</strong>${this.syringe()}<p>${r.vacuum?'Vacuum: trapped gas expands and escapes. Release so solution can enter the spaces.':r.cycles===3?'Three preparation cycles are complete. Observe the sample and compare it with your prediction.':'Pull the plunger with the tip covered, then release the vacuum to let solution enter the material.'}</p><button data-action="infiltrate">${r.vacuum?'Release vacuum':'Pull plunger'}</button><p class="small">This preparation uses three cycles for teaching. Real leaves vary. Starting early is allowed, but will count as an exploratory trial.</p></div>
  <div id="scene"></div><div class="lamp"><h2>Control the lamp</h2><div class="controls">${[[0,'Off'],[25,'Low'],[100,'High']].map(([v,label])=>`<button data-light="${v}" aria-pressed="${r.light===v}">${label}</button>`).join('')}</div><label>Light intensity: <strong id="lamp-value"></strong><input id="intensity" aria-label="Light intensity" type="range" min="0" max="100" step="1" value="${r.light}"></label><p class="small">Relative model intensity, not measured illuminance. Change it at any time. Turning off the lamp does not pause the timer. Predict what changing the setting will do, then observe.</p></div>
  <div><strong id="clock" class="clock"></strong> simulated minutes:seconds</div><label>Timer speed <select id="speed">${[30,60,120].map(v=>`<option value="${v}" ${v===this.speed?'selected':''}>${v}× (${v/60} simulated min / real second)</option>`).join('')}</select></label><div class="controls"><button data-action="start">Start trial</button><button data-action="advance">Advance 2 minutes</button><button data-action="finish">Run remaining time</button><button data-action="fresh">Fresh disks / restart trial</button></div><p id="run-note" aria-live="polite"></p><p class="small">The timer pauses at 20 minutes for the planned comparison. Resume to explore up to 120 minutes. Leaving this screen pauses it; reload restores a paused trial.</p></section>
  <section class="panel"><h2>Live observations</h2><p id="quality"></p>${this.config.legacy?'<p>Previously saved readings remain in your comparison until you begin a new trial here.</p>':''}<div id="plot"></div><div class="scroll" id="readings"></div><p>What changes after you adjust the lamp? Record what you observe immediately and later, and compare it with your prediction.</p><p class="small">Illustrative model only. Disk variation, oxygen production, respiration, and gas loss are simplified; times are not predictions for a real leaf or lamp. Temperature and bicarbonate stay fixed.</p></section></div>`;
  this.updateLive();
  if(this.focusTarget)this.shadowRoot.querySelector(this.focusTarget)?.focus({preventScroll:true});
 }
}
customElements.define('leaf-simulator',LeafSimulator);
