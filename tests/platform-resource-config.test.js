import test from 'node:test';import assert from 'node:assert/strict';import {resolve} from 'node:path';
import platformConfig from '../vite.platform.config.js';
test('local source previews serve public handouts and missing downloads cannot become an HTML fallback',()=>{const config=platformConfig({command:'serve'});assert.equal(config.publicDir,resolve('public'));assert.equal(config.appType,'mpa');assert.equal(config.server.host,'127.0.0.1');});
test('hosted platform builds still exclude the standalone public files',()=>{const config=platformConfig({command:'build'});assert.equal(config.publicDir,false);assert.deepEqual(Object.keys(config.build.rollupOptions.input),['platform']);});
