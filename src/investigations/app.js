import '../preview.js';
import '../library.css';
import './lab.css';
import {infiltrationLesson} from './leaf-simulator.js';
import {restoreLeafRun} from './leaf-model.js';
import {microscopeLesson} from './mitosis-simulator.js';
import {restoreMicroscope} from './mitosis-model.js';
import {fermentationLesson} from './yeast-simulator.js';
import {restoreYeastRun,yeastReadings} from './yeast-model.js';
import {site} from '../site.js';
import {investigations,stages,stageClues} from './content.js';
import {times,makeSeries,fieldCells,et50,mean,tally,stageStats,fresh,restored,completedData,validateReadings} from './model.js';
import {escape,cell,apparatus,chart} from './visuals.js';

const params=new URLSearchParams(location.search);
const c=investigations[params.get('lab')];
const app=document.querySelector('#app');
if(!c){app.innerHTML='<main><h1>Choose an investigation</h1><p>This lab address is not recognized.</p><a href="./#/science/biology/the-cell">Return to The Cell unit</a></main>';}
else boot();
function boot(){
 const virtualWorkspace=['leaf','yeast','mitosis'].includes(c.kind)&&params.get('mode')==='virtual';
 const assigned=virtualWorkspace?[]:(params.get('sources')||'').split(',');
 const initialSources=c.conditions.map((_,i)=>assigned[i]==='classroom'?'classroom':'virtual');
 const key=`science-labs:${site.root.pathname}:${c.id}:v1:${initialSources.join(',')}${virtualWorkspace?(c.kind==='leaf'?':lamp-workspace':c.kind==='yeast'?':fermentation-workspace':':microscope-workspace'):''}`;
 let s,stored=null,storageWarning='';try{stored=localStorage.getItem(key);s=restored(c,stored,initialSources);}catch{s=fresh(c,initialSources);storageWarning='Browser storage is unavailable. Download your work before closing this tab.';}
 if(virtualWorkspace&&stored===null)s.step=1;
 s.leafRuns=Object.fromEntries(c.kind==='leaf'?c.conditions.flatMap(cond=>[1,2,3].filter(t=>s.leafRuns?.[cond.id+'-'+t]).map(t=>[cond.id+'-'+t,restoreLeafRun(s.leafRuns[cond.id+'-'+t],cond.id,t,s.seed)])):[]);
 s.yeastRuns=Object.fromEntries(c.kind==='yeast'?c.conditions.flatMap(cond=>[1,2,3].filter(t=>s.yeastRuns?.[cond.id+'-'+t]).map(t=>[cond.id+'-'+t,restoreYeastRun(s.yeastRuns[cond.id+'-'+t],cond.id,t,s.seed)])):[]);
 s.microscopeRuns=Object.fromEntries(c.kind==='mitosis'?c.conditions.map(cond=>[cond.id,restoreMicroscope(s.microscopeRuns?.[cond.id],s.classifications[cond.id])]):[]);
 let active=0,trial=1,selected=0,message='',share='',exploring=false;
 const guidedSeries=['leaf','yeast'].includes(c.kind);
 function selectPendingTrial(){
  if(exploring)return;
  if(c.kind==='mitosis'){const i=c.conditions.findIndex((cond,i)=>s.sources[i]==='classroom'?!s.counts[cond.id]?.some(n=>n>0):!s.reviewed[cond.id]);if(i>=0)active=i;return;}
  if(!guidedSeries)return;
  for(let i=0;i<c.conditions.length;i++)for(let t=1;t<=3;t++)if(s.runs[c.conditions[i].id+'-'+t]?.length!==times(c).length){active=i;trial=t;return;}
 }
 const source=(i=active)=>s.sources[i];
 const condition=()=>c.conditions[active];
 const runKey=()=>condition().id+'-'+trial;
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(s));}catch{storageWarning='Browser storage is unavailable. Download your work before closing this tab.';}};
 const btn=(action,label,disabled=false,cls='')=>`<button type="button" data-action="${action}" ${disabled?'disabled':''} class="${cls}">${label}</button>`;
 const field=(label,id,value)=>`<label class="writing">${label}<textarea data-note="${id}" rows="3">${escape(value)}</textarea></label>`;
 function workspaceNotice(){
  if(!guidedSeries&&c.kind!=='mitosis')return '';
  const equipment=c.kind==='leaf'?'lamp':c.kind==='yeast'?'fermentation apparatus':'microscope';
  const url=new URL(location.href);url.hash='';
  if(virtualWorkspace){url.searchParams.delete('mode');return `<div class="panel"><strong>Virtual ${equipment} workspace</strong><p>Your previous lab work remains saved separately.</p><a class="button" href="${escape(url.href)}">Return to saved lab</a></div>`;}
  if(!s.sources.includes('classroom'))return '';
  url.searchParams.set('mode','virtual');
  return `<div class="panel"><strong>Saved classroom settings are active</strong><p>One or more treatments use classroom data-entry fields instead of the ${equipment}. Open the virtual workspace to use the interactive ${equipment} for ${c.kind==='mitosis'?'both fields':'all three treatments'}. Your classroom measurements and notes will stay saved here.</p><a class="button" href="${escape(url.href)}">Open interactive ${equipment}</a></div>`;
 }
 function resources(){return `<div class="resources"><a href="./resources/${c.id}-worksheet.pdf" download>Download student worksheet (PDF)</a><a href="./resources/${c.id}-teacher-guide.pdf" download>Download teacher guide (PDF)</a></div>`;}
 function plan(){return `${c.kind==='leaf'?infiltrationLesson:c.kind==='yeast'?fermentationLesson:microscopeLesson}<div class="${'student-plan'}"><section class="panel"><h2>Start with a question</h2><p class="inquiry">${c.question}</p><p>${c.overview}</p><p><strong>Keep consistent:</strong> ${c.constants}</p>${field('Prediction — what do you expect, and why?','prediction',s.notes.prediction)}${field('Investigation design — variables, controls, or sampling plan','design',s.notes.design)}${btn('next','Collect observations →')}</section></div><details class="panel"><summary>Classroom procedure and materials</summary><h3>Materials</h3><ul>${c.materials.map(x=>`<li>${x}</li>`).join('')}</ul><ol>${c.procedure.map(x=>`<li>${x}</li>`).join('')}</ol><p><strong>Safety:</strong> ${c.safety}</p></details><div class="model-note"><strong>About the model.</strong> ${c.model}</div>`;}
 function trialControls(){if(c.kind==='mitosis')return `<section class="panel"><h2>${exploring?'Microscope exploration':completedData(c,s)?'Both fields collected':`${condition().label} · Field ${active+1} of 2`}</h2><p>${exploring?'Practice with another illustrated field and explore microscope controls or cycle-duration assumptions. Your collected classifications stay saved separately.':completedData(c,s)?'Analyze your collected evidence or explore the microscope and time assumptions.':'Set up the microscope, classify all 20 cells, review your choices, then collect the field to continue. Count each cell once.'}</p></section>`;if(guidedSeries)return `<section class="panel"><h2>${exploring?'Free exploration':completedData(c,s)?'All nine trials collected':`${condition().label} · Trial ${trial} of 3`}</h2><p>${exploring?(c.kind==='leaf'?'Try different light settings and preparation choices. Your nine comparison trials are saved separately.':'Try different bath temperatures or compare fresh mixtures with and without yeast. Your nine comparison trials are saved separately.'):completedData(c,s)?'Your comparison data are ready. Analyze your evidence or explore other settings.':c.kind==='yeast'?`Trial ${active*3+trial} of 9: prepare ${condition().label.toLowerCase()}, connect the gas syringe, run for 30 simulated minutes at 30 °C, then collect the data. Complete three trials each with no added sugar, glucose, and sucrose.`:`Trial ${active*3+trial} of 9: prepare the syringe, add the disks to the cup, set ${condition().label.toLowerCase()}, run for 20 simulated minutes, then collect the data. Complete three trials at each level: dark, low light, and bright light.`}</p></section>`;return `<div class="selectors"><label>${c.kind==='mitosis'?'Field':'Treatment'}<select id="condition">${c.conditions.map((x,i)=>`<option value="${i}" ${i===active?'selected':''}>${x.label} — ${source(i)}</option>`).join('')}</select></label>${c.kind==='mitosis'?'':`<label>Independent trial<select id="trial">${[1,2,3].map(t=>`<option ${t===trial?'selected':''}>${t}</option>`).join('')}</select></label>`}<span class="badge ${source()==='virtual'?'available':''}">${source()==='virtual'?'Simulated observations':'Classroom observations'}</span></div>`;}
 function dataTable(points,caption){return `<div class="table-scroll"><table><caption>${escape(caption)}</caption><thead><tr><th>Time (min)</th><th>${c.yLabel}</th></tr></thead><tbody>${points.map(p=>`<tr><th>${p.time}</th><td>${p.value}</td></tr>`).join('')}</tbody></table></div>`;}
 function collectSeries(){
  if(c.kind==='yeast'&&(exploring||source()==='virtual'))return '<yeast-simulator></yeast-simulator>';
  if(c.kind==='leaf'&&(exploring||source()==='virtual'))return '<leaf-simulator></leaf-simulator>';
  const points=s.runs[runKey()]||[];const last=points.at(-1)||{time:0,value:0};const complete=points.length===times(c).length;
  return `<div class="lab-columns"><section class="panel"><h2>${condition().label}</h2><p>${condition().detail} · Trial ${trial} of 3</p>${source()==='virtual'?`${apparatus(c,last.value,last.time)}<div class="reading"><strong>${last.value}${c.kind==='leaf'?' / 10':' mL'}</strong><span>${last.time} / ${c.end} minutes</span></div><p class="small">An accelerated model clock. The observation logger records each scheduled reading; no real waiting is required.</p><div class="actions">${btn('advance',points.length?`Advance ${c.interval} minutes`:'Start trial',complete)}${btn('finish-trial','Run remaining time',complete,'secondary')}</div>`:`<p>Enter your measured values, not the virtual results. Keep the stated units and observation times. All readings are required.</p><form id="classroom-readings" class="measurement-form"><div class="measurement-grid">${times(c).map((time,i)=>`<label>${time} min<input aria-label="Reading at ${time} minutes" name="reading-${i}" type="number" min="0" max="${c.max}" step="${c.kind==='leaf'?'1':'0.1'}" value="${points[i]?.value??''}" required></label>`).join('')}</div><button>Save classroom trial</button></form>`}</section><section class="panel"><h2>Observation log</h2>${points.length?dataTable(points,`${condition().label} · Trial ${trial} · ${source()}`):'<p>No observations yet. Start a virtual trial or enter classroom readings.</p>'}${points.length?chart([{label:`Trial ${trial}`,points}],c.yLabel,c.end,c.kind==='leaf'?10:Math.max(10,Math.ceil(last.value/10)*10)):''}${complete?`<p class="success">Trial recorded.</p>`:''}</section></div>`;
 }
 function collectMitosis(){
  const id=condition().id;
  if(!exploring&&source()==='classroom')return `<section class="panel"><h2>${condition().label}: classroom tally</h2><p>Count a non-overlapping field from a prepared slide. Enter zero for an absent stage; include every classified cell. Record ambiguous or excluded cells in your observation notes.</p><form id="classroom-counts"><div class="measurement-grid">${stages.map((stage,i)=>`<label>${stage}<input name="stage-${i}" type="number" min="0" max="1000" step="1" value="${s.counts[id]?.[i]??''}" required></label>`).join('')}</div><button>Save field count</button></form></section>`;
  return '<mitosis-simulator></mitosis-simulator>';
 }
 function progress(){return `<div class="progress-list">${c.conditions.map((cond,i)=>{const done=c.kind==='mitosis'?(source(i)==='classroom'?!!s.counts[cond.id]?.some(x=>x>0):!!s.reviewed[cond.id]):[1,2,3].filter(t=>s.runs[cond.id+'-'+t]?.length===times(c).length).length;return `<span>${cond.label}: ${c.kind==='mitosis'?(done?'recorded':'pending'):`${done}/3 trials`}</span>`;}).join('')}</div>`;}
 function collect(){return `${trialControls()}${progress()}${(guidedSeries||c.kind==='mitosis')&&completedData(c,s)&&!exploring?`<section class="panel"><h2>Comparison complete</h2>${results()}${btn('explore-leaf','Explore other settings')}</section>`:c.kind==='mitosis'?collectMitosis():collectSeries()}${exploring?btn('end-exploration','Return to collected data',false,'secondary'):''}<section class="panel">${field('Observation notes — unusual results, equipment, exclusions, and classroom conditions','observations',s.notes.observations)}<div class="actions">${btn('previous','← Prediction',false,'secondary')}${btn('next','Analyze evidence →',!completedData(c,s))}</div></section>`;}
 function results(){
  if(c.kind==='mitosis'){
   const counts=c.conditions.map((cond,i)=>source(i)==='classroom'?(s.counts[cond.id]||stages.map(()=>0)):tally(s.classifications[cond.id]||[]));
   const totals=stages.map((_,i)=>counts.reduce((n,a)=>n+a[i],0));const rows=stageStats(totals,s.cycleHours);
   return `<div class="table-scroll"><table><caption>Student classifications — ${totals.reduce((a,b)=>a+b,0)} cells; assumed cycle ${s.cycleHours} hours</caption><thead><tr><th>Stage</th>${c.conditions.map((cond,i)=>`<th>${cond.label}<br>(${source(i)})</th>`).join('')}<th>Total</th><th>Percent</th><th>Estimated hours</th></tr></thead><tbody>${rows.map((row,i)=>`<tr><th>${row.stage}</th>${counts.map(a=>`<td>${a[i]}</td>`).join('')}<td>${row.count}</td><td>${row.percent.toFixed(1)}%</td><td>${row.hours.toFixed(2)}</td></tr>`).join('')}</tbody></table></div><p class="small">Counts retain your classifications, including any disagreements with the model key. Exploration uses a separate practice tally and does not change these collected counts.</p>`;
  }
  const series=[];
  const rows=c.conditions.map((cond,i)=>{
   const runs=[1,2,3].map(t=>s.runs[cond.id+'-'+t]||[]);
   const completeRuns=runs.filter(r=>r.length===times(c).length);
   if(completeRuns.length)series.push({label:`${cond.label}, mean of ${completeRuns.length} (${source(i)})`,points:times(c).map((time,j)=>({time,value:mean(completeRuns.map(r=>r[j].value))}))});
   const values=runs.map(run=>run.length===times(c).length?(c.kind==='leaf'?et50(run):(run.at(-1).value-run[0].value)/c.end):undefined);
   const numeric=values.filter(x=>typeof x==='number');const avg=numeric.length===3?mean(numeric):null;
   return `<tr><th>${cond.label}<br><small>${source(i)}</small></th>${values.map((v,j)=>`<td>${s.leafRuns[cond.id+'-'+(j+1)]?.altered?'Exploratory — excluded':v===undefined?'Pending':v===null?'Not reached by 20 min':v.toFixed(2)}</td>`).join('')}<td>${avg===null?'Not available':avg.toFixed(2)}</td></tr>`;
  });
  return `<div class="table-scroll"><table><caption>${c.kind==='leaf'?'ET50 (minutes); mean only when all three trials reach five floating disks':'Average gas accumulation rate (mL/min), over 0–30 minutes'}</caption><thead><tr><th>Treatment / source</th><th>Trial 1</th><th>Trial 2</th><th>Trial 3</th><th>Mean</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>${chart(series,c.yLabel,c.end,c.kind==='leaf'?10:Math.max(10,...series.flatMap(x=>x.points.map(p=>Math.ceil(p.value/10)*10))))}<p class="small">Graph: mean readings of completed trials. Compare independent trial results in the table; a mean alone does not show uncertainty.</p>`;
 }
 function analysis(){return `<section class="panel"><h2>Make sense of the evidence</h2><p>${c.interpretation}</p>${!completedData(c,s)?'<p class="notice">Finish all data collection before completing this lab.</p>':''}${c.kind==='mitosis'?`<label class="cycle-label">Assumed cell-cycle duration (hours)<input id="cycle-hours" type="number" min="1" max="100" step="0.1" value="${s.cycleHours}"></label>`:''}${results()}</section><section class="panel"><h2>Explain your findings</h2>${c.questions.map((q,i)=>field(`${i+1}. ${q}`,'answer-'+i,s.notes.answers[i])).join('')}<div class="actions">${btn('previous','← Collect observations',false,'secondary')}${btn('complete','Mark work complete')}</div>${s.complete?'<p class="success">Work complete on this device. Download or print your report to share it with your teacher. Nothing has been submitted or graded automatically.</p>':''}</section><section class="panel"><h2>Take your work with you</h2><div class="actions">${btn('csv','Download data (CSV)',false,'secondary')}${btn('report','Download lab report (.txt)',false,'secondary')}${btn('print','Print report / Save as PDF',false,'secondary')}</div><p class="small">Exports label virtual and classroom data. Your teacher decides how to collect and assess your work.</p></section>`;}
 function render(focus=false){
  selectPendingTrial();
  document.title=c.title+' | Science Labs';
  app.innerHTML=`<a class="skip-link" href="#lab-main">Skip to investigation</a><header class="site-header"><a class="brand" href="./#/">Science Labs</a><a href="./#/science/biology/the-cell/${c.id}">Lab overview</a><form id="search-library" class="header-search" role="search"><label class="sr-only" for="search-query">Search library</label><input id="search-query" name="q" type="search" placeholder="Search the library"><button>Search</button></form></header><main id="lab-main" class="investigation"><div class="lab-heading"><div><p class="eyebrow">BIOLOGY / THE CELL</p><h1 tabindex="-1">${c.title}</h1><p>Biology 2e · Chapter ${c.chapter} · ${c.duration}</p></div>${btn('reset','Reset this lab',false,'secondary')}</div>${resources()}${workspaceNotice()}<nav class="lab-tabs" aria-label="Investigation steps">${['Predict & plan','Collect observations','Analyze & explain'].map((x,i)=>`<button data-step="${i}" aria-current="${s.step===i?'step':'false'}">${i+1}. ${x}</button>`).join('')}</nav><p class="feedback" role="status">${escape(message)}</p>${storageWarning?`<p class="notice">${storageWarning}</p>`:''}<div class="screen-work">${[plan,collect,analysis][s.step]()}</div><section class="print-report"><h2>Investigation report</h2><p>Name: ________________________ Date: ______________</p><h3>Prediction</h3><p>${escape(s.notes.prediction)}</p><h3>Design</h3><p>${escape(s.notes.design)}</p>${results()}<h3>Observation notes</h3><p>${escape(s.notes.observations)}</p>${c.questions.map((q,i)=>`<h3>${i+1}. ${q}</h3><p>${escape(s.notes.answers[i])}</p>`).join('')}<p>Data are labeled by source. ${s.complete?'Student marked complete.':'Work in progress.'} No automated grade or submission.</p></section><details class="panel"><summary>Model limitations and reading connections</summary><p>${c.model}</p><ul>${c.sources.map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener">${name}</a></li>`).join('')}</ul></details></main><footer class="site-footer"><p>Progress stays in this browser · Download work before changing devices</p></footer>`;
  const simulator=app.querySelector('leaf-simulator');
  if(simulator)simulator.init({condition:condition().id,trial,seed:s.seed,state:exploring?s.leafExploration:s.leafRuns[runKey()],guided:guidedSeries&&!exploring});
  const yeast=app.querySelector('yeast-simulator');
  if(yeast)yeast.init({condition:condition().id,trial,seed:s.seed,state:exploring?s.yeastExploration:s.yeastRuns[runKey()],guided:!exploring});
  const microscope=app.querySelector('mitosis-simulator');
  if(microscope)microscope.init({field:condition().id,seed:s.seed,state:exploring?s.microscopeExploration:s.microscopeRuns[condition().id],answers:exploring?undefined:s.classifications[condition().id],guided:!exploring});
  app.querySelector('.skip-link').onclick=e=>{e.preventDefault();app.querySelector('h1').focus();};
  if(focus)app.querySelector('h1').focus({preventScroll:true});
 }
 function csvRows(){
  const rows=[['lab',c.title],['version','1'],['status',s.complete?'student marked complete':'in progress']];
  if(c.kind==='mitosis'){
   rows.push(['field','data source','stage','count','assumed cycle hours']);
   c.conditions.forEach((cond,i)=>{const counts=source(i)==='classroom'?(s.counts[cond.id]||[]):tally(s.classifications[cond.id]||[]);stages.forEach((stage,j)=>rows.push([cond.label,source(i),stage,counts[j]??'',s.cycleHours]));});
  }else{rows.push(['treatment','data source','trial','time (min)',c.yLabel]);c.conditions.forEach((cond,i)=>[1,2,3].forEach(t=>(s.runs[cond.id+'-'+t]||[]).forEach(p=>rows.push([cond.label,source(i),t,p.time,p.value]))));}
  if(c.kind==='leaf'){rows.push([],['Interactive leaf trials: exploration retained separately'],['trial key','classification','time (min)','floating disks','lamp %','infiltration cycles']);for(const [id,r] of Object.entries(s.leafRuns)){for(const p of r.points||[])rows.push([id,r.altered?'exploratory':'fixed light',p.time,p.value,p.light,r.cycles]);rows.push(['lamp change history',id]);for(const e of r.events||[])rows.push(['lamp change',id,e.time,e.light]);}}
  if(c.kind==='leaf'&&s.leafExploration?.points){rows.push([],['Free exploration (excluded from comparison)'],['time (min)','floating disks','lamp %']);for(const p of s.leafExploration.points)rows.push([p.time,p.value,p.light]);}
  if(c.kind==='yeast'&&s.yeastExploration?.points){rows.push([],['Free exploration (excluded from comparison)'],['fuel','yeast present','time (min)','collected gas (mL)','bath temperature (C)']);const r=restoreYeastRun(s.yeastExploration,'sucrose',1,s.seed);for(const p of r.points)rows.push([r.fuel,r.yeast,p.time,p.value,p.temperature]);}
  if(c.kind==='mitosis'&&s.microscopeExploration){const r=restoreMicroscope(s.microscopeExploration);rows.push([],['Microscope exploration (excluded from collected fields)'],['practice field','stage','count','assumed cycle hours']);tally(r.answers).forEach((n,i)=>rows.push([r.practiceField,stages[i],n,r.hours]));}
  return rows;
 }
 function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const csv=()=>csvRows().map(row=>row.map(v=>{const text=String(v);return '"'+(/^[=+@\-]/.test(text)?"'":'')+text.replaceAll('"','""')+'"';}).join(',')).join('\r\n');
 app.addEventListener('leaf-update',e=>{if(exploring){s.leafExploration=structuredClone(e.detail.state);save();return;}s.leafRuns[runKey()]=structuredClone(e.detail.state);if(!guidedSeries){if(e.detail.readings.length)s.runs[runKey()]=e.detail.readings;else delete s.runs[runKey()];}s.complete=false;save();const progressNode=app.querySelector('.progress-list');if(progressNode)progressNode.outerHTML=progress();const next=app.querySelector('[data-action="next"]');if(next)next.disabled=!completedData(c,s);});
 app.addEventListener('leaf-collect',e=>{if(!guidedSeries||exploring||e.detail.readings.length!==times(c).length)return;s.runs[runKey()]=structuredClone(e.detail.readings);s.leafRuns[runKey()]=structuredClone(e.detail.state);s.complete=false;message=`${condition().label}, trial ${trial}: data collected.`;save();render(true);const heading=app.querySelector('.screen-work h2');heading?.setAttribute('tabindex','-1');heading?.focus();});
 app.addEventListener('yeast-update',e=>{if(exploring)s.yeastExploration=structuredClone(e.detail.state);else{s.yeastRuns[runKey()]=structuredClone(e.detail.state);s.complete=false;}save();});
 app.addEventListener('yeast-collect',e=>{if(c.kind!=='yeast'||exploring)return;const state=restoreYeastRun(e.detail.state,condition().id,trial,s.seed),readings=yeastReadings(state);if(readings.length!==times(c).length)return;s.runs[runKey()]=readings;s.yeastRuns[runKey()]=state;s.complete=false;message=`${condition().label}, trial ${trial}: data collected.`;save();render(true);const heading=app.querySelector('.screen-work h2');heading?.setAttribute('tabindex','-1');heading?.focus();});
 app.addEventListener('mitosis-update',e=>{const r=restoreMicroscope(e.detail.state);if(exploring)s.microscopeExploration=r;else{s.microscopeRuns[condition().id]=r;s.classifications[condition().id]=[...r.answers];s.complete=false;}save();});
 app.addEventListener('mitosis-collect',e=>{if(c.kind!=='mitosis'||exploring)return;const r=restoreMicroscope(e.detail.state);if(!r.checked||r.answers.some(a=>a===null))return;const id=condition().id;s.microscopeRuns[id]=r;s.classifications[id]=[...r.answers];s.reviewed[id]=true;s.complete=false;message=`${condition().label}: classifications collected.`;save();render(true);const heading=app.querySelector('.screen-work h2');heading?.setAttribute('tabindex','-1');heading?.focus();});
 app.addEventListener('input',e=>{if(e.target.dataset.note){const id=e.target.dataset.note;const value=e.target.value;if(id.startsWith('answer-'))s.notes.answers[Number(id.slice(7))]=value;else s.notes[id]=value;s.complete=false;save();}});
 app.addEventListener('change',e=>{
  if(e.target.dataset.source!==undefined){const i=Number(e.target.dataset.source);const value=e.target.value;if(!confirm('Changing this part’s source clears its existing data. Continue?')){render();return;}s.sources[i]=value;const id=c.conditions[i].id;[1,2,3].forEach(t=>{delete s.runs[id+'-'+t];delete s.leafRuns[id+'-'+t];delete s.yeastRuns[id+'-'+t];});delete s.classifications[id];delete s.counts[id];delete s.reviewed[id];s.complete=false;share='';save();render();}
  if(e.target.id==='condition'){active=Number(e.target.value);selected=0;message='';render();}
  if(e.target.id==='trial'){trial=Number(e.target.value);message='';render();}
  if(e.target.id==='cycle-hours'){const value=Number(e.target.value);if(value>=1&&value<=100){s.cycleHours=value;s.complete=false;save();message='Cycle duration is an assumption. Estimated stage times updated.';}else message='Enter an assumed cycle duration from 1 to 100 hours.';render();}
 });
 app.addEventListener('submit',e=>{
  e.preventDefault();const form=e.target;const data=new FormData(form);
  if(form.id==='search-library'){location.href='./#/search?q='+encodeURIComponent(data.get('q')||'');return;}
  if(form.id==='classroom-readings'){const values=times(c).map((_,i)=>data.get('reading-'+i));if(!validateReadings(c,values)){message=`Enter every reading from 0 to ${c.max}${c.kind==='leaf'?', using whole disks':''}.`;render();return;}s.runs[runKey()]=times(c).map((time,i)=>({time,value:Number(values[i])}));message='Classroom trial saved with its source label.';}
  if(form.id==='classroom-counts'){const values=stages.map((_,i)=>Number(data.get('stage-'+i)));if(!values.every(v=>Number.isInteger(v)&&v>=0&&v<=1000)||!values.some(v=>v>0)){message='Enter whole counts, including zeros, and at least one counted cell.';render();return;}s.counts[condition().id]=values;message='Classroom field saved.';}
  s.complete=false;save();render();
 });
 app.addEventListener('click',e=>{
  const el=e.target.closest('button');if(!el||el.disabled)return;
  if(el.dataset.step!==undefined){s.step=Number(el.dataset.step);message='';save();render(true);return;}
  if(el.dataset.cell!==undefined){selected=Number(el.dataset.cell);render();return;}
  if(el.dataset.stage!==undefined){const id=condition().id;s.classifications[id]??=Array(20).fill(null);s.classifications[id][selected]=Number(el.dataset.stage);s.reviewed[id]=false;s.complete=false;save();render();return;}
  const action=el.dataset.action;if(!action)return;message='';
  switch(action){
   case 'explore-leaf':if(!completedData(c,s))return;exploring=true;active=c.kind==='mitosis'?0:2;trial=1;break;
   case 'end-exploration':exploring=false;break;
   case 'next':s.step=Math.min(2,s.step+1);break;
   case 'previous':s.step=Math.max(0,s.step-1);break;
   case 'advance':case 'finish-trial':{const generated=makeSeries(c,condition().id,trial,s.seed);const size=(s.runs[runKey()]||[]).length;s.runs[runKey()]=generated.slice(0,action==='finish-trial'?generated.length:size+1);s.complete=false;message='Simulated observations recorded.';break;}
   case 'review-field':s.reviewed[condition().id]=true;message='Field reviewed. Your classifications are retained for analysis.';break;
   case 'next-cell':{const a=s.classifications[condition().id]||Array(20).fill(null);selected=a.findIndex(x=>x===null);if(selected<0)selected=0;break;}
   case 'share':{const url=new URL('investigation.html',site.root);url.searchParams.set('lab',c.id);url.searchParams.set('sources',s.sources.join(','));share=url.href;break;}
   case 'complete':if(!completedData(c,s)||!s.notes.prediction.trim()||!s.notes.design.trim()||s.notes.answers.some(x=>!x.trim())){message='Complete all data collection, prediction, design, and four explanation responses first.';}else{s.complete=true;message='Work marked complete on this device.';}break;
   case 'csv':download(c.id+'-data.csv',csv(),'text/csv');return;
   case 'report':download(c.id+'-report.txt',`${c.title}\nBiology 2e, chapter ${c.chapter}\n${s.complete?'Student marked complete':'Work in progress'} — not submitted or graded\n\nPrediction: ${s.notes.prediction}\n\nDesign: ${s.notes.design}\n\nObservations: ${s.notes.observations}\n\n${c.questions.map((q,i)=>`${i+1}. ${q}\n${s.notes.answers[i]}`).join('\n\n')}\n\nData:\n${csv()}\n\nModel limitation: ${c.model}`,'text/plain');return;
   case 'print':render();window.print();return;
   case 'reset':if(!confirm('Reset only this investigation’s saved work?'))return;s=fresh(c,s.sources);s.leafRuns={};s.yeastRuns={};s.microscopeRuns={};exploring=false;active=0;trial=1;selected=0;share='';message='This lab has been reset. Other labs are unchanged.';break;
  }
  save();render(['next','previous'].includes(action));
 });
 save();render();
 if('serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'}).catch(()=>{});
}
