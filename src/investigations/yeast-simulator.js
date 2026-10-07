import {fuels,newYeastRun,restoreYeastRun,yeastReady,advanceYeast,yeastReadings} from './yeast-model.js';
import {chart} from './visuals.js';
import styles from './yeast-simulator.css?inline';
export const fermentationLesson=`<section class="panel"><h2>How does the gas-collection apparatus work?</h2><p>A flask holds the mixture. A fitted stopper and tube connect it to a gas syringe. Gas entering the barrel can move the freely sliding plunger; the scale measures the collected volume in milliliters.</p><p>A water bath keeps mixtures at a consistent temperature. Use matched amounts, a fresh mixture for each trial, and the same observation time. In a real setup, check for leaks and never block the plunger.</p><p><strong>Before testing:</strong> Predict how the available sugar might affect the measurements. Explain what the no-added-sugar treatment helps you compare.</p></section>`;
class YeastSimulator extends HTMLElement{
 init(config){
  this.config=config;this.r=restoreYeastRun(config.state,config.condition,config.trial,config.seed);this.speed=60;this.running=false;this.busy=false;this.note='';
  if(config.guided&&(this.r.ticks>120||this.r.bath!==30||!this.r.yeast||(this.r.prepared&&this.r.fuel!==config.condition)))this.r=newYeastRun(config.condition,config.trial,config.seed);
  this.attachShadow({mode:'open'});
  this.shadowRoot.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;this.focusTarget=b.dataset.fuel?`[data-fuel="${b.dataset.fuel}"]`:`[data-action="${b.dataset.action}"]`;
   if(b.dataset.fuel){this.r.fuel=b.dataset.fuel;this.publish();this.render();return;}
   const a=b.dataset.action;
   if(a==='mix'){this.busy=true;this.note='Measuring and mixing the 50 mL sample...';this.render();this.prepTimer=setTimeout(()=>{if(!this.isConnected)return;this.r.prepared=true;this.busy=false;this.note='Mixture prepared. Connect the flask to the gas syringe.';this.publish();this.render();},1500);return;}
   if(a==='connect'){this.r.connected=true;this.note='Stopper and tubing connected. The syringe plunger is free to move.';}
   if(a==='start'){this.running=!this.running;this.note='';if(this.running)this.schedule();else this.stop();}
   if(a==='advance')this.advance(5);
   if(a==='finish')this.advance(30-this.r.ticks/4);
   if(a==='collect'){this.dispatchEvent(new CustomEvent('yeast-collect',{bubbles:true,detail:{state:this.r,readings:yeastReadings(this.r)}}));return;}
   if(a==='fresh'){if(!confirm('Replace this unfinished mixture? Download exploration data first if you want to keep it.'))return;this.stop();this.r=newYeastRun(config.condition,config.trial,config.seed);this.note='Fresh flask. Choose a treatment and prepare a new mixture.';}
   this.publish();this.render();
  });
  this.shadowRoot.addEventListener('input',e=>{if(e.target.id==='bath'&&!config.guided){this.r.bath=Number(e.target.value);this.publish();this.updateLive();}});
  this.shadowRoot.addEventListener('change',e=>{if(e.target.id==='speed'){this.speed=Number(e.target.value);if(this.running)this.schedule();}if(e.target.id==='yeast'&&!this.r.prepared&&!config.guided){this.r.yeast=e.target.checked;this.publish();this.render();}});
  this.render();
 }
 disconnectedCallback(){this.stop();clearTimeout(this.prepTimer);this.motion?.cancel();}
 stop(){clearInterval(this.timer);this.running=false;}
 schedule(){clearInterval(this.timer);this.timer=setInterval(()=>{if(document.hidden){this.stop();this.note='Paused while this tab was hidden.';this.updateLive();return;}this.advance(.25);this.publish();this.updateLive();},15000/this.speed);}
 advance(minutes){
  if(!yeastReady(this.r))return;
  const before=this.r.ticks;advanceYeast(this.r,this.config.guided?Math.min(minutes,30-this.r.ticks/4):minutes);
  if(before<120&&this.r.ticks>=120){this.stop();this.note=this.config.guided?'30 minutes complete. Click Collect data and continue to save your results.':'30 minutes complete. Resume to explore longer.';}
  if(this.r.volume>=100||this.r.ticks>=480){this.stop();this.note=this.r.volume>=100?'Syringe capacity reached. Start a fresh mixture to continue.':'120 simulated minutes reached. Start a fresh mixture to continue.';}
 }
 publish(){this.dispatchEvent(new CustomEvent('yeast-update',{bubbles:true,detail:{state:this.r}}));}
 scene(){const r=this.r;return `<svg viewBox="0 0 850 370" role="img" aria-label="${r.prepared?'Prepared mixture':'Empty flask'}; ${r.connected?'gas syringe connected':'gas syringe disconnected'}; ${r.volume.toFixed(1)} milliliters collected">
 <defs><linearGradient id="glass" x2="0" y2="1"><stop stop-color="#ffffff" stop-opacity=".9"/><stop offset=".5" stop-color="#e0edf0" stop-opacity=".35"/><stop offset="1" stop-color="#bacfd6" stop-opacity=".8"/></linearGradient><linearGradient id="plastic" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".5" stop-color="#dfe8eb"/><stop offset="1" stop-color="#a5bac4"/></linearGradient></defs>
 <path d="M30 214v109q0 10 12 10h271q12 0 12-10V214" fill="#e7f4f6" stroke="#739da9" stroke-width="3"/><path d="M34 245h287v78q0 6-8 6H42q-8 0-8-6Z" fill="#b6dee8" opacity=".75"/><path d="M34 245h287" stroke="#78b4c5" stroke-width="2"/>
 <path d="M143 144v56L87 299q-6 12 10 12h145q16 0 10-12l-56-99v-56Z" fill="url(#glass)" stroke="#698792" stroke-width="3"/>
 ${r.prepared?`<path d="M121 249h97l28 51q3 5-5 5H98q-6 0-3-5Z" fill="${r.yeast?'#d9bd82':'#deedf0'}" opacity=".95"/><path d="M122 249h95" stroke="#bca271" stroke-width="2"/>${r.yeast&&r.ticks>0?Array.from({length:6},(_,i)=>`<circle cx="${135+i*13}" cy="${286-((r.ticks+i*7)%30)}" r="${2+i%3}" fill="#fff" opacity=".65"/>`).join(''):''}`:''}
 <path d="M149 157v45l-47 88" fill="none" stroke="white" stroke-width="5" opacity=".8"/>
 <path d="M224 285h16m-23-12h16m-24-12h17" stroke="#6d7779" stroke-width="2"/>
 ${r.connected?'<path d="M140 144l4-17h51l4 17Z" fill="#ad7852" stroke="#72563e" stroke-width="2"/><path d="M168 138V101q0-20 20-20h133q16 0 16 17v10h18" fill="none" stroke="#7b9ba3" stroke-width="7"/><path d="M168 135V101q0-20 20-20h133q16 0 16 17v10h18" fill="none" stroke="#dcecf0" stroke-width="3"/>':'<path d="M110 112l4-17h51l4 17Z" fill="#ad7852" stroke="#72563e" stroke-width="2"/><text x="104" y="84" font-size="13">Fit stopper and tubing</text>'}
 <path d="M420 170h178m-144 0V146m110 24V146" stroke="#879da6" stroke-width="7"/>
 <rect x="350" y="75" width="250" height="67" rx="8" fill="url(#glass)" stroke="#66818d" stroke-width="2"/>
 <path d="M338 101h12v14h-12Z" fill="#dce5e9" stroke="#66818d"/>
 <g id="gas-plunger" style="transform:translateX(${r.volume*2.15}px)"><path d="M368 102h243v13h-243Z" fill="url(#plastic)" stroke="#788e99"/><rect x="360" y="80" width="12" height="57" rx="3" fill="#40545c"/><path d="M364 84v49" stroke="#8b9da4" stroke-width="2"/><rect x="607" y="83" width="10" height="51" rx="4" fill="url(#plastic)" stroke="#66818d"/></g>
 <path d="M594 76V64h11v90h-11v-12" fill="url(#plastic)" stroke="#66818d"/>
 ${Array.from({length:21},(_,i)=>`<path d="M${366+i*10.75} 76v${i%4===0?16:8}" stroke="#536d78"/>`).join('')}
 ${[0,20,40,60,80,100].map((n,i)=>`<text x="${366+i*43}" y="106" text-anchor="middle" font-size="10">${n}</text>`).join('')}
 <text x="477" y="131" font-size="12">mL</text><path d="M356 79h229" stroke="white" stroke-width="3" opacity=".8"/>
 <text x="450" y="207" font-size="22" font-weight="bold">${r.volume.toFixed(1)} mL</text><text x="384" y="230" font-size="14">100 mL gas syringe</text>
 <rect x="284" y="207" width="14" height="91" rx="7" fill="white" stroke="#779ca5"/><path d="M291 285v-${(r.temperature-10)*2}" stroke="#c56848" stroke-width="5"/><circle cx="291" cy="292" r="7" fill="#c56848"/>
 <text x="43" y="356" font-size="16">Water bath: ${r.temperature.toFixed(1)} °C</text><text x="88" y="188" font-size="12">${r.prepared?'50 mL mixture':'Empty flask'}</text>
 </svg>`;}
 updateLive(){const root=this.shadowRoot,r=this.r,g=this.config.guided,ready=yeastReady(r),finished=r.ticks>=120;
  const previous=this.lastVolume??r.volume;root.querySelector('#apparatus').innerHTML=this.scene();this.lastVolume=r.volume;
  if(previous!==r.volume&&!matchMedia('(prefers-reduced-motion: reduce)').matches)this.motion=root.querySelector('#gas-plunger').animate([{transform:`translateX(${previous*2.15}px)`},{transform:`translateX(${r.volume*2.15}px)`}],{duration:250,easing:'linear'});
  root.querySelector('#clock').textContent=`${String(Math.floor(r.ticks/4)).padStart(2,'0')}:${String(r.ticks%4*15).padStart(2,'0')}`;
  root.querySelector('#gas-reading').textContent=r.volume.toFixed(1)+' mL';
  root.querySelector('#bath-value').textContent=r.bath+' °C';
  root.querySelector('#step').textContent=this.busy?'Preparing the mixture...':!r.prepared?`Step 1: choose ${g?fuels[this.config.condition]:'a treatment'} and prepare the mixture.`:!r.connected?'Step 2: connect the stopper and tubing to the freely moving gas syringe.':g&&finished?'Trial complete. Collect your data to continue.':g?'Step 3: run for 30 simulated minutes at 30 °C.':'Explore temperature changes while the timer runs. Start fresh to compare a different mixture.';
  root.querySelectorAll('[data-fuel]').forEach(b=>{b.disabled=r.prepared||this.busy;b.setAttribute('aria-pressed',b.dataset.fuel===r.fuel);});
  root.querySelector('[data-action="mix"]').disabled=r.prepared||this.busy||(g&&r.fuel!==this.config.condition);
  root.querySelector('[data-action="connect"]').disabled=!r.prepared||r.connected||this.busy;
  root.querySelector('[data-action="connect"]').textContent=r.connected?'Gas syringe connected':'Connect gas syringe';
  const blocked=!ready||this.busy||r.ticks>=480||r.volume>=100||(g&&finished);
  root.querySelector('[data-action="start"]').disabled=blocked;root.querySelector('[data-action="start"]').textContent=this.running?'Pause timer':r.ticks?'Resume timer':'Start trial';
  root.querySelector('[data-action="advance"]').disabled=blocked||r.ticks===0;
  root.querySelector('[data-action="finish"]').disabled=blocked||finished||r.ticks===0;
  root.querySelector('[data-action="fresh"]').disabled=this.busy;
  root.querySelector('#yeast').disabled=g||r.prepared||this.busy;
  root.querySelector('#note').textContent=this.note;
  root.querySelector('#plot').innerHTML=chart([{label:g?'This trial':'Exploration',points:r.points}],'Collected gas (mL)',Math.max(30,r.ticks/4),Math.max(10,Math.ceil(r.volume/10)*10));
  root.querySelector('#readings').innerHTML=`<table><caption>Recorded every 5 simulated minutes</caption><thead><tr><th>Minutes</th><th>Gas (mL)</th>${g?'':'<th>Bath (°C)</th>'}</tr></thead><tbody>${r.points.map(p=>`<tr><td>${p.time}</td><td>${p.value.toFixed(1)}</td>${g?'':`<td>${p.temperature.toFixed(1)}</td>`}</tr>`).join('')}</tbody></table>`;
  if(g){const ok=yeastReadings(r).length===7;root.querySelector('[data-action="collect"]').disabled=!ok;root.querySelector('#collect-status').textContent=ok?'Trial complete - collect your data':'Finish the 30-minute trial to collect your data';}
 }
 render(){const r=this.r,g=this.config.guided;this.shadowRoot.innerHTML=`<style>${styles}</style><p id="step" role="status"></p><div class="layout"><section class="panel"><h2>Prepare and experiment</h2><div class="prep"><h3>Prepare the flask</h3><p>Choose the treatment. Sugar mixtures contain 2 g sugar; the control has no added sugar. Each mixture has a final volume of 50 mL.</p><div class="controls">${Object.entries(fuels).map(([id,label])=>`<button data-fuel="${id}" aria-pressed="${r.fuel===id}">${label}</button>`).join('')}</div><label><input id="yeast" type="checkbox" ${r.yeast?'checked':''}> Include 0.5 g baker's yeast</label><div class="controls"><button data-action="mix">${r.prepared?'Mixture prepared':'Prepare mixture'}</button><button data-action="connect">Connect gas syringe</button></div><p class="small">The flask stays empty until the mixture is prepared. The stopper connects to a movable plunger, not a blocked container.</p></div><div id="apparatus"></div><p class="gas-reading">Collected gas: <strong id="gas-reading"></strong></p><h3>Water bath</h3><label>Bath setting: <strong id="bath-value"></strong><input id="bath" aria-label="Water bath temperature" type="range" min="15" max="40" step="1" value="${r.bath}" ${g?'disabled':''}></label><p class="small">${g?'Keep the bath at 30 °C for every comparison trial. Temperature controls unlock in free exploration.':'Adjust the bath from 15 to 40 °C. Temperature changes gradually; the model simplifies the response and omits thermal expansion.'}</p><strong id="clock" class="clock"></strong> simulated minutes:seconds<label class="speed">Timer speed <select id="speed">${[30,60,120].map(n=>`<option value="${n}" ${n===this.speed?'selected':''}>${n}× (${n/60} simulated min / real second)</option>`).join('')}</select></label><div class="controls"><button data-action="start">Start trial</button><button data-action="advance">Advance 5 minutes</button><button data-action="finish">Run remaining time</button><button data-action="fresh">Fresh mixture / restart trial</button></div><p id="note" role="status"></p><p class="small">The timer pauses at 30 minutes. ${g?'Collect data to continue.':'Resume to explore up to 120 minutes or the 100 mL syringe limit.'} Leaving the screen pauses the experiment; reloading restores it paused.</p></section><section class="panel"><h2>Live observations</h2><div id="plot"></div><div id="readings" class="scroll"></div>${g?`<div class="collect-prompt"><strong id="collect-status" role="status"></strong><p id="collect-help">Click <strong>Collect data and continue</strong> to save these results and ${this.config.condition==='sucrose'&&this.config.trial===3?'finish the comparison':'advance to the next trial'}.</p><button data-action="collect" aria-describedby="collect-help">Collect data and continue</button></div>`:''}<p>Compare your observations with your prediction. What can gas volume tell you, and what does it leave uncertain?</p><p class="small">Illustrative model: variation, lag, and temperature effects are simplified. Gas volume alone does not identify the gas, establish oxygen absence, or measure ATP yield.</p></section></div>`;this.updateLive();if(this.focusTarget)this.shadowRoot.querySelector(this.focusTarget)?.focus({preventScroll:true});}
}
customElements.define('yeast-simulator',YeastSimulator);
