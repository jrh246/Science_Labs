import test from 'node:test';
import assert from 'node:assert/strict';
import {newYeastRun,advanceYeast,restoreYeastRun,yeastReadings} from '../src/investigations/yeast-model.js';
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
