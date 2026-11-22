import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ids,recordPrediction,predictionReady,canComplete,restore,difference} from '../src/state.js';
import {osmosisStudentReport} from '../src/osmosis-report.js';
import {extendedById} from '../src/investigations/extended-content.js';
import {freshState as freshExtended,restoreState,ready,record,cellLength} from '../src/investigations/extended-model.js';
import {matchedSetup} from '../src/investigations/learning-design.js';
import {microscopeGeometry,gelLanes,benchSites} from '../src/investigations/bench-geometry.js';
import {apparatusArt} from '../src/investigations/extended-visuals.js';

function measured(){
 const s=freshState();
 for(const field of ['prepared','initial','placed','final','valid'])s[field]=Object.fromEntries(ids.map(id=>[id,true]));
 s.step=6;s.elapsed=true;s.answers=Object.fromEntries(s.run.map(t=>[t.id,String(difference(t))]));
 return s;
}

test('osmosis requires prediction and written evidence, preserving the first prediction and verbatim explanations',()=>{
 const s=freshState();s.prediction='My first prediction could be wrong.';
 assert.equal(predictionReady(s),false);recordPrediction(s,'2026-11-12T17:00:00Z');
 const initial={...s.initialPrediction};s.prediction='My revised prediction.';recordPrediction(s);
 assert.deepEqual(s.initialPrediction,initial);
 const done={...measured(),prediction:s.prediction,initialPrediction:initial};
 assert.equal(canComplete(done),false);
 for(const key of Object.keys(done.reasoning))done.reasoning[key]='My words <unchanged> — evidence '+key;
 assert.ok(canComplete(done));done.complete=true;
 const report=osmosisStudentReport(done);
 assert.equal(report.status,'Complete');assert.deepEqual(report.responses.map(x=>x.response),Object.values(done.reasoning));
 assert.equal(report.prediction.initial.text,initial.text);
});

test('earlier osmosis work preserves supplied observations and labels prediction timing truthfully',()=>{
 const s=measured();delete s.learningVersion;delete s.initialPrediction;delete s.prediction;delete s.reasoning;
 const migrated=restore(JSON.stringify({version:2,state:s}));
 assert.deepEqual(migrated.run,s.run);assert.equal(migrated.predictionUnrecorded,true);assert.equal(migrated.step,6);
 assert.equal(migrated.initialPrediction,null);assert.equal(canComplete(migrated),false);
 migrated.prediction='Copied from paper after finishing.';recordPrediction(migrated);
 assert.equal(migrated.initialPrediction.timing,'after-results');
 for(const key of Object.keys(migrated.reasoning))migrated.reasoning[key]='Evidence from my existing masses.';
 assert.ok(canComplete(migrated));
 const early=freshState();early.prepared.A=true;early.step=1;delete early.learningVersion;
 const restored=restore(JSON.stringify({version:2,state:early}));
 assert.equal(restored.step,0);assert.deepEqual(restored.run,early.run);assert.deepEqual(restored.prepared,early.prepared);
});

test('microscope calibration gates collection, records provenance, and reuses setup without copying measurements',()=>{
 const c=extendedById['cell-microscopy'],s=freshExtended(c,100),r=s.run;
 r.prepared=c.steps.length;r.objective=40;r.rulerMeasured=true;
 assert.equal(ready(c,r),false);r.calibrationChecked=true;r.calibrationAnswer='2';r.calibrationSource='student';
 assert.equal(ready(c,r),true);assert.equal(record(c,r).settings.calibration.source,'student');
 const matched=matchedSetup(c,{...freshExtended(c,100).run});
 assert.equal(matched.calibrationSource,'matched');assert.equal(matched.rulerMeasured,false);assert.deepEqual(matched.readings,[]);
 r.calibrationAnswer={invalid:true};
 const restored=restoreState(c,JSON.stringify(s));
 assert.equal(restored.run.calibrationChecked,false);assert.equal(restored.run.calibrationAnswer,'');assert.equal(restored.run.seed,r.seed);
 delete r.calibrationVersion;
 const legacy=restoreState(c,JSON.stringify(s));
 assert.equal(legacy.run.calibrationSource,'supplied');assert.equal(legacy.run.ruler,r.ruler);
});

test('eyepiece division spacing stays fixed while objective scale and cell size change',()=>{
 const c=extendedById['cell-microscopy'],r=freshExtended(c,42).run;
 const low=microscopeGeometry(r);r.objective=40;const high=microscopeGeometry(r);
 assert.equal(low.pixelsPerDivision,high.pixelsPerDivision);assert.equal(low.unitsPerDivision,8);assert.equal(high.unitsPerDivision,2);
 assert.equal(high.width,4*low.width);assert.equal(high.width/high.pixelsPerDivision*2,cellLength(r));
 assert.ok(high.left+high.rulerMaximum*4<=high.visibleRight);
});

test('shared apparatus uses numeric work sites and individually aligned gel wells',()=>{
 for(const c of Object.values(extendedById).filter(c=>benchSites[c.kind])){
  const r=freshExtended(c,42).run;r.prepared=c.steps.length;
  assert.doesNotMatch(apparatusArt(c,r),/\$\{/);
 }
 assert.equal(new Set(gelLanes.map(site=>site.x)).size,4);
 assert.ok(gelLanes.every(site=>site.y===80.5));
});
