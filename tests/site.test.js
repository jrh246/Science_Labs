import test from 'node:test';
import assert from 'node:assert/strict';
import {siteSettings} from '../src/site.js';
test('production keeps saved work and preview has distinct storage and caches',()=>{
 const production=siteSettings('https://jrh246.github.io/Science_Labs/lab.html');
 const development=siteSettings('https://jrh246.github.io/Science_Labs/dev/lab.html');
 assert.equal(production.storageKey,'cell-lab');
 assert.notEqual(development.storageKey,production.storageKey);
 assert.notEqual(development.cachePrefix,production.cachePrefix);
 assert.equal(development.root.pathname,'/Science_Labs/dev/');
 assert.equal(development.development,true);
 assert.equal(siteSettings('https://jrh246.github.io/Science_Labs/dev/#/search').storageKey,development.storageKey);
});
