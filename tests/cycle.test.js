import {test} from 'node:test';
import assert from 'node:assert/strict';
import {evaluateCycle,validPlacements} from '../src/activities/cycle-model.js';
const solution={light:'photo-help',chlorophyll:'photo-help',mitochondrion:'resp-place',atp:'resp-energy',heat:'resp-energy','glucose-1':'photo-out','glucose-2':'resp-in'};
for(let n=1;n<=12;n++){solution[`co2-${n}`]=n<=6?'photo-in':'resp-out';solution[`water-${n}`]=n<=6?'photo-in':'resp-out';solution[`oxygen-${n}`]=n<=6?'photo-out':'resp-in';}

test('cycle accepts interchangeable copies and checks both full equations',()=>{
 const result=evaluateCycle(solution);assert.equal(result.complete,true);
 for(const zone of result.zones.filter(z=>/-(in|out)$/.test(z.id)))assert.deepEqual(zone.atoms,[6,12,18]);
 const tooFew={...solution};delete tooFew['oxygen-6'];assert.equal(evaluateCycle(tooFew).complete,false);
 const duplicate={...solution,'water-2':'resp-out'};assert.equal(evaluateCycle(duplicate).complete,false);
 const reversed={...solution,'co2-1':'photo-out','glucose-1':'photo-in'};assert.equal(evaluateCycle(reversed).complete,false);
 assert.equal(evaluateCycle({...solution,atp:'resp-out'}).complete,false);
 assert.deepEqual(validPlacements({'co2-1':'photo-in',bogus:'photo-out',heat:'unknown'}),{'co2-1':'photo-in'});
});
