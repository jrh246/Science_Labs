import test from 'node:test';
import assert from 'node:assert/strict';
import {newMicroscope,restoreMicroscope,focused,canClassify} from '../src/investigations/mitosis-model.js';
test('microscope requires loaded slide, suitable illumination, low-power location and high-power focus',()=>{
 const r=newMicroscope();assert.equal(canClassify(r),false);Object.assign(r,{loaded:true,light:true,focus:50});assert.equal(focused(r),true);assert.equal(canClassify(r),false);r.located=true;r.objective=40;assert.equal(canClassify(r),true);r.focus=75;assert.equal(canClassify(r),false);r.focus=50;r.brightness=0;assert.equal(canClassify(r),false);
});
test('microscope restore preserves classifications and safely resets invalid settings',()=>{
 const r=newMicroscope();r.answers[3]=2;assert.deepEqual(restoreMicroscope(r),r);assert.equal(restoreMicroscope({...r,focus:Infinity}).loaded,false);assert.equal(restoreMicroscope({...r,checked:true}).checked,false);const answers=Array(20).fill(1);assert.deepEqual(restoreMicroscope(undefined,answers).answers,answers);
});
