import {setPlatformReport,platformReport} from '../platform/runtime-bridge.js';
import {createCompletionStatus} from './completion-status.js';
import {site} from '../site.js';
import {escape as e} from './visuals.js';
import {labId,title,phases,carriers,codons,stopCodons,checks,explanationPrompts,limits,freshGenetics,restoreGenetics,interact,phaseReady,canCompleteGenetics} from './genetics-model.js';
import {cellArt,moleculeIcon,trnaArt,dnaArt,transcriptArt,ribosomeArt} from './genetics-art.js';
import {workbench,motionFor,motionCopy,componentNames,componentNotes} from './genetics-workbench.js';
import {reportIdentityFields} from './report-identity.js';
import {geneticsReport,geneticsReportHtml,geneticsReportPdf,geneticsReportFilename} from './genetics-report.js';
import './genetics.css';
const button=(action,label,disabled=false)=>`<button type="button" data-gi-action="${action}" ${disabled?'disabled':''}>${label}</button>`;
const toolNames=componentNames;

export function bootGenetics(app){
 const key=`science-labs:${site.root.pathname}:${labId}:v1`;
 let s=freshGenetics(),message='',warning='',selected=null,drag=null,suppressClick=0,reportBusy=false,motion=null,motionTimer=null,lastMotion=null,printTitle=null;
 try{s=restoreGenetics(localStorage.getItem(key));}catch{warning='Storage is unavailable. Keep this tab open and download your report before leaving.';}
 let completion;
 setPlatformReport(()=>platformReport(geneticsReport(s)));
 function save(){
  let stored=true;
  try{localStorage.setItem(key,JSON.stringify(s));warning='';}
  catch{stored=false;warning='Your work could not be saved on this device. Download your report to keep a copy.';}
  const status=app.querySelector('.gi-storage');
  if(status)status.textContent=warning;
  completion?.persisted(stored);
  return stored;
 }
 completion=createCompletionStatus(app,()=>s,{
  selector:'[data-gi-action="complete"]',readyLabel:'Save completed explanation',savedLabel:'Work saved as complete',
  id:'gi-complete-feedback',statusClass:'gi-completion-status',errorClass:'gi-save-error'
 });
 const download=(name,type,text)=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
 function token(kind,id,label,art,sub=''){const token=kind+':'+id;return `<button type="button" class="gi-token ${selected===token?'selected':''}" data-token="${token}" aria-pressed="${selected===token}" aria-label="Select ${e(label)}${sub?'. '+e(sub):''}">${art}<b>${e(label)}</b>${sub?`<small>${sub}</small>`:''}</button>`;}
 function location(){return `<div class="gi-required"><p class="gi-kicker">REQUIRED · CHECK THE LOCATION</p><h3>Where does ${s.phase===1?'replication':s.phase===2?'transcription':'translation'} happen in this model?</h3><p>This model follows a gene stored in the nucleus.</p><div class="gi-choice-grid">${['nucleus','cytoplasm'].map(x=>`<button type="button" data-gi-action="location" data-value="${x}">${x==='nucleus'?'Inside the nucleus':'At a ribosome in the cytoplasm'}</button>`).join('')}</div></div>`;}
 function checkpoint(id){
  const q=checks[id],choice=s.checks[id],answered=Number.isInteger(choice),passed=choice===q.correct,feedbackId='gi-check-feedback-'+id;
  return `<fieldset class="gi-required"><legend>${passed?'Correct answer — checkpoint complete':'Required checkpoint — answer before continuing'}</legend>${q.context?`<p class="gi-check-context">${e(q.context)}</p>`:''}<h3>${e(q.prompt)}</h3>${q.choices.map((answer,i)=>{
   const chosen=choice===i;
   return `<button type="button" data-gi-action="check" data-value="${i}" class="gi-answer ${chosen?'chosen '+(passed?'correct':'needs-review'):''}" aria-pressed="${chosen}" ${chosen?`aria-describedby="${feedbackId}"`:''}>${chosen&&passed?'<span class="gi-answer-mark" aria-hidden="true">✓</span> ':''}${e(answer)}</button>`;
  }).join('')}${answered?`<p id="${feedbackId}" class="gi-check-feedback ${passed?'gi-success':'gi-retry'}"><strong>${passed?'Correct!':'Try again.'}</strong> ${e(q.feedback)}</p>`:''}</fieldset>`;
 }
 function component(value){
  const [kind,id]=value.split(':');
  if(kind==='base')return token(kind,id,id,`<span class="gi-base" data-base="${id}">${id}</span>`);
  if(kind==='trna'){const carrier=carriers.find(t=>t.id===id);return token(kind,id,'tRNA + '+carrier.short,trnaArt(carrier),`3′ ${carrier.anticodon} 5′`);}
  return token(kind,id,toolNames[id],moleculeIcon(id),componentNotes[id]);
 }
 function molecularScene(){
  const guide=workbench(s),copy=motion?motionCopy[motion.kind]:null;
  const heading=copy?copy[0]:guide.heading;
  const spot=({id,x,y,n,label})=>`<button type="button" class="gi-target gi-dna-site ${selected?'ready':''}" data-target="${id}" style="left:${x/680*100}%;top:${y/360*100}%" aria-label="${e(label)}"><span class="gi-site-number" aria-hidden="true">${n}</span></button>`;
  const art=s.phase===1?dnaArt(s,motion):s.phase===4?ribosomeArt(s,motion):transcriptArt(s,motion);
  const hint=`<p class="gi-dock-hint">${guide.nucleotideTray?'Drag a nucleotide to the polymerase, or select one and choose its marked site.':'Drag a component onto a numbered site. Or select it, then click or tap the site.'}</p>`;
  return `${heading?`<div class="gi-work-instruction"><p class="gi-work-title">${heading}</p>${copy?`<p>${motionText()}</p>`:guide.paragraphs.map(x=>`<p>${x}</p>`).join('')}</div>`:''}<div class="gi-molecule-stage ${s.phase===1?'gi-replication-stage':''}" role="group" aria-label="${e(phases[s.phase])} molecular model" data-animation="${motion?.kind||'none'}">${art}${!motion?guide.sites.map(spot).join(''):''}${guide.run&&!motion?`<button type="button" class="gi-run-enzyme" data-gi-action="finish-rna" style="left:${guide.run.x/680*100}%;top:${guide.run.y/360*100}%" aria-label="Let RNA polymerase finish the message">▶</button>`:''}</div>${guide.note&&!motion?`<section class="gi-model-note" role="note" aria-labelledby="gi-replication-model-note"><h3 id="gi-replication-model-note">This is a simplified model</h3>${guide.note.map(paragraph=>`<p>${e(paragraph)}</p>`).join('')}<p class="gi-small"><a href="https://openstax.org/books/biology-2e/pages/14-5-dna-replication-in-eukaryotes" target="_blank" rel="noopener">Learn more: OpenStax DNA replication</a></p></section>`:''}${guide.tools.length&&!motion?`<div class="gi-component-dock ${guide.nucleotideTray?'gi-nucleotide-dock':''}">${guide.nucleotideTray?'':hint}<div class="${guide.nucleotideTray?'gi-nucleotides':'gi-tool-tray'} ${guide.tools.some(x=>x.startsWith('trna:'))?'gi-translation-tray':''}" ${guide.nucleotideTray?'role="group" aria-label="Nucleotide choices"':''}>${guide.tools.map(component).join('')}</div>${guide.nucleotideTray?hint:''}<p class="gi-local-status" role="status">${e(message)}</p></div>`:''}${lastMotion&&!motion?`<div class="gi-replay">${button('replay-animation','Replay this action')}<span>Replay keeps your answers the same.</span></div>`:''}`;
 }
 function motionText(){return motion.kind==='deliver'&&motion.beforePeptide===0?'The first tRNA pairs with AUG and brings methionine. The model sets up the ribosome to read the next codon.':motionCopy[motion.kind][1];}
 function endMotion(focus=true){clearTimeout(motionTimer);motionTimer=null;motion=null;render(focus);}
 function showMotion(next){
  lastMotion=next;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){motion=null;return;}
  motion=next;clearTimeout(motionTimer);motionTimer=setTimeout(()=>endMotion(),next.duration);
 }
 function controls(){
  if([1,2,4].includes(s.phase)&&!s.locations[s.phase])return location();
  if(motion)return `<div class="gi-animation-panel"><p class="gi-kicker">WATCH THE MOLECULES WORK</p><h2>${motionCopy[motion.kind][0]}</h2><p>${motionText()}</p>${button('finish-animation','Show result now')}</div>`;
  const guide=workbench(s);
  const why={1:'Replication copies the DNA before a cell divides. Each original strand guides a new partner.',2:'Transcription uses a gene’s DNA to make RNA. The RNA carries a copy of the message.',3:'RNA processing prepares the message for use. The cap and tail help protect it. The exons stay in the message.',4:'Translation reads the mRNA code to build an amino acid chain. A tRNA carries an amino acid to a matching codon.'};
  return `<h2>${guide.heading}</h2><p>${why[s.phase]}</p>${guide.codon?`<p class="gi-kicker">CURRENT mRNA CODON</p><p class="gi-current-codon">${guide.codon}</p><details class="gi-code" open><summary>Codon guide</summary><p>AUG → methionine (start)<br>GCU → alanine<br>UUU → phenylalanine<br>AAA → lysine<br>${stopCodons.join(' / ')} → stop</p><p>Match the tRNA anticodon in the opposite direction. For example: codon 5′ AUG 3′ pairs with anticodon 3′ UAC 5′.</p></details>`:''}${s.phase===1&&s.repBases.length===6?checkpoint('replication'):''}`;
 }
 function intro(){return `<section class="gi-intro"><div><p class="gi-kicker">ONE CELL · THREE PROCESSES · TWO PURPOSES</p><h2>Follow information.<br>Keep track of the molecules.</h2><p>Work inside a model cell with a nucleus. A gene is a section of DNA with instructions. Copy DNA, then follow a gene’s message to a short chain of amino acids.</p><div class="gi-purpose-grid"><div><b>Copy for division</b><p>DNA → DNA<br>Replication copies genetic information.</p></div><div><b>Express a gene</b><p>DNA → RNA → peptide<br>A peptide is a short chain of amino acids.</p></div></div><p><strong>Cells use these processes for different jobs.</strong> A cell can read a gene many times without first copying its DNA.</p><label>Before you begin: how is information in DNA inside the nucleus used to make a protein? Does DNA directly assemble the protein, or do other processes use its information? Explain your prediction.<textarea data-writing="prediction" rows="3">${e(s.prediction)}</textarea></label>${button('next','Enter the nucleus →',!phaseReady(s))}</div><div class="gi-intro-cell">${cellArt(0)}<p>A model cell with a nucleus.<br>Original teaching illustration · not to scale.</p></div></section>`;}
 function recap(){return `<div class="gi-summary-grid"><section><span>01 / REPLICATION</span><h3>DNA → DNA</h3><p>In the nucleus. Each new DNA molecule has one original strand and one new strand.</p></section><section><span>02 / TRANSCRIPTION</span><h3>DNA → RNA</h3><p>In the nucleus. RNA copies a gene’s message. The prepared mRNA leaves through a nuclear pore. DNA stays inside.</p></section><section><span>03 / TRANSLATION</span><h3>RNA → peptide</h3><p>At a ribosome in the cytoplasm. mRNA codons guide the order of amino acids. The chain comes free at UAA.</p></section></div>`;}
 function final(){return `<section class="gi-final"><p class="gi-kicker">USE WHAT YOU BUILT</p><h2>Explain how the message was used</h2>${recap()}${checkpoint('transfer')}<div class="gi-writing">${explanationPrompts.map((q,i)=>`<label>${q}<textarea data-writing="${i}" rows="4">${e(s.explanations[i])}</textarea></label>`).join('')}</div>${button('complete',s.complete?'Work saved as complete':'Save completed explanation',!canCompleteGenetics(s))}${completion.html()}<p class="gi-small">Completion records your work. It does not assign a grade.</p></section><section class="gi-report"><p class="gi-kicker">KEEP YOUR WORK</p><h2>Your lab report</h2>${reportIdentityFields(s)}<div class="gi-actions">${button('pdf',reportBusy?'Preparing PDF…':'Download lab report (PDF)',reportBusy)}${button('print','Print lab report')}${button('json','Download responses (JSON)')}</div><p>Your report includes your prediction, results, evidence of learning, and written explanations. Work that is not finished is labeled In progress.</p></section>`;}
 function render(focus=false){
  const active=document.activeElement,attr=['data-token','data-target','data-gi-action'].find(a=>active?.hasAttribute(a));
  const focusSelector=attr?`[${attr}="${CSS.escape(active.getAttribute(attr))}"]${active.hasAttribute('data-value')?`[data-value="${CSS.escape(active.dataset.value)}"]`:''}`:null;
  const expanded=[...app.querySelectorAll('details[open]')].map(x=>x.id).filter(Boolean);
  document.title=title+' | Science Labs';
  app.innerHTML=`<div class="gi-lab"><a class="gi-skip" href="#gi-main">Skip to activity</a><header class="gi-header"><a href="./#/science/biology/genetics">← Genetics</a><span>SCIENCE LABS / MOLECULAR BIOLOGY</span>${button('pdf',reportBusy?'Preparing PDF…':'Download report (PDF)',reportBusy)}</header><main id="gi-main"><div class="gi-heading"><div><p class="gi-kicker">INFORMATION INSIDE THE CELL</p><h1 tabindex="-1">${title}</h1><p>Copy the instructions. Make the message. Read the code.</p></div><span class="gi-badge">VIRTUAL ONLY</span></div><ol class="gi-progress" aria-label="Lab stages">${phases.map((p,i)=>`<li class="${i===s.phase?'active':i<s.phase?'done':''}" ${i===s.phase?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span>${p}</li>`).join('')}</ol><p class="gi-status" role="status" aria-live="polite">${e(message)}</p><p class="gi-storage" role="alert">${e(warning)}</p>${s.phase===0?intro():s.phase===5?final():`<section class="gi-workgrid"><div class="gi-scene"><div class="gi-scene-heading"><span>${s.phase===4?'CYTOPLASM / RIBOSOME':s.phase===3&&s.exported?'NUCLEAR PORE → CYTOPLASM':'NUCLEUS / NUCLEAR GENE'}</span><span>SCHEMATIC MOLECULAR VIEW</span></div><div class="gi-molecular-view">${molecularScene()}</div><div class="gi-scene-caption"><b>${s.phase===1?'Copy both original strands':s.phase===2?'Use DNA to make an RNA message':s.phase===3?'Process the message; export mRNA':'Read mRNA; link amino acids'}</b><p>${s.phase===1?'Helicase opens the paired DNA and continues beyond this window. DNA polymerase extends a new strand from a supplied primer. Purple and gold backbones identify original and new DNA.':s.phase===2?'RNA polymerase reads one gene. It makes an RNA copy of that gene’s message. RNA uses U instead of T.':s.phase===3?'The exons stay in the message. The intron is removed. A cap and tail help protect the RNA.':'The ribosome is made of RNA and proteins. tRNAs carry amino acids. The mRNA sets their order.'}</p></div><div class="gi-location-context"><div>${cellArt(s.phase,s.exported)}</div><p><b>Where are we?</b><br>${s.phase===4?'The message is at a ribosome in the cytoplasm, outside the nucleus.':s.phase===3&&s.exported?'The mRNA just crossed the pore. DNA remains inside.':'Inside the nucleus. The nucleus has its own membrane inside the cell.'}</p></div></div><aside class="gi-console">${controls()}${phaseReady(s)&&!motion?button('next',s.phase===4?'Explain what you built →':'Continue →'):''}<p class="gi-interaction-hint">Drag a component to its target, or select it and click the target. Keyboard: Tab and Enter. ${selected?'Selected: '+e(selected.split(':')[1])+'.':''}</p></aside></section>`}<details id="gi-ideas" class="gi-ideas"><summary>Key terms & what the model leaves out</summary><p><a href="./resources/genetic-information-teacher-guide.pdf" download>Teacher guide (PDF)</a></p><dl><dt>Information arrows</dt><dd>DNA → RNA → peptide traces the use of information. DNA and RNA do not turn into amino acids. The ribosome joins amino acids supplied by tRNAs.</dd><dt>Enzymes and other helpers</dt><dd>An enzyme speeds up a cell reaction. The spliceosome is a team of RNA and proteins. A tRNA is an RNA carrier. A release factor is a helper protein.</dd><dt>Template</dt><dd>A strand used as a guide. Its bases determine which new bases fit.</dd><dt>5′ and 3′ (“five-prime” and “three-prime”)</dt><dd>These names mark the two different ends of DNA and RNA strands. A polymerase adds to the 3′ end. The new strand grows 5′ to 3′.</dd><dt>Codon and anticodon</dt><dd>A codon is a set of three mRNA bases. A tRNA has a matching three-base anticodon and carries an amino acid. A release factor recognizes a stop codon.</dd><dt>Nucleotide and amino acid</dt><dd>Nucleotides build DNA and RNA. Amino acids build peptides and proteins. They are different building blocks.</dd></dl><p>${limits}</p><p><a href="https://www.genome.gov/genetics-glossary/Transcription" target="_blank" rel="noopener">NHGRI: transcription</a> · <a href="https://www.genome.gov/genetics-glossary/Translation" target="_blank" rel="noopener">NHGRI: translation</a> · <a href="https://openstax.org/books/biology-2e/pages/14-3-basics-of-dna-replication" target="_blank" rel="noopener">Replication</a> · <a href="https://openstax.org/books/biology-2e/pages/15-4-rna-processing-in-eukaryotes" target="_blank" rel="noopener">RNA processing</a></p></details><footer class="gi-footer"><span>Virtual model · Your work stays on this device · No automatic grade</span>${button('reset','Reset this lab')}</footer></main></div>`;
  expanded.forEach(id=>{const el=app.querySelector('#'+id);if(el)el.open=true;});if(focus){app.querySelector('.gi-console h2,.gi-console h3,.gi-final h2,.gi-intro h2')?.setAttribute('tabindex','-1');app.querySelector('.gi-console h2,.gi-console h3,.gi-final h2,.gi-intro h2')?.focus({preventScroll:true});}else if(focusSelector){const target=app.querySelector(focusSelector)||app.querySelector('.gi-console h2,.gi-console h3');if(target){if(target.tagName!=='BUTTON')target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}}save();
  if([1,2,3,4].includes(s.phase)&&(s.phase===3||s.locations[s.phase])&&(motion||workbench(s).tools.length)){
   const view=app.querySelector('.gi-molecular-view'),bounds=view.getBoundingClientRect();
   if(bounds.top<12||bounds.bottom>innerHeight-12)view.scrollIntoView({block:'center',behavior:'instant'});
  }
 }
 function act(action,value=''){
  if(motion)return;
  const before=s,result=interact(s,action,value);s=result.state;completion.invalidate();message=result.message;
  if(result.accepted){selected=null;lastMotion=null;const next=motionFor(before,s,value);if(next)showMotion(next);}
  render(before.phase!==s.phase);
 }
 function select(value){
  selected=value;app.querySelectorAll('[data-token]').forEach(el=>{el.classList.toggle('selected',el.dataset.token===value);el.setAttribute('aria-pressed',String(el.dataset.token===value));});app.querySelectorAll('.gi-target').forEach(el=>el.classList.add('ready'));
  const label=app.querySelector(`[data-token="${CSS.escape(value)}"] b`)?.textContent||value.split(':')[1];
  app.querySelectorAll('.gi-interaction-hint,.gi-dock-hint').forEach(el=>el.textContent='Selected: '+label+'. Place it at a numbered work site.');
 }
 function place(target){if(motion)return;if(!selected){message='Select a component first. Then choose its work site.';render();return;}act('place',selected+'@'+target);}
 app.addEventListener('input',ev=>{const el=ev.target;if(['studentName','studentClass'].includes(el.dataset.reportField)){s[el.dataset.reportField]=el.value;save();return;}if(el.dataset.writing!==undefined){const wasComplete=s.complete;if(el.dataset.writing==='prediction')s.prediction=el.value;else if(['0','1'].includes(el.dataset.writing))s.explanations[+el.dataset.writing]=el.value;completion.invalidate();save();if(wasComplete){message='Your answers changed. Save the completed explanation again when you are ready.';app.querySelector('.gi-status').textContent=message;}const next=app.querySelector('[data-gi-action="next"]');if(next)next.disabled=!phaseReady(s);const complete=app.querySelector('[data-gi-action="complete"]');if(complete){complete.disabled=!canCompleteGenetics(s);complete.textContent='Save completed explanation';}}});
 app.addEventListener('click',async ev=>{
  if(Date.now()<suppressClick&&ev.detail>0)return;const el=ev.target.closest('button');if(!el||el.disabled)return;
  if(el.dataset.token){select(el.dataset.token);return;}if(el.dataset.target){place(el.dataset.target);return;}
  const action=el.dataset.giAction;if(!action)return;
  if(action==='finish-animation'){endMotion();return;}
  if(action==='replay-animation'){if(lastMotion){showMotion(lastMotion);render();}return;}
  if(motion&&['pdf','print','json'].includes(action))endMotion(false);
  if(action==='reset'){if(!confirm('Reset this lab’s saved choices and writing? Download your report first.'))return;clearTimeout(motionTimer);motion=null;lastMotion=null;s=freshGenetics();completion.invalidate();selected=null;message='A new attempt is ready.';render(true);return;}
  if(action==='complete'){
   if(canCompleteGenetics(s))completion.complete(save);
   return;
  }
  if(action==='json'){const report=platformReport(geneticsReport(s));download(geneticsReportFilename(report,'json'),'application/json',JSON.stringify(report,null,2));return;}
  if(action==='print'){preparePrint();window.print();return;}
  if(action==='pdf'){const report=platformReport(geneticsReport(s));reportBusy=true;render();try{const {downloadReportPdf}=await import('./lab-report-pdf.js');await downloadReportPdf(geneticsReportPdf(report),geneticsReportFilename(report));message='PDF report downloaded with your results and explanations.';}catch{message='PDF generation failed. Use Print lab report or save your responses as JSON.';}finally{reportBusy=false;render();}return;}
  act(action,el.dataset.value||'');
 });
 // Activate taps on release as well: some mobile browsers omit the click after a drag.
 // Suppress only its duplicate native click; a fresh press or keyboard action still works.
 app.addEventListener('pointerup',ev=>{
  if(ev.pointerType!=='touch'||drag?.moved)return;
  const el=ev.target.closest('button');if(!el||el.disabled)return;
  suppressClick=Date.now()+350;el.click();
 });
 app.addEventListener('pointerdown',ev=>{suppressClick=0;const el=ev.target.closest('[data-token]');if(!el||el.disabled||ev.button!==0)return;drag={id:ev.pointerId,token:el.dataset.token,x:ev.clientX,y:ev.clientY,moved:false};});
 const clearDrag=()=>{drag=null;document.querySelector('.gi-drag-ghost')?.remove();app.querySelectorAll('.gi-drop-hover').forEach(el=>el.classList.remove('gi-drop-hover'));};
 window.addEventListener('pointermove',ev=>{if(!drag||ev.pointerId!==drag.id)return;if(!drag.moved&&Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)>9){drag.moved=true;select(drag.token);const ghost=document.createElement('div');ghost.className='gi-drag-ghost';const source=app.querySelector(`[data-token="${CSS.escape(drag.token)}"]`);ghost.innerHTML=source?.innerHTML||e(drag.token.split(':')[1]);document.body.append(ghost);}if(!drag.moved)return;const ghost=document.querySelector('.gi-drag-ghost');ghost.style.transform=`translate(${ev.clientX+12}px,${ev.clientY+12}px)`;app.querySelectorAll('.gi-target').forEach(el=>el.classList.toggle('gi-drop-hover',el===document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-target]')));});
 window.addEventListener('pointerup',ev=>{if(!drag||ev.pointerId!==drag.id)return;const moved=drag.moved,target=document.elementFromPoint(ev.clientX,ev.clientY)?.closest('[data-target]');clearDrag();if(moved){suppressClick=Date.now()+350;if(target)place(target.dataset.target);else{message='Place the component on a marked site. You can also select it and click or tap the site.';app.querySelectorAll('.gi-status,.gi-local-status').forEach(el=>el.textContent=message);}}});
 window.addEventListener('pointercancel',clearDrag);
 function preparePrint(){const report=platformReport(geneticsReport(s));if(printTitle===null)printTitle=document.title;document.title=geneticsReportFilename(report).replace(/\.pdf$/,'');app.querySelector('.gi-print')?.remove();app.insertAdjacentHTML('beforeend',geneticsReportHtml(report));}
 window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',()=>{if(printTitle!==null){document.title=printTitle;printTitle=null;}});window.addEventListener('pagehide',save);
 render();if('serviceWorker' in navigator&&import.meta.env.PROD&&!import.meta.env.VITE_PLATFORM_RUNTIME)navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:'none'}).catch(()=>{});
}
