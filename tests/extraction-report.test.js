import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshExtraction,restoreExtraction,modelVisibility,answerCheckpoint,canUse} from '../src/investigations/extraction-model.js';
import {extractionReport,reportDefinition,reportHtml} from '../src/investigations/extraction-report.js';
const lab={id:'dna-replication',title:'Extracting DNA from Fruit'};

test('mechanical disruption yields some visible material without detergent in every new model seed',()=>{
 for(let seed=0;seed<200;seed++){
  const partial=modelVisibility(seed,1),complete=modelVisibility(seed,0);
  assert.equal(partial,1);assert.ok(complete>partial);assert.equal(modelVisibility(seed,2),0);
 }
});

test('checkpoint history retains initial reasoning, correction and current gate across reload',()=>{
 let s={...freshExtraction(17),stage:1,step:4,passes:3};
 s=answerCheckpoint(s,2);assert.equal(canUse(s),false);
 s=answerCheckpoint(s,0);assert.equal(canUse(s),true);
 s=restoreExtraction(JSON.stringify(s));assert.deepEqual(s.checkAttempts[4],[2,0]);assert.equal(canUse(s),true);
 assert.equal(answerCheckpoint(s,8),s);
});

test('older observed attempts retain their model and answers; unobserved attempts use the correction',()=>{
 const s=freshExtraction(7);delete s.modelVersion;delete s.attemptId;delete s.checkAttempts;delete s.studentName;delete s.studentClass;
 assert.equal(restoreExtraction(JSON.stringify(s)).modelVersion,3);
 s.scores=[2,0,0];s.notes=['tuft','none','none'];
 const old=restoreExtraction(JSON.stringify(s));assert.equal(old.modelVersion,2);assert.deepEqual(old.scores,s.scores);assert.deepEqual(old.notes,s.notes);
});

test('PDF, print and structured reports retain student evidence and never infer a grade',()=>{
 const s={...freshExtraction(6),route:'classroom',stage:2,complete:true,studentName:'Zoë García',studentClass:'Biology 3',prediction:'<script>literal answer</script>',scores:[0,3,2],sources:['classroom','classroom','classroom'],notes:['Unexpectedly clear','Many strands','Cloudy blank'],claim:'Unexpected results remain my evidence.',limit:'More precipitate does not prove more DNA.'};
 const r=extractionReport(lab,s,'2026-11-08T12:00:00Z');
 assert.deepEqual(r.observations.map(o=>o.score),[0,3,2]);assert.equal(r.grading.status,'not_graded');assert.equal(r.checkpoints[0].status,'Not required for classroom route');
 const html=reportHtml(r);assert.ok(html.includes('&lt;script&gt;literal answer&lt;/script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(html.includes('Zoë García'));
 const def=reportDefinition(r),encoded=def.files.responses.src.split(',')[1];
 assert.deepEqual(JSON.parse(Buffer.from(encoded,'base64').toString('utf8')),r);
 s.notes[0]='Edited later';assert.equal(r.observations[0].description,'Unexpectedly clear');
});
