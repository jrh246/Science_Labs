import test from 'node:test';
import assert from 'node:assert/strict';
import {extendedLabs as labs} from '../src/investigations/extended-content.js';
import {newRun,advance,valueAt,ready,specimens,counts,mapping,chiSquare,bandDistance,bandSize,record,restoreState,freshState,csv} from '../src/investigations/extended-model.js';
const find=kind=>labs.find(c=>c.kind===kind);
test('time-step size does not change observations and simulated clocks stop at endpoint',()=>{
 for(const c of labs.filter(x=>x.duration))for(let i=0;i<c.conditions.length;i++){
  let r=newRun(c,0,123,i),small=r;for(let n=0;n<c.duration*4;n++)small=advance(c,small,.25);
  const large=advance(c,r,c.duration+100);assert.equal(large.time,c.duration);assert.deepEqual(small.readings,large.readings);
  assert.ok(large.readings.every(([t,v])=>Number.isFinite(v)&&v>=0));
 }
});
test('controls and effects follow the stated mechanisms without treating ordinal scores as concentration',()=>{
 const enzyme=find('enzyme'),plant=find('plant'),ex=find('extraction'),exp=find('expression'),reg=find('regulation');
 for(let seed=1;seed<100;seed++){
  assert.ok(valueAt(enzyme,newRun(enzyme,0,seed,2),30)>valueAt(enzyme,newRun(enzyme,0,seed,0),30));
  assert.ok(valueAt(plant,newRun(plant,0,seed,1),7)>valueAt(plant,newRun(plant,0,seed,0),7));
  assert.equal(valueAt(ex,newRun(ex,0,seed,2),5),0);
  assert.ok(valueAt(exp,newRun(exp,0,seed,0),8)>valueAt(exp,newRun(exp,0,seed,2),8));
  assert.equal(valueAt(reg,newRun(reg,0,seed,1),24),0);
 }
});
test('scoring uses student counts and the correct mapping factors',()=>{
 assert.equal(mapping('asci',[60,20,20]),20);assert.equal(mapping('flies',[40,40,10,10]),20);assert.equal(mapping('flies',[0,0,0,0]),null);
 assert.equal(chiSquare([75,25]),0);assert.ok(chiSquare([50,50])>0);
 for(const c of labs.filter(x=>x.categories)){const r=newRun(c,0,42);const answers=specimens(c,r);assert.equal(answers.length,c.count);r.prepared=c.steps.length;r.scores=answers.map(()=>0);assert.equal(ready(c,r),false);r.reviewed=true;assert.equal(ready(c,r),true);assert.equal(counts(r.scores,c.categories.length)[0],c.count);assert.deepEqual(record(c,r).values,counts(r.scores,c.categories.length));}
});
test('gel calibration inverts log-size relationship at each voltage',()=>{for(const voltage of [60,80,100])for(const bp of [500,700,1000,1500,4000])assert.ok(Math.abs(bandSize(bandDistance(bp,1,voltage),1,voltage)-bp)<1e-6);});
test('preparation, focus, staining and viewing are prerequisites for collection',()=>{
 for(const c of labs){let r=newRun(c,0,42);assert.equal(ready(c,r),false);r.prepared=c.steps.length;if(c.duration)r=advance(c,r,c.duration);
  if(c.kind==='microscope'){assert.equal(ready(c,r),false);r.objective=40;assert.equal(ready(c,r),true);r.focus=0;assert.equal(ready(c,r),false);}
  if(c.kind==='gel'){assert.equal(ready(c,r),false);r.stained=true;r.estimates=[3000,1500,700];assert.equal(ready(c,r),true);r.estimates[0]='';assert.equal(ready(c,r),false);}
  if(['regulation','expression'].includes(c.kind)){assert.equal(ready(c,r),false);r.viewer=true;assert.equal(ready(c,r),true);}
 }
});
test('saved data preserve source and observations; malformed saves reset and CSV prevents formula injection',()=>{
 const c=find('enzyme'),s=freshState(c,20);s.run=advance(c,s.run,30);s.records.push(record(c,s.run,'classroom',[4.2],'measured'));const restored=restoreState(c,JSON.stringify(s));assert.deepEqual(restored,s);assert.equal(restored.records[0].modelVersion,null);assert.deepEqual(restoreState(c,'broken').records,[]);assert.ok(csv([['=HYPERLINK("bad")','a,b']]).startsWith('"\'=HYPERLINK'));assert.ok(csv([['"quote"']]).includes('""quote""'));
});

test('corrupt controls and writing cannot break restored workspaces',()=>{
 const c=find('microscope');for(const change of [s=>s.run.selected=100,s=>s.run.conditionIndex=-1,s=>s.run.estimates=null,s=>s.answers={},s=>s.run.readings=[[0,null]]]){const s=freshState(c,55);change(s);assert.deepEqual(restoreState(c,JSON.stringify(s)).records,[]);assert.equal(restoreState(c,JSON.stringify(s)).run.selected,0);}
});
