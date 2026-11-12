import {test} from 'node:test';
import assert from 'node:assert/strict';
import {freshExtraction,useTool,tickExtraction,restoreExtraction,modelVisibility,evidenceReady,canComplete,steps} from '../src/investigations/extraction-model.js';

function prepared(){let s={...freshExtraction(71),stage:1};for(const [i,step] of steps.entries()){if(i===4)s.checks[4]=0;if(i===8)s.checks[8]=1;for(let n=0;n<(i===1?3:1);n++)s=useTool(s,step.tool,step.target);}return s;}
test('preparation enforces tool order, target, physical mashing and mechanism checkpoints',()=>{
 let s={...freshExtraction(42),stage:1};assert.equal(useTool(s,'soap','bag'),s);assert.equal(useTool(s,'fruit','tube'),s);
 s=useTool(s,'fruit','bag');s=useTool(s,'masher','bag');assert.equal(s.step,1);assert.equal(s.passes,1);
 s=useTool(s,'masher','bag');s=useTool(s,'masher','bag');assert.equal(s.step,2);
 s=useTool(s,'water','bag');s=useTool(s,'salt','bag');assert.equal(useTool(s,'soap','bag'),s);
 s.checks[4]=1;assert.equal(useTool(s,'soap','bag'),s);s.checks[4]=0;s=useTool(s,'soap','bag');assert.equal(s.step,5);
 const done=prepared();assert.equal(done.step,9);assert.equal(done.passes,3);assert.equal(done.elapsed,0);
});
test('timing is independent of tick size and observations are stable ordinal categories',()=>{
 const s=prepared();let gradual=s;for(let i=0;i<20;i++)gradual=tickExtraction(gradual,15);
 assert.deepEqual(gradual,tickExtraction(s,500));assert.equal(tickExtraction(freshExtraction(),300).elapsed,0);
 for(let seed=0;seed<100;seed++)for(let i=0;i<3;i++){const v=modelVisibility(seed,i);assert.ok(Number.isInteger(v)&&v>=0&&v<=3);assert.equal(modelVisibility(seed,i),v);if(i===2)assert.equal(v,0);}
});
test('completion requires student evidence and writing, not matching model answers',()=>{
 const s=tickExtraction(prepared(),300);s.stage=2;assert.equal(evidenceReady(s),false);
 s.scores=[0,3,2];s.notes=['No strands','Abundant strands','Cloudy blank'];assert.equal(evidenceReady(s),true);assert.equal(canComplete(s),false);
 s.claim='The observed comparison does not support my prediction.';s.limit='Appearance alone does not establish purity.';assert.equal(canComplete(s),true);
 s.sources=['classroom','classroom','classroom'];assert.equal(canComplete(s),true);
});
test('valid partial work restores; corrupt or bypassed preparation is rejected',()=>{
 const s=prepared();s.prediction='<b>my prediction</b>';assert.deepEqual(restoreExtraction(JSON.stringify(s)),s);
 for(const mutate of [s=>s.step=40,s=>s.passes=0,s=>s.elapsed=Infinity,s=>s.checks[8]=0,s=>s.scores=[99,0,0],s=>s.sources[0]='external',s=>s.notes=null]){const invalid=prepared();mutate(invalid);assert.equal(restoreExtraction(JSON.stringify(invalid)).step,0);}
 assert.equal(restoreExtraction('not JSON').stage,0);
 const classroom={...freshExtraction(10),route:'classroom',stage:2,sources:['classroom','classroom','classroom']};assert.deepEqual(restoreExtraction(JSON.stringify(classroom)),classroom);
});
