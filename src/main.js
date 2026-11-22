import {createCompletionStatus} from './investigations/completion-status.js';
import {predictionPrompt,reasoningQuestions,osmosisModelNote,osmosisSource} from './data/osmosis-learning.js';
import {recordFeedback} from './investigations/report-feedback.js';
import {reportIdentityFields} from './investigations/report-identity.js';
import {installStudentReports,studentReportControls} from './investigations/report-controls.js';
import {osmosisStudentReport} from './osmosis-report.js';
import {site} from './site.js';
import './preview.js';
import './style.css';
import {refreshLabCache} from './cache.js';
import {preparation,sugarDish} from './components/preparation.js';
import {labConfig as c} from './data/labConfig.js';
import {freshState,restore,all,ids,correct,advance,difference,recordPrediction,predictionRecord,predictionReady,canComplete} from './state.js';
import {beaker,tube,balance,graph,waterMovement} from './components/equipment.js';
let s,storageWarning='';try{s=restore(localStorage.getItem(site.storageKey));}catch{s=freshState();storageWarning='Saved work could not be restored. Download your report to keep a copy of this attempt.';}
let selected='A', prep=0, tared=false, message='', busy=false, animation='';
let completion;
const titles=['Welcome to the lab','Prepare the beakers','Examine the model cells','Place the cells','Run the experiment','Final measurements','Your results'];
function save(){
  let stored=true;
  try{localStorage.setItem(site.storageKey,JSON.stringify({version:2,state:s}));storageWarning='';}
  catch{stored=false;storageWarning='Your work could not be saved on this device. Download your report to keep a copy.';}
  const status=document.querySelector('.storage-warning');
  if(status){status.textContent=storageWarning;status.hidden=!storageWarning;}
  completion?.persisted(stored);
  return stored;
}
completion=createCompletionStatus(document.querySelector('#app'),()=>s,{selector:'[data-action="complete"]',readyLabel:'Save completed explanation',savedLabel:'Work saved as complete'});
installStudentReports(document.querySelector('#app'),()=>osmosisStudentReport(s));
const escape=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const button=(action,label,disabled=false)=>`<button data-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const cards=(mode)=>`<div class="equipment">${c.beakers.map(b=>`<button class="card ${selected===b.id?'selected':''}" data-select="${b.id}" aria-pressed="${selected===b.id}" ${mode==='place'?'data-drop="'+b.id+'"':''}>${mode==='tube'?tube(b.id):beaker(b,!!s.prepared[b.id],!!s.placed[b.id]&&s.step>=3)}<strong>${mode==='tube'?'Tube':'Beaker'} ${b.id}</strong><span>${mode==='tube'?s.initial[b.id]?'Measured':'Inspect & weigh':`${b.sugarPercent}% sugar`}</span><small>${mode==='intro'?`Inside tube ${b.id}: ${s.run.find(tube=>tube.id===b.id).sugarPercent}% sugar`:mode==='prepare'?s.prepared[b.id]?'Prepared · Record this beaker on your lab sheet':'Not prepared':mode==='place'?s.placed[b.id]?'Tube placed':'Awaiting tube':''}</small></button>`).join('')}</div>`;
const notebook=()=>`<div class="table-wrap"><table><caption>Lab notebook · measurements in grams</caption><thead><tr><th>Tube</th><th>Initial mass (g)</th><th>Final mass (g)</th><th>Change (g)</th></tr></thead><tbody>${s.run.map(t=>`<tr><th>${t.id}</th><td>${s.initial[t.id]?t.initialMass.toFixed(2)+' g':'—'}</td><td>${s.final[t.id]?t.finalMass.toFixed(2)+' g':'—'}</td><td>${s.valid[t.id]?escape(s.answers[t.id])+' g':'—'}</td></tr>`).join('')}</tbody></table></div>`;
function ready(){return [Boolean(s.prediction.trim())||s.predictionUnrecorded,all(s.prepared),all(s.initial),all(s.placed),s.elapsed,all(s.final)&&all(s.valid),false][s.step];}
function predictionPanel(){
 const earlier=predictionRecord(s);
 return `<section class="osmosis-writing" aria-labelledby="prediction-heading"><h3 id="prediction-heading">${s.predictionUnrecorded?'Earlier prediction':'Predict before you begin'}</h3>
 <p>${s.predictionUnrecorded?'This saved experiment already has results. An earlier prediction was not recorded. You may copy one from your original notes. The report will show when it was added.':'Required before continuing. Use the starting sugar concentrations shown below. Your prediction may be wrong.'}</p>
 <label for="osmosis-prediction">${predictionPrompt}</label><textarea id="osmosis-prediction" data-learning="prediction" rows="4">${escape(s.prediction)}</textarea>
 ${earlier?`<p class="small">First recorded prediction</p><p>${escape(earlier.text)}</p>`:''}</section>`;
}

function reasoningPanel(){
 const current=s.run.find(tube=>tube.id===selected);
 const outside=c.beakers.find(beaker=>beaker.id===selected).sugarPercent;
 return `<section class="explanation"><h2>Explain the evidence</h2><p>Select a tube to compare the water-movement model with its mass change.</p>
 <div class="tube-inspection" aria-label="Choose a tube to inspect">${ids.map(id=>`<button data-select="${id}" aria-pressed="${selected===id}">Tube ${id}</button>`).join('')}</div>
 ${waterMovement(current,outside)}<p><strong>Tube ${selected}</strong> changed by ${difference(current)} g. Net movement means the overall change after water moves both ways.</p>
 <p>Equal concentrations are called <strong>isotonic</strong>. Water can still cross both ways at similar rates. Small measured changes can occur.</p>
 <p class="model-note">This enlarged drawing explains the starting conditions. It shows possible water movement. The dots represent many particles. They do not show measured paths or exact particle counts.</p>
 <p>${osmosisModelNote}</p><p><a href="${osmosisSource}" target="_blank" rel="noopener">Read about osmosis in OpenStax Biology 2e</a></p></section>
 <section class="osmosis-writing"><h2>Your explanation</h2><p>Required before saving completed work. Use values from your results and compare them with your prediction.</p>
 ${reasoningQuestions.map(question=>`<label for="${question.id}">${question.prompt}</label><textarea id="${question.id}" data-reasoning="${question.id}" rows="4">${escape(s.reasoning[question.id])}</textarea>`).join('')}
 ${button('complete',s.complete?'Work saved as complete':'Save completed explanation',!canComplete(s))}${completion.html()}</section>`;
}

function content(){const b=c.beakers.find(b=>b.id===selected),t=s.run.find(t=>t.id===selected);
switch(s.step){case 0:return `<div class="intro"><span class="eyebrow">BIOLOGY / MEMBRANES & TRANSPORT</span><h2>Small cells.<br>Different environments.</h2><p class="question">What happens to a cell when it is in different environments?</p><p>Use dialysis tubing as a model cell. Investigate how external sugar concentrations affect the movement of water across a selectively permeable membrane.</p><p>Dialysis tubing is a model membrane, or barrier. In this model, water crosses it while sugar stays on its side.</p></div>${cards('intro')}${predictionPanel()}<p><a href="./resources/osmosis-homeostasis-worksheet.pdf" download>Student worksheet (PDF)</a> · <a href="./resources/osmosis-homeostasis-teacher-guide.pdf" download>Teacher guide (PDF)</a></p>${button('next','Begin Lab →',!ready())}`;
case 1:return `<p>Prepare each solution. Measure water, zero the balance with the empty dish, weigh sugar, then add it to the beaker.</p>${cards('prepare')}<section class="workspace"><div><h3>Solution ${b.id} · ${b.sugarPercent}% sugar</h3><p>${b.waterMl} mL water + ${b.sugarGrams} g sugar</p>${b.sugarGrams===0?'<p class="worksheet-reminder">Pure-water control: 0 g sugar. No sugar pile or pour is expected for this beaker.</p>':''}<p>Sugar concentration is shown as % w/v. This means grams of sugar per 100 mL of solution. The model treats added sugar as having no effect on the stated volume.</p><p>The empty petri dish weighs ${c.dishMass} g. Taring means setting the balance to zero with the empty dish on it. The display then measures the added sugar.</p>${preparation(b,prep,tared,animation,!!s.prepared[b.id])}</div><div><div class="scale-station">${sugarDish((prep>=2||animation==='weighing')&&!s.prepared[b.id]&&b.sugarGrams>0,b.sugarGrams)}${balance(prep>=2&&!s.prepared[b.id]?b.sugarGrams+(tared?0:c.dishMass):tared?0:c.dishMass,prep>=2&&!s.prepared[b.id]?'Dish with sugar':'Empty petri weighing dish')}</div><div class="actions">${button('water',prep>=1?'Water measured ✓':'Turn on faucet · Measure & add water',prep>=1||s.prepared[b.id])}${button('tare',tared?'Balance zeroed ✓':'Tare / Zero',prep!==1||s.prepared[b.id])}${button('sugar',b.sugarGrams===0?'No sugar needed (0 g)':'Weigh sugar · place on scale',b.sugarGrams===0||!tared||prep!==1||s.prepared[b.id])}${button('mix',s.prepared[b.id]?'Solution prepared ✓':'Add sugar & mix',prep!==2||s.prepared[b.id])}</div></div></section>`;
case 2:return `<p>Dialysis tubing represents a cell with a selectively permeable membrane. Inspect and weigh all five tubes.</p>${cards('tube')}<section class="workspace"><div><h3>Tube ${t.id}</h3><p>Inside: ${t.sugarPercent}% sugar solution</p><p>Initial mass: ${s.initial[t.id]?t.initialMass.toFixed(2)+' g':'Place on the balance to measure'}</p></div><div>${balance(s.initial[t.id]?t.initialMass:0,'Laboratory balance')}${button('initial',s.initial[t.id]?'Mass recorded ✓':'Weigh & record initial mass',!!s.initial[t.id])}</div></section>`;
case 3:return `<p>Place each tube into its matching beaker. Select a beaker and tap Place, or drag the labeled tube to its beaker.</p><div class="tube-tray">${s.run.map(t=>`<button draggable="true" data-drag="${t.id}" data-select="${t.id}" ${s.placed[t.id]?'disabled':''}>${tube(t.id)}Tube ${t.id}</button>`).join('')}</div>${cards('place')}${button('place',`Place tube ${selected} in beaker ${selected}`,!!s.placed[selected])}`;
case 4:return `<p>All five model cells are in their environments. Advance the clock to complete the experiment.</p>${cards('experiment')}<div class="time ${busy?'running':''}" aria-live="polite"><span class="clock">◷</span><h3>${s.elapsed?c.experimentHours:0} hours elapsed</h3>${button('advance',s.elapsed?'Experiment complete ✓':busy?'Time advancing…':`Advance ${c.experimentHours} Hours`,s.elapsed||busy)}</div>`;
case 5:return `<p>Remove and weigh each tube. Calculate final mass − initial mass in grams, including the sign.</p>${cards('tube')}<section class="workspace"><div><h3>Tube ${t.id}</h3><p>Initial mass: ${t.initialMass.toFixed(2)} g</p>${s.final[t.id]?`<p>Final mass: ${t.finalMass.toFixed(2)} g</p><form id="calculation"><label for="answer">Change in mass (g)</label><input id="answer" name="answer" type="number" step="any" value="${escape(s.answers[t.id])}" required><button>Check calculation</button></form>${(s.attempts[t.id]||0)>=3?button('hint','Show Calculation'):''}`:''}</div><div>${balance(s.final[t.id]?t.finalMass:0,'Removed tube on balance')}${button('final',s.final[t.id]?'Final mass recorded ✓':'Remove, weigh & record',!!s.final[t.id])}</div></section>`;
case 6:return `<p>Compare your observations. Use the table and graph as evidence in your explanation.</p><div class="table-wrap"><table><caption>Experiment results</caption><thead><tr>${['Tube','External sugar %','Internal sugar %','Initial (g)','Final (g)','Change (g)','Environment'].map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${s.run.map((t,i)=>{const b=c.beakers[i];return `<tr><th>${t.id}</th><td>${b.sugarPercent}</td><td>${t.sugarPercent}</td><td>${t.initialMass.toFixed(2)} g</td><td>${t.finalMass.toFixed(2)} g</td><td>${difference(t)} g</td><td>${b.sugarPercent<t.sugarPercent?'Hypotonic':b.sugarPercent===t.sugarPercent?'Isotonic':'Hypertonic'}</td></tr>`}).join('')}</tbody></table></div>${graph(s.run)}${reasoningPanel()}`;}}
function render(focus=false){document.querySelector('#app').innerHTML=`<div class="library-bar"><a href="./#/science/biology/the-cell/osmosis-homeostasis">Back to lab overview</a><a href="./#/science/biology/the-cell">The Cell</a><form action="./" id="library-search"><label for="lab-search">Search library</label><input id="lab-search" name="q" type="search" placeholder="Find a lab"><button>Search</button></form></div><header><div class="brand">◉ <span>Cell Homeostasis<small>VIRTUAL LAB</small></span></div><button class="secondary" data-action="reset">Reset Lab</button></header><main><div class="step-label">STEP ${s.step+1} OF 7 <span>MODEL CELL INVESTIGATION</span></div><div class="progress" aria-label="Step ${s.step+1} of 7">${titles.map((_,i)=>`<span class="${i<=s.step?'done':''}"></span>`).join('')}</div><h1 tabindex="-1">${titles[s.step]}</h1><div class="notice">${c.dataStatus}</div>${content()}<p class="feedback" role="status">${escape(message)}</p><p class="storage-warning notice" role="status" ${!storageWarning?'hidden':''}>${escape(storageWarning)}</p><section class="osmosis-report-controls" aria-label="Your lab report"><h2>Your lab report</h2>${reportIdentityFields(s)}${studentReportControls()}</section>${s.step>1&&s.step<6?notebook():''}${s.step>0?`<nav>${button('back','← Back')}<span>${s.step===6?(s.complete?'Completed work saved':'Explain your results below'):'Complete this step to continue'}</span>${s.step<6?button('next',s.step===3?'Begin Experiment →':'Continue →',!ready()):''}</nav>`:''}</main><footer>Answers stay on this device · No analytics · Designed for your lab worksheet</footer>`;if(busy)document.querySelectorAll('button').forEach(b=>b.disabled=true);if(focus)document.querySelector('h1').focus();}
async function animatePreparation(name){
 const duration={filling:4000,weighing:2000,mixing:4000,checking:1000}[name];
 busy=true;animation=name;render();
 const workspace=document.querySelector('.workspace');
 workspace.style.setProperty('--prep-duration',`${duration}ms`);
 const beaker=c.beakers.find(b=>b.id===selected);
 const started=performance.now();
 const showProgress=()=>{
  const progress=Math.min(1,(performance.now()-started)/duration);
  if(name==='filling'){
   const water=workspace.querySelector('.water-fill');
   water.style.animation='none';water.style.transform=`scaleY(${progress})`;
   workspace.querySelector('.volume').textContent=`${Math.round(beaker.waterMl*progress)} mL water · 0 g sugar added`;
  }else if(name==='mixing'){
   workspace.querySelector('.volume').textContent=`${beaker.waterMl} mL water · ${(beaker.sugarGrams*progress).toFixed(0)} g sugar added`;
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const dish=workspace.querySelector('.pour-dish');dish.style.animation='none';dish.style.opacity=progress<.85?'1':'0';dish.style.transform='rotate(-45deg)';
   const grains=workspace.querySelector('.sugar-grains');grains.style.opacity=progress<.8?'1':'0';
   workspace.querySelectorAll('.sugar-grain').forEach((grain,i)=>{grain.style.animation='none';grain.style.opacity='1';grain.style.transform=reduced?'none':`translateY(${((progress*4+i/18)%1)*130}px)`;});
   const pile=workspace.querySelector('.sugar-deposit');pile.style.animation='none';pile.style.opacity='1';pile.style.transform=`scaleY(${progress<.7?progress/.7:Math.max(0,(1-progress)/.3)})`;
   const remaining=workspace.querySelector('.sugar-on-scale span');remaining.style.animation='none';remaining.style.transform=`scaleY(${Math.max(0,1-progress/.8)})`;
  }else if(name==='weighing'){
   const pile=workspace.querySelector('.sugar-on-scale span');pile.style.animation='none';pile.style.opacity='1';pile.style.transform=`scaleY(${progress})`;

  }
 };
 showProgress();const timer=setInterval(showProgress,100);
 await new Promise(resolve=>setTimeout(resolve,duration));
 clearInterval(timer);busy=false;animation='';
}
document.addEventListener('click',async e=>{const el=e.target.closest('button');if(!el||el.disabled||busy)return;if(el.dataset.select){selected=el.dataset.select;prep=0;tared=false;message='';render();return;}const action=el.dataset.action;if(!action)return;message='';switch(action){case 'reset':if(!confirm('Reset all lab progress and measurements?'))return;s=freshState();completion.invalidate();try{localStorage.removeItem(site.storageKey);}catch{}selected='A';prep=0;tared=false;save();busy=true;render(true);try{await refreshLabCache();message='Lab reset. Offline copies refreshed when online.';}catch{message='Lab reset. Cache refresh unavailable in this browser.';}busy=false;render(true);return;case 'next':if(ready()){if(s.step===0&&s.prediction.trim())recordPrediction(s);s.step++;}break;case 'back':s.step=Math.max(0,s.step-1);break;case 'water':if(prep!==0||s.prepared[selected])return;await animatePreparation('filling');prep=1;if(c.beakers.find(b=>b.id===selected).sugarGrams===0)s.prepared[selected]=true;message=`Faucet filled beaker ${selected} with ${c.beakers.find(b=>b.id===selected).waterMl} mL of water.`;break;case 'tare':tared=true;message='The empty dish now reads zero. Its mass will not be counted as sugar.';break;case 'sugar':if(c.beakers.find(b=>b.id===selected).sugarGrams===0||!tared||prep!==1)return;await animatePreparation(c.beakers.find(b=>b.id===selected).sugarGrams>0?'weighing':'checking');prep=2;message=c.beakers.find(b=>b.id===selected).sugarGrams===0?'Zero grams confirmed. This beaker contains only water.':'Sugar placed on the tared balance. Read the mass in grams.';break;case 'mix':if(prep!==2||s.prepared[selected])return;await animatePreparation(c.beakers.find(b=>b.id===selected).sugarGrams>0?'mixing':'checking');s.prepared[selected]=true;message='Sugar added and dissolved. Solution prepared.';break;case 'initial':completion.invalidate();s.initial[selected]=true;break;case 'place':s.placed[selected]=true;break;case 'advance':if(!all(s.placed)||!predictionReady(s))return;busy=true;render();await new Promise(r=>setTimeout(r,900));advance(s);busy=false;break;case 'final':completion.invalidate();s.final[selected]=true;break;case 'complete':if(canComplete(s)){completion.complete(save);return;}break;case 'hint':{const t=s.run.find(t=>t.id===selected);message=`${t.finalMass.toFixed(2)} − ${t.initialMass.toFixed(2)} = ${difference(t)} g`;break;}}save();render(action==='next'||action==='back');});
document.addEventListener('submit',event=>{
  if(event.target.id!=='calculation')return;
  event.preventDefault();
  const value=new FormData(event.target).get('answer');
  completion.invalidate();
  s.answers[selected]=value;
  s.attempts[selected]=(s.attempts[selected]||0)+1;
  s.valid[selected]=correct(s.run,selected,value);
  recordFeedback(s,{
    topic:'mass-change',sample:selected,label:'Tube '+selected+' mass change',
    responses:[String(value)],expected:[String(difference(s.run.find(tube=>tube.id===selected)))],
    matches:[s.valid[selected]]
  });
  message=s.valid[selected]?'Correct! Final mass minus initial mass gives the signed change.':'Check final mass minus initial mass. Keep the minus sign when mass decreases.';
  save();
  render();
});
document.addEventListener('input',event=>{
 const input=event.target;
 if(['studentName','studentClass'].includes(input.dataset.reportField)){
  s[input.dataset.reportField]=input.value;save();return;
 }
 if(input.dataset.learning==='prediction')s.prediction=input.value;
 else if(input.dataset.reasoning)s.reasoning[input.dataset.reasoning]=input.value;
 else if(input.id==='answer'){s.answers[selected]=input.value;s.valid[selected]=false;}
 else return;
 completion.invalidate();save();
 const next=document.querySelector('[data-action="next"]');
 if(next)next.disabled=!ready();
 const complete=document.querySelector('[data-action="complete"]');
 if(complete)complete.disabled=!canComplete(s);
});

document.addEventListener('dragstart',e=>{const el=e.target.closest('[data-drag]');if(el)e.dataTransfer.setData('text/plain',el.dataset.drag);});
document.addEventListener('dragover',e=>{if(e.target.closest('[data-drop]'))e.preventDefault();});
document.addEventListener('drop',e=>{const el=e.target.closest('[data-drop]');if(!el)return;e.preventDefault();const id=e.dataTransfer.getData('text/plain');if(id===el.dataset.drop){s.placed[id]=true;message=`Tube ${id} placed.`;}else message='Place the tube in its matching labeled beaker.';save();render();});
save();
render();
if('serviceWorker' in navigator&&import.meta.env.PROD&&!import.meta.env.VITE_PLATFORM_RUNTIME){
  const alreadyControlled=!!navigator.serviceWorker.controller;
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(alreadyControlled&&!reloading){reloading=true;save();location.reload();}
  });
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'})
    .then(registration=>registration.update()).catch(()=>{});
}

document.addEventListener("submit",event=>{if(event.target.id!=="library-search")return;event.preventDefault();location.href="./#/search?q="+encodeURIComponent(new FormData(event.target).get("q")||"");});
