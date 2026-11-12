import {test} from 'node:test';
import assert from 'node:assert/strict';
import {extendedLabs,sordariaExtension} from '../src/investigations/extended-content.js';
import {investigations} from '../src/investigations/content.js';
import {learningDesign,canReuseSetup,matchedSetup,samplingSummaries} from '../src/investigations/learning-design.js';
import {freshState,newRun,sequence,record,ready} from '../src/investigations/extended-model.js';
import {newLeafRun,prepareMatchedLeaf,infiltrate,advanceLeaf,comparisonReadings} from '../src/investigations/leaf-model.js';
import {newYeastRun,prepareMatchedYeast,advanceYeast,yeastReadings} from '../src/investigations/yeast-model.js';
import {newMicroscope,reuseMicroscope,canClassify} from '../src/investigations/mitosis-model.js';
import {fresh,hasPriorVirtualSample,times,completedData} from '../src/investigations/model.js';
import {labs} from '../src/catalog.js';

test('every runnable lab has a learning rationale and essential contrasts survive shorter pathways',()=>{
 for(const c of labs.filter(x=>x.status==='available'))assert.ok(learningDesign[c.id]?.note,c.id);
 assert.ok(learningDesign[sordariaExtension.id]);
 for(const [kind,n] of [['enzyme',3],['plant',2],['expression',3],['gel',1]]){const c=extendedLabs.find(x=>x.kind===kind);assert.equal(sequence(c).length,n);assert.equal(c.workflowVersion,2);}
 assert.equal(sequence(extendedLabs.find(x=>x.kind==='regulation')).length,4);
 assert.equal(sequence(extendedLabs.find(x=>x.kind==='microscope')).length,6);
 assert.equal(investigations.mitosis.conditions.length,2);
});
test('setup reuse requires prior virtual work and cannot supply observations or classifications',()=>{
 for(const c of [...extendedLabs,sordariaExtension].filter(c=>c.learningPlan?.reuseSetup)){
  const s=freshState(c,42);assert.equal(canReuseSetup(c,s),false);s.records=[{source:'classroom'}];assert.equal(canReuseSetup(c,s),false);s.records=[{source:'virtual'}];assert.equal(canReuseSetup(c,s),true);
  const prepared=matchedSetup(c,s.run);assert.equal(prepared.prepared,c.steps.length);assert.equal(prepared.time,0);if(c.kind==='microscope')assert.equal(prepared.rulerMeasured,false);assert.deepEqual(prepared.scores,[]);assert.deepEqual(prepared.readings,[]);assert.equal(record(c,prepared).settings.preparation,'matched');
  assert.equal(ready(c,prepared),false);
 }
});
test('fresh matched leaf preparation preserves sample variability and matches manual preparation',()=>{
 const manual=newLeafRun('bright',2,45),matched=structuredClone(manual);
 for(let i=0;i<6;i++)infiltrate(manual);manual.inCup=true;
 assert.equal(prepareMatchedLeaf(matched),true);assert.equal(matched.ticks,0);assert.deepEqual(matched.points,[]);assert.deepEqual(matched.disks,manual.disks);
 assert.notDeepEqual(matched.disks,newLeafRun('bright',1,45).disks);
 advanceLeaf(manual,20);advanceLeaf(matched,20);assert.deepEqual(comparisonReadings(matched),comparisonReadings(manual));assert.equal(prepareMatchedLeaf(matched),false);
});
test('fresh matched yeast requires the assigned fuel and does not reuse gas readings',()=>{
 const r=newYeastRun('sucrose',2,45);assert.equal(prepareMatchedYeast(r,'sucrose'),false);r.fuel='sucrose';assert.equal(prepareMatchedYeast(r,'sucrose'),true);assert.equal(r.volume,0);assert.deepEqual(r.points,[]);assert.equal(r.ticks,0);
 advanceYeast(r,30);assert.equal(yeastReadings(r).length,7);assert.equal(prepareMatchedYeast(r,'sucrose'),false);
});
test('microscope reuse retains all new-field classification work',()=>{
 const r=newMicroscope();r.answers[0]=2;assert.equal(reuseMicroscope(r),true);assert.equal(canClassify(r),true);assert.equal(r.answers[0],2);assert.equal(r.answers.filter(x=>x===null).length,19);assert.equal(r.checked,false);
});
test('data from other samples unlock setup only after full virtual observations; completion still needs sampling',()=>{
 const c=investigations['light-photosynthesis'],s=fresh(c);
 s.runs['dark-1']=[{time:0,value:0}];assert.equal(hasPriorVirtualSample(c,s,'dark-2'),false);
 s.runs['dark-1']=times(c).map(time=>({time,value:0}));assert.equal(hasPriorVirtualSample(c,s,'dark-2'),true);assert.equal(hasPriorVirtualSample(c,s,'dark-1'),false);assert.equal(completedData(c,s),false);
 s.sources[0]='classroom';assert.equal(hasPriorVirtualSample(c,s,'dark-2'),false);
});
test('sampling summaries expose differences rather than hiding them inside a pooled value',()=>{
 const c=extendedLabs.find(x=>x.kind==='flies');const out=samplingSummaries(c,[{condition:'A',source:'virtual',values:[14,14,2,2]},{condition:'B',source:'classroom',values:[12,12,4,4]}]);
 assert.deepEqual(out.map(x=>x.percent),[12.5,25]);assert.deepEqual(out.map(x=>x.source),['virtual','classroom']);
});
