import {createCompletionStatus} from './completion-status.js';
import {planReady,recordedPlan,recordInitialPlan,enterInvestigationStage,extendedHasWork,planningHistoryHtml} from './planning.js';
import {recordFeedback} from './report-feedback.js';
import {studentReportText,reportFilename} from './student-report.js';
import {extendedStudentReport} from './investigation-report.js';
import {installStudentReports,studentReportControls} from './report-controls.js';
import {reportIdentityFields,reportIdentityHtml} from './report-identity.js';
import {canReuseSetup,matchedSetup,samplingSummaries} from './learning-design.js';
import {punnettMarkup,checkPunnett} from './punnett.js';
import {benchArt,populationArt,meiosisArt} from './bench.js';
import './extended.css';
import {site} from '../site.js';
import {escape as e} from './visuals.js';
import {sequence,newRun,freshState,restoreState,advance,ready,result,record,specimens,mapping,chiSquare,csv} from './extended-model.js';
import {apparatusArt,specimenArt,lineGraph,comparisonGraph} from './extended-visuals.js';

export function bootExtended(c,app){
 const key=`science-labs:${site.root.pathname}:${c.kind==='asci'?'meiosis-variation':c.id}:${c.workflowVersion?'streamlined-v'+c.workflowVersion:c.kind==='meiosis'?'gametogenesis-v1':'original-v1'}`;
 let warning='',s;try{s=restoreState(c,localStorage.getItem(key));}catch{s=freshState(c);warning='Storage is unavailable. Download your report before leaving.';}
 let legacyChromosomes=null;if(c.kind==='meiosis'){try{legacyChromosomes=localStorage.getItem(key.replace('gametogenesis-v1','chromosomes-v3'))||localStorage.getItem(key.replace('gametogenesis-v1','chromosomes-v2'));}catch{}}
 let earlierWork=null;if(c.workflowVersion){try{earlierWork=localStorage.getItem(key.replace('streamlined-v'+c.workflowVersion,'original-v1'));}catch{}}
 let running=false,timer=null,exploring=Boolean(s.exploring),classroom=Boolean(s.classroom),message='',speed=1,busy=false,tool=null;
 const jobs=sequence(c),finished=()=>s.records.length===jobs.length;
 let completion;
 function save(){
  s.exploring=exploring;s.classroom=classroom;
  let stored=true;
  try{localStorage.setItem(key,JSON.stringify(s));warning='';}
  catch{stored=false;warning='Your work could not be saved on this device. Download your report to keep a copy.';}
  const status=app.querySelector('.ext-storage');
  if(status){status.textContent=warning;status.hidden=!warning;}
  completion?.persisted(stored);
  return stored;
 }
 completion=createCompletionStatus(app,()=>s,{selector:'[data-act="complete"]',readyLabel:'Mark work complete',savedLabel:'Work saved as complete'});
 function updatePlanningControls(){
  app.querySelectorAll('[data-act^="step-"]').forEach(button=>{
   button.disabled=busy||Number(button.dataset.act.slice(5))>0&&!planReady(s);
  });
  const checker=app.querySelector('[data-act="check-punnett"]');
  if(checker)checker.disabled=!planReady(s);
 }
 function goToStage(step){
  if(!enterInvestigationStage(s,step,extendedHasWork(s))){message='Required before continuing. Write your prediction and investigation design.';return false;}
  return true;
 }
 installStudentReports(app,()=>extendedStudentReport(c,s));
 const stop=()=>{clearInterval(timer);timer=null;running=false;};
 const button=(action,label,disabled=false,cls='')=>`<button type="button" data-act="${action}" ${disabled?'disabled':''} class="${cls}">${label}</button>`;
 const note=(key,label,value)=>`<label class="ext-writing">${label}<textarea data-note="${key}" rows="3">${e(value)}</textarea></label>`;
 const labels=()=>c.kind==='meiosis'?['Unchanged chromosome products','Recombined chromosome products']:c.categories||(c.kind==='gel'?['Largest band (bp)','Middle band (bp)','Smallest band (bp)']:c.kind==='regulation'?['Visible colonies','Fluorescence (0 absent, 1 present)']:[c.unit]);
 function materials(){return `<details id="classroom-options" class="ext-panel"><summary>Classroom options, materials and handouts</summary><p>${e(c.time)}</p><p>${e(c.materials)}</p>${recordedPlan(s)?`<ol>${c.physical.map(x=>`<li>${e(x)}</li>`).join('')}</ol>`:''}<p>Teachers may assign individual trials in person and others virtually. Keep methods, units and data sources separate. Classroom procedures require a teacher equipment and safety review before use.</p><p><a href="./resources/${c.id}-worksheet.pdf" download>Student worksheet (PDF)</a> · <a href="./resources/${c.id}-teacher-guide.pdf" download>Teacher guide (PDF)</a></p></details>${recordedPlan(s)?`<details id="evidence" class="ext-panel"><summary>Scientific references and model limitations</summary><p>${e(c.limits)}</p><p>Model version ${c.version}. Virtual data are simulated. Original apparatus and specimen illustrations. Supplier links identify references or optional materials; no affiliation is implied.</p><ul>${c.sources.map(([label,url])=>`<li><a href="${e(url)}" target="_blank" rel="noopener">${e(label)}</a></li>`).join('')}</ul></details>`:''}`;}
 function dataTable(rows){return `<div class="ext-scroll"><table><caption>Collected observations</caption><thead><tr><th>Treatment / sample</th>${c.kind==='meiosis'?'':'<th>Repeat</th>'}<th>Source</th>${labels().map(x=>`<th>${e(x)}</th>`).join('')}<th>Notes</th></tr></thead><tbody>${rows.map(x=>`<tr><th>${e(x.condition)}</th>${c.kind==='meiosis'?'':`<td>${x.repeat}</td>`}<td>${e(x.source)}</td>${x.values.map(v=>`<td>${Number(v).toFixed(Number.isInteger(v)?0:2)}</td>`).join('')}<td>${e(x.note)}</td></tr>`).join('')}</tbody></table></div>${c.kind==='meiosis'?rows.filter(x=>x.settings?.products).map(x=>`<section class="saved-products"><h3>${e(x.condition)} — saved cell products</h3><ul>${x.settings.products.map(p=>`<li><strong>${e(p.role)}</strong>: ${e(p.alleles)}</li>`).join('')}</ul></section>`).join(''):''}`;}
 function sampleComparison(rows){const summaries=samplingSummaries(c,rows);return summaries.length?`<div class="sample-comparison"><h3>Compare samples before pooling</h3><p>${e(c.learningPlan?.note||'')}</p><ul>${summaries.map(x=>`<li>${e(x.condition)} (${e(x.source)}, n=${x.total}): ${x.percent===null?'not estimable':x.percent.toFixed(1)+'%'} ${e(x.label)}</li>`).join('')}</ul></div>`:'';}
 function calculation(rows){
  if(c.kind==='meiosis')return '<h3>Compare allele combinations</h3><p>Both pathways start in a single diploid precursor cell. Crossing over exchanges DNA between nonsister chromatids already in that nucleus. Compare the saved products below: egg formation retains one functional egg and produces polar bodies; sperm formation produces four sperm. The table counts chromosome products, including polar bodies, not four functional eggs.</p>';
  if(c.categories)return `<h3>Calculations from your classifications</h3>${['virtual','classroom'].map(source=>{const a=rows.filter(x=>x.source===source);if(!a.length)return '';const totals=c.categories.map((_,i)=>a.reduce((sum,r)=>sum+r.values[i],0)),n=totals.reduce((a,b)=>a+b,0);return `<p>${source}: ${n} observations. ${c.categories.map((x,i)=>`${e(x)}: ${totals[i]}`).join('; ')}.</p><p>${c.kind==='corn'?`Expected purple ${(.75*n).toFixed(1)}, yellow ${(.25*n).toFixed(1)}. Chi-square = ${chiSquare(totals)?.toFixed(2)??'undefined'}. This is a discrepancy statistic, not a p-value or automatic conclusion.`:`${c.kind==='asci'?'Approximate gene-to-centromere distance (half the second-division percentage)':'Recombinant percentage (approximate map units for a short interval)'}: ${mapping(c.kind,totals)?.toFixed(1)??'undefined'}.`}</p>`;}).join('')}`;
  return `<h3>Compare your evidence</h3>${c.conditions.map((condition,i)=>['virtual','classroom'].map(source=>{const a=rows.filter(r=>r.conditionIndex===i&&r.source===source);if(!a.length)return '';if(c.kind==='gel')return `<p><strong>${e(condition)} (${source}, n=${a.length})</strong>: ${labels().map((label,j)=>`${e(label)} ${a.length>1?'mean ':''}${(a.reduce((sum,r)=>sum+r.values[j],0)/a.length).toFixed(0)}`).join('; ')}.</p>`;
   if(c.kind==='regulation')return `<p><strong>${e(condition)} (${source}, n=${a.length})</strong>: ${a.length>1?'mean ':''}${(a.reduce((sum,r)=>sum+r.values[0],0)/a.length).toFixed(1)} colonies; fluorescence observed in ${a.filter(r=>r.values[1]===1).length} of ${a.length} samples.</p>`;
   let values=a.map(r=>r.values[0]),unit=c.unit;
   if(c.kind==='plant'&&source==='virtual'){values=a.map(r=>r.values[0]-r.readings[0][1]);unit='cm growth from starting height';}
   if(c.kind==='enzyme'&&source==='virtual'){values=a.map(r=>(r.readings[1][1]-r.readings[0][1])/30);unit='mL/s initial collection rate';}
   return `<p><strong>${e(condition)} (${source}, n=${a.length})</strong>: ${c.kind==='extraction'?'ordinal scores '+values.join(', '):`${a.length>1?'mean ':''}${(values.reduce((a,b)=>a+b,0)/values.length).toFixed(2)} ${e(unit)}`}. ${c.kind==='extraction'?'Scores are categories, not concentrations.':''}</p>`;
  }).join('')).join('')}${c.kind==='gel'?'<p>Compare all three bands with their uncertainty. Use the ladder in each gel. A matching pattern alone does not identify a person.</p>':''}`;
 }
 function nextStep(r){
  if(r.prepared<c.steps.length)return `Next: ${c.steps[r.prepared]}.`;
  if(['corn','flies'].includes(c.kind))return 'Inspect the whole sample, tally each phenotype, then review the tally total.';
  if(c.kind==='meiosis')return 'Finish the cell products, then save this pathway. Complete egg formation and sperm formation once each.';
  if(c.categories){const remaining=c.count-r.scores.filter(Number.isInteger).length;return remaining?`Classify ${remaining} remaining specimen${remaining===1?'':'s'}.`:'Review classifications before collecting. You may revise any specimen.';}
  if(c.kind==='microscope')return Math.abs(r.focus-50)>12?'Adjust fine focus until the cell is clear.':r.objective!==40?'Switch to the 40x objective, then match the ruler to the cell.':'Match the ruler endpoint to the cell, then collect your measurement.';
  if(r.time<c.duration)return `Run the sample through ${c.duration} ${c.timeUnit}. You can pause or advance the timer.`;
  if(c.kind==='gel')return !r.stained?'Power off and stain the gel to reveal its bands.':'Use the ladder to estimate all three unknown fragment sizes.';
  if(['expression','regulation'].includes(c.kind)&&!r.viewer)return 'Turn on the viewer to inspect the completed sample.';
  return 'Ready to collect.';
 }
 function countWorkspace(r){const values=specimens(c,r),enabled=r.prepared===c.steps.length;return `<div class="ext-count"><div class="ext-specimen">${enabled?specimenArt(c.kind,values[r.selected]):'<p>Prepare the specimen to begin.</p>'}</div><p>Specimen ${r.selected+1} of ${c.count}. ${r.scores.filter(Number.isInteger).length} classified.</p><div class="ext-controls">${c.categories.map((label,i)=>button('score-'+i,label,!enabled,r.scores[r.selected]===i?'chosen':'')).join('')}</div><div class="ext-specimen-grid ${c.kind}">${values.map((v,i)=>`<button type="button" data-act="select-${i}" aria-label="Specimen ${i+1}${Number.isInteger(r.scores[i])?', classified':''}" aria-pressed="${r.selected===i}" ${!enabled?'disabled':''}>${enabled?specimenArt(c.kind,v):''}<span>${i+1}${Number.isInteger(r.scores[i])?' ✓':''}</span></button>`).join('')}</div>${button('review','Review classifications',r.scores.filter(Number.isInteger).length!==c.count)}${r.reviewed?`<p>Review: ${r.scores.filter((x,i)=>x===values[i]).length} of ${c.count} match the illustration key. ${r.scores.map((x,i)=>x!==values[i]?`${i+1}: illustration suggests ${c.categories[values[i]]}`:'').filter(Boolean).join('; ')||'All agree.'} Your classifications are preserved; revise any item or collect with notes.</p>`:''}</div>`;}
 function classroomWorkspace(){return `<section class="ext-panel"><h3>Record classroom observations</h3><p>Enter ${e(c.conditions[s.run.conditionIndex])} measurements in the units shown. Describe alternative units, starting measurements and time-series readings on your worksheet and in the notes; do not substitute ordinal brightness for numerical fluorescence.</p><form id="classroom-form">${labels().map((label,i)=>`<label>${e(label)}<input name="value-${i}" type="number" step="${c.categories||['extraction','regulation','meiosis'].includes(c.kind)?1:'any'}" min="0" ${c.kind==='extraction'?'max="3"':c.kind==='regulation'&&i===1?'max="1"':''} required></label>`).join('')}<label>Method, controls, starting measurements and uncertainties<textarea name="observation" rows="3" required></textarea></label><button class="ext-collect" type="submit">Save classroom data and continue</button></form></section>`;}
 function collector(){const r=s.run;return `<section class="ext-panel"><p class="eyebrow">${exploring?'EXPLORATION':`${c.kind==='meiosis'?'PATHWAY':'GUIDED COMPARISON'} · ${s.records.length+1} OF ${jobs.length}`}</p><h2>${e(c.conditions[r.conditionIndex])}</h2><p>${c.kind==='meiosis'?'':`Repeat ${r.repeat} of ${c.repeats}. `}${e(c.setup)}</p>${!exploring?button('source',classroom?'Use virtual apparatus':'Use classroom observations',running||busy):`<label>Explore a condition<select data-control="condition">${c.conditions.map((x,i)=>`<option value="${i}" ${i===r.conditionIndex?'selected':''}>${e(x)}</option>`).join('')}</select></label><p>Changing condition starts a fresh exploratory sample. Comparison data stay saved.</p>`}
 ${classroom?classroomWorkspace():`${canReuseSetup(c,s)?`<div class="ext-panel reuse-setup"><p>You have already practiced this setup. Prepare a fresh <strong>${e(c.conditions[r.conditionIndex])}</strong> sample using the same procedure; its observations are still yours to collect.</p>${button('reuse-setup','Prepare next matched sample')}</div>`:''}${r.preparation==='matched'?'<p class="preparation-source">Fresh simulated sample prepared by the matched procedure. No observations have been copied.</p>':''}<div class="ext-workspace"><div><div class="ext-apparatus">${c.kind==='meiosis'?meiosisArt(c,r,busy):c.kind==='corn'?populationArt(c,r):c.kind==='asci'?'':benchArt(c,r,{busy,tool,running})}</div>${c.kind==='asci'?`<div class="ext-controls">${c.steps.map((step,i)=>button('prepare-'+i,step,busy||i!==r.prepared)).join('')}</div>${countWorkspace(r)}`:''}${c.kind==='flies'?populationArt(c,r):''}<p class="ext-next-step">${e(nextStep(r))}</p></div><div class="ext-console">${c.kind==='meiosis'?'<h3>Chromosome bench</h3><p>The large outer boundary is one precursor cell. The inner boundary is its nucleus, containing BOTH homologs before division. Blue Homolog 1 and orange Homolog 2 are already present in this parent’s diploid cell; they are not separate egg and sperm cells.</p><p>Two sister chromatids make one replicated chromosome. Select one nonsister chromatid from each homolog for an exchange.</p><p>In meiosis I, homologs separate. In meiosis II, sisters separate. Each final chromosome product gets one chromatid from this pair. In oogenesis only one product is the egg; the others are polar bodies.</p>':''}${c.categories?`<h3>Trait reference</h3><p>Compare the visible traits with these references before tallying. These reference drawings show the scoring features.</p>${c.categories.map((label,i)=>`<div class="ext-reference">${specimenArt(c.kind,i)}<span>${e(label)}</span></div>`).join('')}`:''}
 ${c.kind==='microscope'?`<label>Objective<select data-control="objective"><option value="10" ${r.objective===10?'selected':''}>10x</option><option value="40" ${r.objective===40?'selected':''}>40x</option></select></label><label>Fine focus<input data-control="focus" type="range" min="0" max="100" value="${r.focus}"></label><label>Ruler endpoint (scale divisions)<input data-control="ruler" type="range" min="1" max="100" step=".5" value="${r.ruler}"></label><p>${r.ruler} divisions × 2 µm/div = ${(r.ruler*2).toFixed(1)} µm at 40x.</p><p>Match the red ruler to the selected cell length. Arrow keys provide fine adjustments.</p>`:''}
 ${['enzyme','gel'].includes(c.kind)?`<label>${c.kind==='gel'?'Voltage':'Bath temperature (C)'}<input data-control="setting" type="number" min="${c.kind==='gel'?60:10}" max="${c.kind==='gel'?100:40}" value="${r.setting}" ${!exploring||r.time>0?'disabled':''}></label>`:''}
 ${c.duration?`<p class="ext-clock">${r.time.toFixed(c.timeUnit==='days'?1:0)} <small>${e(c.timeUnit)}</small></p><p>Simulated time · accelerated</p><label>Timer speed<select data-control="speed"><option value="1" ${speed===1?'selected':''}>Standard</option><option value="4" ${speed===4?'selected':''}>4x faster</option></select></label><div class="ext-controls">${button('start',running?'Pause':'Start / resume',r.prepared!==c.steps.length||r.time>=c.duration)}${button('advance',`Advance ${c.interval} ${c.timeUnit}`,r.prepared!==c.steps.length||r.time>=c.duration)}${button('finish','Run remaining time',r.prepared!==c.steps.length||r.time>=c.duration)}</div>`:''}
 ${['expression','regulation'].includes(c.kind)?button('viewer',r.viewer?'Turn viewer off':'Turn viewer on',r.prepared<c.steps.length):''}
 ${c.kind==='gel'?`${button('stain','Power off and stain gel',r.time<c.duration||r.stained)}${r.stained?`<p>The ruler is marked every 5 mm. Measure from wells to bands. Interpolate between ladder bands on a log-size scale.</p>${['Largest','Middle','Smallest'].map((name,i)=>`<label>${name} unknown fragment (bp)<input data-estimate="${i}" type="number" min="1" max="100000" value="${e(r.estimates[i])}"></label>`).join('')}`:''}`:''}
 </div></div>${c.duration&&r.readings.length&&c.kind!=='gel'?`<details id="live-readings"><summary>Readings and live graph</summary>${lineGraph(r.readings,c.unit,c.timeUnit)}<table><thead><tr><th>${e(c.timeUnit)}</th><th>${e(c.unit)}</th></tr></thead><tbody>${r.readings.map(([t,v])=>`<tr><td>${t}</td><td>${v}</td></tr>`).join('')}</tbody></table></details>`:''}
 ${note('run-note','Observation notes',r.note)}<div class="ext-advance"><p><strong>${e(ready(c,r)?'Ready to collect.':nextStep(r))}</strong> ${c.kind==='meiosis'?'Save this pathway to continue through the activity.':'Click Collect data and continue to save this sample and advance.'}</p>${button('collect',exploring?'Save exploration and start fresh':c.kind==='meiosis'?(r.conditionIndex===0?'Save egg pathway and start sperm formation':'Save sperm pathway and compare'):'Collect data and continue',!ready(c,r),'ext-collect')}</div>`}</section>`;}
 function render(){
 if(!enterInvestigationStage(s,s.step,extendedHasWork(s)||s.step>0)){stop();s.step=0;exploring=false;}
 const open=[...app.querySelectorAll('details[open]')].map(x=>x.id),active=document.activeElement,focusAttr=['data-report-field','data-control','data-note','data-estimate','data-act'].find(k=>active?.hasAttribute(k)),focusKey=focusAttr?active.getAttribute(focusAttr):null,selection=(active?.tagName==='TEXTAREA'||active?.hasAttribute('data-report-field'))?[active.selectionStart,active.selectionEnd]:null;document.title=c.title+' | Science Labs';
 app.innerHTML=`<a href="#ext-main" class="skip-link">Skip to lab</a><header class="ext-header"><a href="./#/science/biology/${c.chapter<11?'the-cell':'genetics'}">← Back to unit</a><a href="./#/search">Search labs</a></header><main id="ext-main" class="ext-main"><p class="eyebrow">BIOLOGY · CHAPTER ${c.chapter} READING CONNECTION</p><h1>${e(c.title)}</h1><p>${e(c.question)}</p><nav class="ext-tabs" aria-label="Investigation stages">${['1. Predict and plan','2. Collect observations','3. Analyze evidence'].map((label,i)=>button('step-'+i,label,busy||i>0&&!planReady(s),s.step===i?'chosen':'')).join('')}</nav><p role="status" class="ext-message">${e(message)}</p><p class="ext-storage" role="status" ${!warning?'hidden':''}>${e(warning)}</p>
 ${earlierWork?`<p class="ext-panel">The shorter comparison starts separately. Your earlier multi-trial work is still saved. ${button('earlier-work','Download earlier multi-trial work')}</p>`:''}${legacyChromosomes?`<p class="ext-panel">This egg-and-sperm activity starts separately from the earlier three-model activity. Your earlier work remains saved. ${button('legacy-chromosomes','Download earlier crossing-over work')}</p>`:''}${s.step===0?`<section class="ext-panel"><h2>Before you investigate</h2><p>${e(c.intro)}</p><p>${e(c.setup)}</p>${c.learningPlan?`<p class="learning-purpose"><strong>Why this amount of work?</strong> ${e(c.learningPlan.note)}</p>`:''}<p>Required before continuing. Write what you expect and why. Describe your controls, variables, or sampling plan.</p>${planningHistoryHtml(s)}${c.kind==='corn'?`<p>Optional practice. Write your prediction and design before checking the Punnett square.</p>${punnettMarkup(s.punnett)}`:''}${note('prediction','Prediction — what do you expect, and why?',s.prediction)}${note('design','Investigation design — controls, variables and sampling',s.design)}${button('step-1','Begin observations',!planReady(s))}</section>`:s.step===1?(finished()&&!exploring?`<section class="ext-panel"><h2>${c.kind==='meiosis'?'Egg and sperm pathways complete':'Comparison complete'}</h2><p>${c.kind==='meiosis'?'Both pathways saved.':`All ${jobs.length} samples collected.`} Analyze evidence or explore a fresh sample.</p>${button('step-2','Analyze evidence')}${button('explore','Explore other settings')}</section>${comparisonGraph(c,s.records)}${dataTable(s.records)}`:collector()):`<section class="ext-panel"><h2>Analyze your evidence</h2><p>Compare your results with your first prediction. Use your observations to explain what you would keep or revise.</p>${planningHistoryHtml(s)}<p>${s.records.length} of ${jobs.length} ${c.kind==='meiosis'?'pathways saved':'required samples collected'}.</p>${comparisonGraph(c,s.records)}${dataTable(s.records)}${sampleComparison(s.records)}${calculation(s.records)}${c.analysis.map((q,i)=>note('answer-'+i,q,s.answers[i])).join('')}${button('complete','Mark work complete',!finished())}${completion.html()}${finished()?button('explore','Explore other settings'):''}</section>`}
 ${s.exploration.length?`<details id="exploration-data" class="ext-panel"><summary>Saved exploration (${s.exploration.length})</summary>${dataTable(s.exploration)}</details>`:''}${reportIdentityFields(s)}${studentReportControls()}<div class="ext-controls ext-export">${button('csv','Download observations CSV')}${button('report','Download lab report (.txt)')}${button('reset','Reset this lab',busy)}</div>${c.kind==='meiosis'?'<details class="ext-panel"><summary>Optional extension: evidence from ordered spores</summary><p>Infer crossing over from Sordaria spore patterns after completing the chromosome model.</p><a href="./investigation.html?lab=sordaria-crossing-over">Open the Sordaria extension</a><p>Earlier saved spore-lab work is available in the extension.</p></details>':''}${materials()}<p class="ext-footnote">Virtual data are instructional simulations. Teacher guides are public.</p></main>`;
 open.forEach(id=>{const el=document.getElementById(id);if(el)el.open=true;});if(focusAttr&&focusKey!==null){const target=app.querySelector(`[${focusAttr}="${focusKey}"]`);target?.focus({preventScroll:true});if(selection&&target)target.setSelectionRange(...selection);}updatePlanningControls();save();}
 function tick(delta){if(!exploring)completion.invalidate();s.run=advance(c,s.run,delta);if(s.run.time>=c.duration)stop();render();}
 function collectRow(row){stop();tool=null;if(exploring){s.exploration.push(row);s.run=newRun(c,0,(s.seed+s.exploration.length*104729)>>>0,s.run.conditionIndex);message='Exploration saved. Prepare a fresh sample.';}else{completion.invalidate();s.records.push(row);s.run=newRun(c,s.records.length,s.seed);message=finished()?'Comparison complete. Data recorded.':'Data recorded. Prepare the next sample.';}render();}
 function download(name,type,content){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 app.addEventListener('input',ev=>{
  const el=ev.target;
  if(['studentName','studentClass'].includes(el.dataset.reportField)){
   s[el.dataset.reportField]=el.value;save();
   app.querySelectorAll('.report-identity-summary').forEach(node=>{node.outerHTML=reportIdentityHtml(s);});
   return;
  }
  if(el.dataset.note){
   const key=el.dataset.note;
   if(key==='run-note')s.run.note=el.value;
   else if(key.startsWith('answer-'))s.answers[Number(key.slice(7))]=el.value;
   else s[key]=el.value;
   if(key!=='run-note'||!exploring)completion.invalidate();
   save();updatePlanningControls();
  }else if(el.dataset.estimate!==undefined){
   s.run.estimates[+el.dataset.estimate]=el.value;
   if(!exploring)completion.invalidate();
   save();
  }else if(el.closest('#classroom-form')){
   if(!exploring)completion.invalidate();
   save();
  }
 });
 app.addEventListener('change',ev=>{const el=ev.target,r=s.run;if(el.dataset.punnett!==undefined&&c.kind==='corn'){const k=el.dataset.punnett;if(['purple','yellow'].includes(k))s.punnett[k]=el.value;else s.punnett.cells[Number(k)]=el.value;completion.invalidate();save();app.querySelector('#punnett-feedback').textContent='';return;}if(el.dataset.estimate!==undefined){render();return;}if(!el.dataset.control||!planReady(s)||s.step!==1)return;const k=el.dataset.control,v=Number(el.value);if(!Number.isFinite(v))return;
 if(k!=='speed'&&!exploring)completion.invalidate();
 if(k==='condition'){stop();s.run=newRun(c,0,s.seed+s.exploration.length*104729,v);}else if(k==='speed')speed=v===4?4:1;
 else if(k==='objective'){if(v===40&&(r.prepared<c.steps.length||Math.abs(r.focus-50)>12))message='Prepare and focus at low power before switching to 40x.';else r.objective=v===40?40:10;}
 else if(k==='setting'){if(exploring&&r.time===0)r.setting=Math.max(c.kind==='gel'?60:10,Math.min(c.kind==='gel'?100:40,v));}
 else if(k==='focus')r.focus=Math.max(0,Math.min(100,v));else if(k==='ruler'){r.ruler=Math.max(1,Math.min(100,v));r.rulerMeasured=true;}render();});
 app.addEventListener('submit',ev=>{if(ev.target.id!=='classroom-form')return;ev.preventDefault();if(!planReady(s)||s.step!==1)return;const form=new FormData(ev.target),values=labels().map((_,i)=>Number(form.get('value-'+i)));if(values.some(x=>!Number.isFinite(x)||x<0))return;if(c.categories&&values.reduce((a,b)=>a+b,0)===0){message='Enter at least one classified specimen.';render();return;}collectRow(record(c,s.run,'classroom',values,String(form.get('observation'))));});
 app.addEventListener('click',async ev=>{const b=ev.target.closest('[data-act]');if(!b||b.disabled||busy)return;const a=b.dataset.act,r=s.run;message='';
 const sampleAction=!a.startsWith('step-')&&!['earlier-work','legacy-chromosomes',
  'check-punnett','complete','reset','csv','report'].includes(a);
 if(sampleAction&&(!planReady(s)||s.step!==1&&a!=='explore'))return;
 if(sampleAction&&!exploring&&a!=='explore')completion.invalidate();
 if(a==='earlier-work'&&earlierWork){download(c.id+'-earlier-work.json','application/json',earlierWork);return;}
 else if(a==='reuse-setup'){if(!canReuseSetup(c,s)||classroom)return;stop();tool=null;s.run=matchedSetup(c,r);message='Fresh matched sample prepared. Inspect and collect its own observations.';}
 else if(a==='legacy-chromosomes'&&legacyChromosomes){download('crossing-over-earlier-work.json','application/json',legacyChromosomes);return;}
 else if(a==='check-punnett'&&c.kind==='corn'){
  if(!recordInitialPlan(s,extendedHasWork(s))){message='Write your prediction and investigation design before checking the square.';render();return;}
  recordFeedback(s,{
   topic:'inheritance-prediction',sample:'punnett',label:'Inheritance prediction',
   responses:[...s.punnett.cells,s.punnett.purple,s.punnett.yellow],
   expected:['PP','Pp','Pp','pp','3','1']
  });
  save();
  app.querySelector('#punnett-feedback').textContent=checkPunnett(s.punnett);
  return;
 }
 else if(a.startsWith('tool-')){tool=+a.slice(5);}
 else if(a.startsWith('ear-')){if(+a.slice(4)!==r.conditionIndex)return;r.prepared=1;}
 else if(a.startsWith('region-')){r.region=+a.slice(7);r.prepared=c.steps.length;}
 else if(a.startsWith('inspect-'))r.selected=+a.slice(8);
 else if(a.startsWith('mark-')){const i=+a.slice(5);r.marks=r.marks.includes(i)?r.marks.filter(x=>x!==i):[...r.marks,i];
 // Keep the corn specimen mounted so marking does not restart its arrival animation.
 if(c.kind==='corn'){const marked=r.marks.includes(i);b.classList.toggle('marked',marked);b.setAttribute('aria-pressed',String(marked));b.setAttribute('aria-label',`Kernel ${i+1}${marked?', marked':''}`);b.querySelector('span').textContent=marked?'✓':String(i+1);save();app.querySelector('.ext-message').textContent=warning;return;}}
 else if(a.startsWith('tally-')){const [,op,index]=a.split('-'),i=+index;r.tallies[i]=Math.max(0,Math.min(c.count||4,r.tallies[i]+(op==='plus'?1:-1)));r.reviewed=false;}
 else if(a.startsWith('chromatid-')){const i=+a.slice(10);r.chromatids=[...r.chromatids.filter(x=>Math.floor(x/2)!==Math.floor(i/2)),i].sort();}
 else if(a.startsWith('cut-'))r.cut=+a.slice(4);
 else if(a.startsWith('egg-side-')&&r.prepared===2)r.eggSide=+a.slice(9);
 else if(a==='egg-resume'&&r.conditionIndex===0&&r.prepared===3)r.eggActivated=true;
 else if(a==='mature-sperm'&&r.conditionIndex===1&&r.prepared===4)r.spermMature=true;
 else if(a.startsWith('pick-gamete-')){if(r.conditionIndex===0&&!r.eggActivated)return;r.carry=+a.slice(12);}
 else if(a.startsWith('place-gamete-')){const i=+a.slice(13);if(r.carry===null||r.placed[i]!=null||(r.conditionIndex===0&&!r.eggActivated))return;if(Math.floor(r.carry/2)!==Math.floor(i/2)){message='Keep the two meiosis I cells separate: choose a gamete below the matching cell.';render();return;}r.placed[i]=r.carry;r.carry=null;if(r.placed.filter(Number.isInteger).length===4)r.prepared=4;}
 else if(a.startsWith('mei-')){busy=true;render();app.querySelector('.exchange-animation, .chromosome-pair')?.scrollIntoView({block:'center'});await new Promise(resolve=>setTimeout(resolve,matchMedia('(prefers-reduced-motion: reduce)').matches?50:(a==='mei-exchange'?2400:1400)));busy=false;r.prepared++;render();app.querySelector('.meiosis-instruction')?.scrollIntoView({block:'start'});return;}
 else if(a.startsWith('step-')){if(!goToStage(Number(a.slice(5)))){render();return;}stop();if(exploring){exploring=false;s.run=newRun(c,s.records.length,s.seed);}}
 else if(a.startsWith('lane-')){const i=+a.slice(5);if(r.prepared!==1||tool!==1||r.lanes.includes(i))return;r.loadingLane=i;busy=true;render();await new Promise(resolve=>setTimeout(resolve,900));busy=false;r.lanes.push(i);if(r.lanes.length===4){r.prepared++;tool=null;}}
 else if(a.startsWith('prepare-')){if(+a.slice(8)!==r.prepared)return;busy=true;render();await new Promise(resolve=>setTimeout(resolve,1100));busy=false;
 if((c.kind==='extraction'&&r.prepared===0&&r.conditionIndex!==2)){r.strokes=(r.strokes||0)+1;if(r.strokes<3){message=`${r.strokes} of 3 passes completed. Use the tool again.`;render();return;}r.strokes=0;}
 r.prepared++;tool=null;if(r.prepared===c.steps.length&&c.kind==='enzyme'){s.run=advance(c,r,0);running=true;timer=setInterval(()=>tick(c.duration/120*speed),500);}}
 else if(a==='start'){if(running)stop();else{running=true;timer=setInterval(()=>tick(c.duration/120*speed),500);}}
 else if(a==='advance'){stop();s.run=advance(c,r,c.interval);}else if(a==='finish'){stop();s.run=advance(c,r,c.duration-r.time);}
 else if(a==='viewer')r.viewer=!r.viewer;else if(a==='stain'){stop();r.stained=true;}
 else if(a.startsWith('select-'))r.selected=Number(a.slice(7));
 else if(a.startsWith('score-')){r.scores[r.selected]=Number(a.slice(6));r.reviewed=false;const next=Array.from({length:c.count},(_,i)=>i).find(i=>!Number.isInteger(r.scores[i]));if(next!==undefined)r.selected=next;}
 else if(a==='review'){
  if(c.kind==='asci')recordFeedback(s,{
   topic:'spore-patterns',sample:String(r.seed),
   label:c.conditions[r.conditionIndex]+' virtual spore classifications',
   responses:r.scores,expected:specimens(c,r),scope:exploring?'exploration':'comparison'
  });
  r.reviewed=true;
 }
 else if(a==='collect'){if(!ready(c,r))return;collectRow(record(c,r,'virtual',result(c,r),r.note));return;}
 else if(a==='source'){stop();classroom=!classroom;}
 else if(a==='explore'){if(!finished()||!goToStage(1))return;stop();tool=null;exploring=true;classroom=false;s.step=1;s.run=newRun(c,0,s.seed+s.exploration.length*104729+987);}
 else if(a==='complete'){if(!finished()||!planReady(s)||!s.answers.every(x=>x.trim()))message='Complete your prediction, investigation design, required samples, and three explanations first.';else{completion.complete(save);return;}}
 else if(a==='reset'){if(!confirm('Clear this lab’s saved observations and writing? Download your report first.'))return;stop();s=freshState(c);completion.invalidate();exploring=false;classroom=false;}
 else if(a==='csv'){const rows=[['Lab','Dataset','Treatment','Repeat','Source','Model version','Measurement','Value','Unit','Time','Time unit','Notes']];for(const [group,data] of [['comparison',s.records],['exploration',s.exploration]])for(const rec of data){rec.values.forEach((value,i)=>rows.push([c.title,group,rec.condition,rec.repeat,rec.source,rec.modelVersion,labels()[i],value,c.unit,'','',rec.note]));if(c.kind==='meiosis')for(const [i,product] of (rec.settings?.products||[]).entries())rows.push([c.title,group,rec.condition,'',rec.source,rec.modelVersion,product.role+' '+(i+1),product.alleles,'allele combination','','',rec.note]);for(const [t,v] of rec.readings)rows.push([c.title,group,rec.condition,rec.repeat,rec.source,rec.modelVersion,'time series',v,c.unit,t,c.timeUnit,rec.note]);}download(c.id+'-observations.csv','text/csv',csv(rows));}
 else if(a==='report'){const report=extendedStudentReport(c,s);download(reportFilename(report,'txt'),'text/plain',studentReportText(report));}
 render();});
 window.addEventListener('pagehide',()=>{stop();save();});render();
 if('serviceWorker' in navigator&&import.meta.env.PROD)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'}).catch(()=>{});
}
