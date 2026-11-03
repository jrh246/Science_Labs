import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyPunnett,restorePunnett,checkPunnett} from '../src/investigations/punnett.js';
import {freshState,restoreState} from '../src/investigations/extended-model.js';
import {extendedLabs} from '../src/investigations/extended-content.js';
test('old corn saves gain a blank square and malformed square entries cannot discard observations',()=>{
 const c=extendedLabs.find(c=>c.kind==='corn'),s=freshState(c,12);s.prediction='My original prediction';delete s.punnett;
 assert.deepEqual(restoreState(c,JSON.stringify(s)).punnett,emptyPunnett());
 s.punnett={cells:['PP','script','Pp','pp'],purple:'99',yellow:'1'};
 const restored=restoreState(c,JSON.stringify(s));assert.equal(restored.prediction,s.prediction);assert.deepEqual(restored.punnett,{cells:['PP','','Pp','pp'],purple:'',yellow:'1'});
 assert.deepEqual(restorePunnett(null),emptyPunnett());
 assert.match(checkPunnett({cells:['PP','Pp','Pp','pp'],purple:'3',yellow:'1'}),/75%/);
});
