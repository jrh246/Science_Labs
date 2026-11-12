import test from 'node:test';
import assert from 'node:assert/strict';
import {labs,searchCatalog} from '../src/catalog.js';
import {translationTools} from '../src/investigations/genetics-workbench.js';
import {freshGenetics,interact,restoreGenetics,phaseReady,canCompleteGenetics,coding,template,complement,rna,carriers} from '../src/investigations/genetics-model.js';
import {geneticsReport,geneticsReportHtml,geneticsReportPdf,geneticsReportFilename,formatReportDateTime} from '../src/investigations/genetics-report.js';
function run(){let s=freshGenetics();s.prediction='The message moves; DNA stays.';const act=(a,v='')=>{const r=interact(s,a,v);s=r.state;return r;};return {act,get state(){return s;}};}
function replicate(r){r.act('next');r.act('location','nucleus');r.act('tool','helicase');r.act('tool','dna-polymerase');for(const b of 'ATGTTA')r.act('base',b);r.act('check','1');r.act('next');}
function express(r){r.act('location','nucleus');r.act('tool','rna-polymerase');for(const b of 'AUG')r.act('base',b);r.act('finish-rna');r.act('next');for(const t of ['cap','splice','tail'])r.act('tool',t);r.act('export','mrna');r.act('next');r.act('location','cytoplasm');r.act('load','mrna');for(const t of ['met','ala','phe'])r.act('trna',t);r.act('release');r.act('next');}
test('supplemental genetics lab is discoverable, separate from extraction and virtual only',()=>{
 const c=labs.find(x=>x.id==='genetic-information');assert.equal(c.unitId,'genetics');assert.deepEqual(c.modes,['Virtual']);assert.equal(c.virtualOnly,true);assert.ok(searchCatalog('transcribe').some(x=>x.id===c.id));assert.notEqual(c.launchUrl,labs.find(x=>x.id==='dna-replication').launchUrl);
});
test('DNA synthesis uses opposite templates and uracil is confined to RNA',()=>{
 assert.equal(complement(template),coding);assert.equal(rna,'AUGGCUUUUUAA');
 const r=run();r.act('next');assert.equal(r.act('tool','helicase').accepted,false);assert.equal(r.act('location','cytoplasm').accepted,false);r.act('location','nucleus');assert.equal(r.act('tool','dna-polymerase').accepted,false);r.act('tool','helicase');r.act('tool','dna-polymerase');assert.equal(r.act('base','U').accepted,false);for(const b of 'ATGTTA')assert.equal(r.act('base',b).accepted,true);
 assert.equal(phaseReady(r.state),false);r.act('check','0');assert.equal(phaseReady(r.state),false);r.act('check','1');r.act('next');r.act('location','nucleus');assert.equal(r.act('tool','dna-polymerase').accepted,false);r.act('tool','rna-polymerase');r.act('base','A');assert.equal(r.act('base','T').accepted,false);assert.equal(r.state.rnaBases,'A');r.act('base','U');r.act('base','G');assert.equal(r.state.rnaBases,'AUG');
});
test('mature mRNA crosses the pore and stop releases a peptide without adding an amino acid',()=>{
 const r=run();replicate(r);r.act('location','nucleus');r.act('tool','rna-polymerase');for(const b of 'AUG')r.act('base',b);r.act('finish-rna');r.act('next');assert.equal(r.act('export','mrna').accepted,false);for(const t of ['cap','splice','tail'])r.act('tool',t);assert.equal(r.act('export','dna').accepted,false);r.act('export','mrna');r.act('next');assert.equal(r.act('location','nucleus').accepted,false);r.act('location','cytoplasm');r.act('load','mrna');assert.equal(r.act('trna','lys').accepted,false);assert.equal(r.act('release').accepted,false);for(const t of ['met','ala','phe'])r.act('trna',t);assert.equal(r.act('trna','lys').accepted,false);assert.equal(r.state.peptide.length,3);r.act('release');assert.deepEqual(r.state.peptide,['Met','Ala','Phe']);assert.equal(r.state.released,true);
 for(const c of carriers)assert.equal([...c.anticodon].map(b=>({A:'U',U:'A',C:'G',G:'C'}[b])).join(''),c.codon);
});
test('replay preserves corrections and partial progress and rejects invented completion',()=>{
 const r=run();replicate(r);r.act('tool','dna-polymerase');express(r);r.act('check','0');r.act('check','1');const s=r.state;s.studentName='Zoë <script>';s.studentClass='2B';s.explanations=['RNA carries information.','Replication and expression have different purposes.'];s.complete=true;
 assert.ok(canCompleteGenetics(s));const restored=restoreGenetics(JSON.stringify(s));assert.deepEqual(restored,s);assert.equal(restored.history.filter(h=>!h.accepted).length,2);
 const fake=freshGenetics();fake.phase=5;fake.released=true;fake.complete=true;assert.equal(restoreGenetics(JSON.stringify(fake)).phase,0);assert.equal(restoreGenetics(JSON.stringify(fake)).complete,false);
 const report=geneticsReport(s),html=geneticsReportHtml(report),pdf=geneticsReportPdf(report);assert.equal(report.grading,'not_graded');assert.ok(html.includes('Zoë &lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.deepEqual(JSON.parse(Buffer.from(pdf.files.responses.src.split(',')[1],'base64').toString()),report);
});

test('replication enzyme placement requires the correct molecular site and survives replay',()=>{
 const r=run();r.act('next');assert.equal(r.act('place-enzyme','helicase@fork').accepted,false);r.act('location','nucleus');
 assert.equal(r.act('place-enzyme','helicase@primer').accepted,false);assert.equal(r.state.opened,false);
 assert.equal(r.act('place-enzyme','dna-polymerase@fork').accepted,false);assert.equal(r.act('place-enzyme','helicase@fork').accepted,true);
 assert.equal(r.act('place-enzyme','rna-polymerase@primer').accepted,false);assert.equal(r.act('place-enzyme','dna-polymerase@fork').accepted,false);assert.equal(r.state.repEnzyme,false);
 assert.equal(r.act('place-enzyme','dna-polymerase@primer').accepted,true);assert.equal(r.act('base','A').accepted,true);
 assert.deepEqual(restoreGenetics(JSON.stringify(r.state)),r.state);
 const report=geneticsReport(r.state),html=geneticsReportHtml(report),enzymes=report.evidence.find(row=>row.id==='enzymes');assert.equal(enzymes.status,'in_progress');assert.ok(enzymes.review);assert.ok(html.includes('Enzyme roles'));assert.ok(!html.includes('Place helicase at the strand junction'));
});

test('all spatial work sites validate the component, record corrections, and replay a complete attempt',()=>{
 const r=run(),put=(token,site)=>r.act('place',token+'@'+site);
 r.act('next');assert.equal(put('tool:helicase','fork').accepted,false);r.act('location','nucleus');put('tool:helicase','fork');put('tool:dna-polymerase','primer');for(const b of 'ATGTTA')assert.ok(put('base:'+b,'growing-dna').accepted);r.act('check','1');r.act('next');r.act('location','nucleus');
 assert.equal(put('tool:rna-polymerase','gene-body').accepted,false);assert.equal(r.state.transEnzyme,false);assert.ok(put('tool:rna-polymerase','promoter').accepted);for(const b of 'AUG')put('base:'+b,'growing-rna');r.act('finish-rna');r.act('next');
 for(const [token,wrong,right] of [['cap','three-prime','five-prime'],['splice','five-prime','intron'],['tail','intron','three-prime']]){assert.equal(put('tool:'+token,wrong).accepted,false);assert.equal(r.state.processing[token],false);assert.ok(put('tool:'+token,right).accepted);}
 assert.equal(put('molecule:dna','pore').accepted,false);assert.ok(put('molecule:mrna','pore').accepted);r.act('next');r.act('location','cytoplasm');assert.equal(put('molecule:dna','mrna-groove').accepted,false);assert.ok(put('molecule:mrna','mrna-groove').accepted);
 assert.equal(put('release:release','ribosome-site').accepted,false);assert.equal(put('trna:lys','ribosome-site').accepted,false);for(const t of ['met','ala','phe'])assert.ok(put('trna:'+t,'ribosome-site').accepted);assert.equal(put('trna:met','ribosome-site').accepted,false);assert.ok(put('release:release','ribosome-site').accepted);
 assert.deepEqual(restoreGenetics(JSON.stringify(r.state)),r.state);const report=geneticsReport(r.state),html=geneticsReportHtml(report);assert.ok(report.evidence.every(row=>row.status.startsWith('shown')));assert.equal(report.evidence.find(row=>row.id==='stop-signal').status,'shown_after_feedback');assert.ok(html.includes('Matched tRNAs'));assert.ok(!html.includes(' | '));assert.ok(!html.includes('@'));
});

test('translation choices shuffle by attempt while preserving carrier identity and checkpoint results',()=>{
 const ids=['trna:met','trna:ala','trna:phe','trna:lys','release:release'];
 const layouts=new Set();
 for(let i=0;i<20;i++){
  const id='attempt-'+i,order=translationTools(id);
  assert.deepEqual([...order].sort(),[...ids].sort());assert.equal(order.at(-1),'release:release');assert.deepEqual(translationTools(id),order);layouts.add(order.join(','));
 }
 assert.ok(layouts.size>1);assert.deepEqual(carriers.map(c=>c.id),['met','ala','phe','lys']);
 const r=run();assert.ok(geneticsReport(r.state).checkpoints.every(q=>q.correct===null));replicate(r);express(r);r.act('check','1');
 const restored=restoreGenetics(JSON.stringify(r.state));assert.deepEqual(translationTools(restored.attemptId),translationTools(r.state.attemptId));
 const report=geneticsReport(r.state),q=report.checkpoints.find(q=>q.id==='transfer');assert.equal(q.correct,true);assert.match(q.prompt,/replicate \(copy\).*transcribe an mRNA/);assert.match(q.context,/Transcription/);assert.equal(q.result,'Correct');assert.match(geneticsReportHtml(report),/Lab feedback:/);
});

test('report summarizes learning evidence and revisions, without navigation or a step log',()=>{
 const r=run();r.act('next');r.act('location','cytoplasm');r.act('location','nucleus');r.act('tool','helicase');r.act('tool','dna-polymerase');r.act('base','U');for(const b of 'ATGTTA')r.act('base',b);r.act('check','1');r.act('next');r.act('location','nucleus');r.act('tool','rna-polymerase');r.act('base','A');r.act('base','T');r.act('base','U');r.act('base','G');r.act('finish-rna');r.act('next');for(const tool of ['cap','splice','tail'])r.act('tool',tool);r.act('export','mrna');r.act('next');r.act('location','cytoplasm');r.act('load','mrna');for(const carrier of ['met','ala','phe'])r.act('trna',carrier);r.act('trna','lys');r.act('release');r.act('next');r.act('check','0');r.act('check','1');
 const report=geneticsReport(r.state,{exportedAt:'2026-11-12T00:35:00Z',timeZone:'America/Los_Angeles'}),html=geneticsReportHtml(report);
 assert.equal(report.schemaVersion,2);assert.equal(report.evidence.length,8);assert.equal(report.evidence.find(x=>x.id==='dna-pairing').status,'shown_after_feedback');assert.match(report.evidence.find(x=>x.id==='dna-pairing').review,/T rather than U/);assert.match(report.evidence.find(x=>x.id==='rna-pairing').review,/U rather than T/);assert.equal(report.evidence.find(x=>x.id==='stop-signal').status,'shown_after_feedback');assert.equal(report.evidence.find(x=>x.id==='codon-matching').status,'shown');assert.equal(report.checkpoints.find(x=>x.id==='transfer').result,'Correct after feedback');
 assert.ok(report.history.length>report.evidence.length);assert.ok(!html.includes('Actions and corrections'));assert.ok(!html.includes('Continue to the next process'));assert.ok(!html.includes('accepted'));assert.ok(!html.includes('2026-11-12T'));assert.match(html,/Nov 11, 2026, 4:35 PM PST/);
});
test('unfinished reports do not invent completed products or demonstrated skills',()=>{
 const blank=geneticsReport(freshGenetics()),html=geneticsReportHtml(blank);assert.ok(blank.evidence.every(row=>row.status==='not_recorded'));assert.ok(!html.includes('Met - Ala - Phe'));assert.ok(!html.includes('AUG GCU UUU UAA'));
 const r=run();replicate(r);r.act('location','nucleus');r.act('tool','rna-polymerase');r.act('base','A');const report=geneticsReport(r.state);assert.equal(report.evidence.find(x=>x.id==='rna-pairing').status,'in_progress');assert.equal(report.evidence.find(x=>x.id==='stop-signal').status,'not_recorded');assert.match(report.results.find(x=>x.process==='Transcription').result,/Student-built RNA section: A\./);
});
test('report filenames include safe student names and dates use a readable local time',()=>{
 const report=geneticsReport(freshGenetics());assert.equal(geneticsReportFilename(report),'genetic-information-lab-report.pdf');report.student.name='  Zoë   García  ';assert.equal(geneticsReportFilename(report),'genetic-information-Zoë-García-lab-report.pdf');assert.equal(geneticsReportFilename(report,'json'),'genetic-information-Zoë-García-responses.json');
 report.student.name='../Alex:*?"<>|/Jones\\';assert.equal(geneticsReportFilename(report),'genetic-information-Alex-Jones-lab-report.pdf');report.student.name='  ';assert.equal(geneticsReportFilename(report),'genetic-information-lab-report.pdf');report.student.name='A'.repeat(300);assert.ok(geneticsReportFilename(report).length<150);
 assert.equal(formatReportDateTime('2026-11-12T00:35:00Z','America/Los_Angeles'),'Nov 11, 2026, 4:35 PM PST');assert.match(formatReportDateTime('2026-07-12T00:35:00Z','America/Los_Angeles'),/Jul 11, 2026, 5:35 PM PDT/);
});
