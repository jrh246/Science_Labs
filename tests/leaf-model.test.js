import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newLeafRun,infiltrate,advanceLeaf,setLeafLight,floating,comparisonReadings,restoreLeafRun} from '../src/investigations/leaf-model.js';
const prepare=r=>{for(let n=0;n<6;n++)infiltrate(r);return r;};
test('infiltration replaces initial buoyancy and light history changes subsequent observations',()=>{
 const high=newLeafRun('bright',1,123);assert.equal(floating(high),10);prepare(high);assert.equal(floating(high),0);
 advanceLeaf(high,20);assert.equal(floating(high),10);assert.equal(comparisonReadings(high).length,11);
 setLeafLight(high,0);assert.equal(floating(high),10);advanceLeaf(high,30);assert.equal(floating(high),0);assert.equal(high.altered,true);assert.deepEqual(comparisonReadings(high),[]);
 setLeafLight(high,100);advanceLeaf(high,20);assert.equal(floating(high),10);
 const dark=prepare(newLeafRun('dark',1,123));advanceLeaf(dark,20);assert.equal(floating(dark),0);
 const low=prepare(newLeafRun('low',1,123));advanceLeaf(low,8);const bright=prepare(newLeafRun('bright',1,123));advanceLeaf(bright,8);assert.ok(floating(bright)>floating(low));
});
test('incomplete preparation is exploratory; pause/restore retains gas and changes; corrupt state resets',()=>{
 const r=newLeafRun('bright',2,22);advanceLeaf(r,2);assert.equal(r.altered,true);assert.deepEqual(comparisonReadings(r),[]);
 const restored=restoreLeafRun(r,'bright',2,22);assert.deepEqual(restored,r);advanceLeaf(restored,2);assert.equal(r.ticks,8);
 assert.equal(restoreLeafRun({...r,ticks:Infinity},'bright',2,22).ticks,0);
 const valid=prepare(newLeafRun('bright',1,22));setLeafLight(valid,25);setLeafLight(valid,100);advanceLeaf(valid,20);assert.equal(valid.altered,false);
});
