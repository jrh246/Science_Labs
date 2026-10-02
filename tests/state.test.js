import test from 'node:test';
import assert from 'node:assert/strict';
import {labConfig as c} from '../src/data/labConfig.js';
import {freshState,advance,correct,difference,restore,createExperimentRun,trendValid} from '../src/state.js';
test('five matching setups and deterministic masses',()=>{assert.deepEqual(c.beakers.map(b=>b.id),['A','B','C','D','E']);assert.deepEqual(c.tubes.map(t=>[t.id,t.initialMass,t.baselineFinalMass]),[['A',17.59,17.66],['B',8.75,10.40],['C',11.24,12.10],['D',10.71,10.57],['E',18.05,15.60]]);});
test('time requires every tube',()=>{const s=freshState();assert.equal(advance(s),false);s.placed={A:true,B:true,C:true,D:true};assert.equal(advance(s),false);s.placed.E=true;assert.equal(advance(s),true);});
test('signed subtraction and tolerance',()=>{assert.equal(difference(createExperimentRun(()=>0.5)[4]),-2.45);assert.ok(correct(createExperimentRun(()=>0.5),'E',-2.44));assert.ok(!correct(createExperimentRun(()=>0.5),'E',2));assert.ok(!correct(createExperimentRun(()=>0.5),'C',''));});
test('saved progress restores; reset and corrupt saves start fresh',()=>{const s=freshState();s.prepared.A=true;assert.deepEqual(restore(JSON.stringify({version:2,state:s})),s);assert.equal(restore('invalid').step,0);assert.equal(restore(JSON.stringify({version:2,state:{...s,step:6}})).step,0);assert.equal(freshState().step,0);});

test('measurement variability preserves trends and bounds over many runs',()=>{for(let i=0;i<2000;i++){const run=createExperimentRun();for(const [j,t] of run.entries()){assert.ok(trendValid(t));assert.ok(Math.abs(t.initialMass-c.tubes[j].initialMass)<0.051);assert.ok(Math.abs(t.finalMass-c.tubes[j].baselineFinalMass)<0.051);}}});
test('extreme errors regenerate affected measurement; new runs vary',()=>{let calls=0;const run=createExperimentRun(()=>calls++<8?(calls<=6?1:0):0.5);assert.ok(run.every(trendValid));assert.notDeepEqual(createExperimentRun(()=>0.25),createExperimentRun(()=>0.75));});

test('legacy experiments retain baseline observations without rerandomizing',()=>{const s=freshState();delete s.run;const migrated=restore(JSON.stringify({version:1,state:s}));assert.deepEqual(migrated.run.map(t=>t.finalMass),c.tubes.map(t=>t.baselineFinalMass));assert.deepEqual(restore(JSON.stringify({version:2,state:migrated})).run,migrated.run);});
