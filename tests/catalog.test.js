import test from 'node:test';
import assert from 'node:assert/strict';
import {labs,units,labPath,searchCatalog} from '../src/catalog.js';
test('every planned chapter has a unique lab in the correct unit',()=>{
 assert.equal(labs.length,47);assert.equal(units.length,8);
 assert.equal(new Set(labs.map(l=>l.id)).size,47);
 assert.equal(new Set(labs.map(labPath)).size,47);
 for(const lab of labs){const unit=units.find(u=>u.id===lab.unitId);assert.ok(unit);assert.ok(lab.chapter>=unit.start&&lab.chapter<=unit.end);assert.ok(!/chapter \d/i.test(lab.title));}
 assert.deepEqual(labs.filter(l=>l.status==='available').map(l=>l.id),['osmosis-homeostasis']);
 assert.ok(labs.filter(l=>l.status==='planned').every(l=>!l.launchUrl));
});
test('search finds topics, references, and units with availability filtering',()=>{
 assert.equal(searchCatalog('OSMOSIS')[0].id,'osmosis-homeostasis');
 assert.ok(searchCatalog('chapter 8').some(l=>l.chapter===8));
 assert.ok(searchCatalog('genetics').some(l=>l.chapter===13));
 assert.equal(searchCatalog('',{availableOnly:true}).length,1);
 assert.equal(searchCatalog('unfindable').length,0);
});
