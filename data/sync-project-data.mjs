import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const source=path.dirname(fileURLToPath(import.meta.url));
const target=path.resolve(process.argv[2]??'');
if(!process.argv[2])throw new Error('Pass a project-data destination folder.');
if(target===source||target.startsWith(source+path.sep))throw new Error('Destination must be outside source data folder.');
const manifest={syncedOn:new Date().toISOString(),canonicalDataDirectory:source,files:[]};
for(const folder of ['curriculum','development-tracker']){
 const walk=(from,relative)=>{for(const e of fs.readdirSync(from,{withFileTypes:true})){if(e.isSymbolicLink())throw new Error('Symlinks are not copied');const rel=path.join(relative,e.name),src=path.join(from,e.name);if(e.isDirectory())walk(src,rel);else{const dest=path.join(target,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest);const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');const sha256=hash(src);if(sha256!==hash(dest))throw new Error('Copy verification failed');manifest.files.push({path:rel.replaceAll('\\','/'),sha256});}}};
 walk(path.join(source,folder),folder);
}
fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'SYNC_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Copied and hash-verified ${manifest.files.length} files into ${target}. No unrelated files deleted.`);
