import test from 'node:test';
import assert from 'node:assert/strict';
import {reportAttempt,reportLabIds} from './fixtures/report-attempts.js';
import {coreStudentReport,extendedStudentReport} from '../src/investigations/investigation-report.js';
import {osmosisStudentReport} from '../src/osmosis-report.js';
import {studentReportHtml,studentReportPdf,reportFilename} from '../src/investigations/student-report.js';
import {restore} from '../src/state.js';

const options={exportedAt:'2026-11-11T21:30:00.000Z',timeZone:'America/Los_Angeles'};
function report(f){return f.id==='osmosis-homeostasis'?osmosisStudentReport(f.state,options):['yeast','leaf','mitosis'].includes(f.c.kind)?coreStudentReport(f.c,f.state,options):extendedStudentReport(f.c,f.state,options);}

test('all 14 reports preserve completed work and use a shared faithful PDF/print snapshot',()=>{
 assert.equal(reportLabIds.length,14);
 for(const id of reportLabIds){const f=reportAttempt(id,true);f.state.studentName='Zoë García';f.state.studentClass='Period 3';const before=structuredClone(f.state),r=report(f),html=studentReportHtml(r),pdf=JSON.stringify(studentReportPdf(r));assert.equal(r.status,'Complete',id);assert.equal(r.grading,'not_graded');assert.match(html,/Zoë García/);assert.match(pdf,/Zoë García/);assert.match(r.exportedAtDisplay,/Nov 11, 2026, 1:30 PM PST/);assert.equal(reportFilename(r),id+'-Zoë-García-lab-report.pdf');if(id!=='osmosis-homeostasis'){assert.ok(pdf.includes(f.state.notes?.answers[0]||f.state.answers[0]));if(f.state.sources?.includes('classroom')||f.state.records?.some(r=>r.source==='classroom'))assert.match(html,/Classroom observation|classroom/);assert.match(html,/Virtual model|virtual/);}assert.deepEqual(f.state,before,id);}
});
test('partial reports never fill hidden observations or invent completed work',()=>{
 for(const id of reportLabIds){const f=reportAttempt(id),r=report(f);assert.equal(r.status,'In progress');assert.match(studentReportHtml(r),/Not recorded/);assert.equal(reportFilename(r),id+'-lab-report.pdf');}
 const f=reportAttempt('osmosis-homeostasis');f.state.prepared.A=true;f.state.initial.A=true;f.state.answers.A='99';f.state.attempts.A=1;const r=report(f),measurement=r.sections.find(part=>part.heading==='Your measurements and calculations').blocks[1].rows[0];assert.equal(measurement[3],f.state.run[0].initialMass.toFixed(2));assert.equal(measurement[4],null);assert.equal(measurement[5],'99');assert.equal(measurement[6],'Needs review');
});
test('core reports retain mixed sources, unreached thresholds, student classifications and uncollected readings',()=>{
 const leaf=report(reportAttempt('light-photosynthesis',true));assert.match(studentReportHtml(leaf),/Not reached by 20 min/);assert.match(studentReportHtml(leaf),/classroom/);
 const mitosis=reportAttempt('mitosis',true),r=report(mitosis);assert.match(studentReportHtml(r),/16/);assert.match(studentReportHtml(r),/40 cells/);assert.match(studentReportHtml(r),/24 hours/);
 const partial=reportAttempt('yeast-fermentation');partial.state.yeastRuns={'none-1':{points:[{time:0,value:0},{time:5,value:.75}]}};assert.match(studentReportHtml(report(partial)),/virtual observations not yet collected/);assert.match(studentReportHtml(report(partial)),/0.75/);
});
test('extended reports retain measured estimates, cell products, source separation and draft classifications',()=>{
 const gel=report(reportAttempt('gel-electrophoresis',true));assert.match(studentReportHtml(gel),/3100/);assert.match(studentReportHtml(gel),/1510/);
 assert.equal(gel.sections.flatMap(s=>s.blocks).filter(b=>b.type==='table'&&b.columns[0].startsWith('Time')).length,0,'Internal gel clock samples are not fragment-size observations');
 const meiosis=report(reportAttempt('meiosis-variation',true));assert.match(studentReportHtml(meiosis),/Polar body/);assert.match(studentReportHtml(meiosis),/Sperm/);
 const corn=reportAttempt('inheritance-ratios');corn.state.run.tallies=[4,2];corn.state.punnett.cells=['PP','Pp','Pp','pp'];const html=studentReportHtml(report(corn));assert.match(html,/Draft count/);assert.match(html,/PP/);assert.match(html,/not collected/);
});
test('osmosis identity restores without changing existing or legacy measurement data',()=>{
 const f=reportAttempt('osmosis-homeostasis',true);f.state.studentName='Maya';f.state.studentClass='4';const restored=restore(JSON.stringify(f.storageValue));assert.equal(restored.studentName,'Maya');assert.deepEqual(restored.run,f.state.run);const legacy=structuredClone(f.storageValue);delete legacy.state.studentName;delete legacy.state.studentClass;const migrated=restore(JSON.stringify(legacy));assert.equal(migrated.studentName,'');assert.deepEqual(migrated.run,f.state.run);assert.equal(migrated.step,6);
});
test('reports escape student HTML, sanitize filenames, and preserve long answers verbatim',()=>{
 const f=reportAttempt('enzyme-activity',true);f.state.studentName='Zoë / García:*';f.state.answers[0]='<script>unsafe()</script>\n'+('Long explanation α β 37 °C.\n'.repeat(80))+'FINAL ANSWER MARKER';const r=report(f);assert.match(studentReportHtml(r),/&lt;script&gt;/);assert.ok(!studentReportHtml(r).includes('<script>'));assert.ok(JSON.stringify(studentReportPdf(r)).includes('FINAL ANSWER MARKER'));assert.equal(r.sections.find(s=>s.heading==='Your explanations').blocks[0].text,f.state.answers[0]);assert.equal(reportFilename(r),'enzyme-activity-Zoë-García-lab-report.pdf');f.state.answers[0]='Changed after the snapshot';assert.ok(r.sections.find(s=>s.heading==='Your explanations').blocks[0].text.endsWith('FINAL ANSWER MARKER'));
});
