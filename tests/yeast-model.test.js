import test from 'node:test';
import assert from 'node:assert/strict';
import {newYeastRun,advanceYeast,restoreYeastRun,yeastReadings,yeastRate,investigationYeastVersion} from '../src/investigations/yeast-model.js';
const ready=(fuel='glucose')=>({...newYeastRun(fuel,1,123),fuel,prepared:true,connected:true});
test('fermentation requires connected equipment and records complete controlled trials',()=>{
 const empty=newYeastRun('glucose',1,123);advanceYeast(empty,30);assert.equal(empty.ticks,0);
 const sugar=ready(),control=ready('none');advanceYeast(sugar,30);advanceYeast(control,30);
 assert.equal(yeastReadings(sugar).length,7);assert.equal(sugar.points[0].value,0);assert.ok(sugar.volume>control.volume);
 assert.deepEqual(restoreYeastRun(sugar,'glucose',1,123),sugar);
 assert.equal(restoreYeastRun({...sugar,volume:NaN},'glucose',1,123).ticks,0);
});
test('temperature changes affect later gas accumulation without rewriting readings; no yeast stays at zero',()=>{
 const warm=ready(),cool=ready(),blank={...ready(),yeast:false};advanceYeast(warm,10);advanceYeast(cool,10);
 const saved=structuredClone(cool.points);cool.bath=15;advanceYeast(warm,20);advanceYeast(cool,20);advanceYeast(blank,30);
 assert.ok(warm.volume>cool.volume);assert.deepEqual(cool.points.slice(0,saved.length),saved);assert.equal(blank.volume,0);
 assert.equal(yeastReadings(cool).length,0);assert.equal(yeastReadings(blank).length,0);
 const capacity={...ready(),bath:40};advanceYeast(capacity,120);assert.ok(capacity.volume<=100);assert.ok(capacity.ticks<=480);
});


test('revised scenario has slower early sucrose and similar late rates without forcing equal totals',()=>{
 for(const tau of [4,5.5,7]){
  const g={...ready('glucose'),lag:2,variation:1},s={...ready('sucrose'),lag:2,variation:1,sucroseRamp:tau};
  advanceYeast(g,5);advanceYeast(s,5);assert.ok(g.volume>s.volume);const early=yeastRate(s);
  advanceYeast(g,25);advanceYeast(s,25);
  assert.ok(yeastRate(s)>early);assert.ok(yeastRate(s)/yeastRate(g)>.99);assert.ok(yeastRate(s)/yeastRate(g)<1.05);
  assert.ok(s.volume<g.volume); // Similar end rate does not erase the accumulated deficit.
 }
});
test('pause and reload give the same trajectory; ramp parameters validate',()=>{
 const continuous=ready('sucrose'),split=structuredClone(continuous);advanceYeast(continuous,30);advanceYeast(split,10);
 const restored=restoreYeastRun(split,'sucrose',1,123);advanceYeast(restored,20);assert.deepEqual(restored,continuous);
 assert.equal(restoreYeastRun({...split,sucroseRamp:NaN},'sucrose',1,123).ticks,0);
});
test('legacy investigations and in-progress runs keep their original kinetics',()=>{
 const legacy={...newYeastRun('sucrose',1,123,1),fuel:'sucrose',prepared:true,connected:true,lag:2,variation:1};
 advanceYeast(legacy,10);const saved=structuredClone(legacy);const resumed=restoreYeastRun(saved,'sucrose',1,123);advanceYeast(resumed,20);
 assert.ok(Math.abs(resumed.volume-28*.91)<1e-9);assert.deepEqual(resumed.points.slice(0,saved.points.length),saved.points);
 assert.equal(investigationYeastVersion({runs:{'none-1':[]}}),1);assert.equal(investigationYeastVersion({yeastRuns:{a:saved}}),1);
 assert.equal(investigationYeastVersion({}),2);assert.equal(investigationYeastVersion({fermentationModelVersion:2,runs:{a:[]}}),2);
 assert.equal(restoreYeastRun(null,'glucose',2,123,1).version,1);
});
test('trial variation allows either late-rate ranking and preserves apparatus bounds',()=>{
 let higher=0,lower=0;
 for(let seed=0;seed<200;seed++){
  const g={...newYeastRun('glucose',1,seed),fuel:'glucose',prepared:true,connected:true};
  const s={...newYeastRun('sucrose',1,seed),fuel:'sucrose',prepared:true,connected:true};advanceYeast(g,30);advanceYeast(s,30);
  if(yeastRate(s)>yeastRate(g))higher++;else lower++;
  assert.equal(yeastReadings(s).length,7);assert.ok(s.volume>=0&&s.volume<=100);
 }
 assert.ok(higher>0&&lower>0);
});
