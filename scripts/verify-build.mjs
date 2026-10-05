import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const sw=readFileSync('dist/sw.js','utf8');
const files=JSON.parse(sw.match(/const FILES = (.*);/)[1]);
if(new Set(files).size!==files.length)throw new Error('Duplicate offline-cache URLs');
const missing=files.filter(file=>!existsSync(resolve('dist',file)));
if(missing.length)throw new Error('Offline cache references missing assets: '+missing.join(', '));
console.log(`Verified ${files.length} offline-cache URLs against the final build.`);
