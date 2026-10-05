import test from 'node:test';
import assert from 'node:assert/strict';
import {investigations as configs} from '../src/investigations/content.js';
import {makeSeries,et50,fieldCells,tally,stageStats,validateReadings,fresh,restored,completedData} from '../src/investigations/model.js';
test('leaf assay handles interpolation, initial flotation, and unreached threshold',()=>{
 assert.equal(et50([{time:0,value:0},{time:2,value:4},{time:4,value:6}]),3);
 assert.equal(et50([{time:0,value:5},{time:2,value:8}]),0);
 assert.equal(et50([{time:0,value:0},{time:20,value:4}]),null);
 const c=configs['light-photosynthesis'];
 for(let seed=0;seed<100;seed++){
  const dark=makeSeries(c,'dark',1,seed),bright=makeSeries(c,'bright',1,seed),low=makeSeries(c,'low',1,seed);
  assert.equal(et50(dark),null);assert.ok(et50(bright)<et50(low));
  assert.ok(bright.every(p=>Number.isInteger(p.value)&&p.value>=0&&p.value<=10));
  assert.deepEqual(bright,makeSeries(c,'bright',1,seed));
 }
});
test('fermentation control and units remain sensible across model seeds',()=>{
 const c=configs['yeast-fermentation'];
 for(let seed=0;seed<100;seed++){
  const control=makeSeries(c,'none',1,seed),glucose=makeSeries(c,'glucose',1,seed);
  assert.equal(glucose[0].value,0);assert.ok(glucose.at(-1).value>control.at(-1).value);
  assert.ok(glucose.every(p=>p.value>=0&&p.value<=100));
 }
});
test('classroom validation permits unexpected trends but rejects missing and invalid measurements',()=>{
 const c=configs['light-photosynthesis'];
 assert.ok(validateReadings(c,[0,0,2,1,4,3,4,3,2,1,0]));
 assert.ok(!validateReadings(c,[0,0,2,1,4,3,4,3,2,1,'']));
 assert.ok(!validateReadings(c,[0,0,2,1,4,3,4,3,2,1,11]));
 assert.ok(!validateReadings(c,[0,0,2,1,4,3,4,3,2,1,.5]));
});
test('mitosis preserves counts and interprets stage fractions against an assumed duration',()=>{
 const counts=tally([...fieldCells('field-a',98),...fieldCells('field-b',98)]);
 assert.deepEqual(counts,[27,6,3,2,2]);
 const rows=stageStats(counts,24);assert.ok(Math.abs(rows[0].hours-16.2)<1e-10);
 assert.equal(rows.reduce((n,r)=>n+r.percent,0),100);
 assert.ok(Math.abs(stageStats(counts,12)[0].hours-8.1)<1e-10);
});
test('saved progress restores separately and corrupt observation data reset safely',()=>{
 const c=configs['light-photosynthesis'];const s=fresh(c,['classroom','virtual','virtual']);
 s.notes.prediction='Prediction';s.runs['dark-1']=makeSeries(c,'dark',1,s.seed);
 assert.deepEqual(restored(c,JSON.stringify(s)),s);
 s.runs['dark-1'][0].value=100;assert.deepEqual(restored(c,JSON.stringify(s)).runs,{});
 assert.equal(completedData(c,fresh(c)),false);
});
