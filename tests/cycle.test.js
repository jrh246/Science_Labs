import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateCycle,validPlacements} from '../src/activities/cycle-model.js';
const solution={'co2-1':'photo-in','water-2':'photo-in','glucose-1':'photo-out','oxygen-2':'photo-out','co2-2':'resp-out','water-1':'resp-out','glucose-2':'resp-in','oxygen-1':'resp-in',light:'photo-help',chlorophyll:'photo-help',mitochondrion:'resp-place',atp:'resp-energy',heat:'resp-energy'};
test('cycle accepts interchangeable copies and checks both full equations',()=>{
 const result=evaluateCycle(solution);assert.equal(result.complete,true);
 for(const zone of result.zones.filter(z=>/-(in|out)$/.test(z.id)))assert.deepEqual(zone.atoms,[6,12,18]);
 const duplicate={...solution,'water-2':'resp-out'};assert.equal(evaluateCycle(duplicate).complete,false);
 const reversed={...solution,'co2-1':'photo-out','glucose-1':'photo-in'};assert.equal(evaluateCycle(reversed).complete,false);
 assert.equal(evaluateCycle({...solution,atp:'resp-out'}).complete,false);
 assert.deepEqual(validPlacements({'co2-1':'photo-in',bogus:'photo-out',heat:'unknown'}),{'co2-1':'photo-in'});
});
