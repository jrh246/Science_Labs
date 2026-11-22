import {spawnSync,execFileSync} from 'node:child_process';
import {readFile,readdir,mkdir,copyFile,writeFile,cp,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {labs,units} from '../src/catalog.js';
import {sordariaExtension} from '../src/investigations/extended-content.js';
const runtime=resolve('.platform-build/runtime');
const vite=resolve('node_modules/vite/bin/vite.js');
function build(args,env={}){const result=spawnSync(process.execPath,[vite,'build',...args],{stdio:'inherit',env:{...process.env,...env}});if(result.status)process.exit(result.status);}
build(['--base=./','--outDir',runtime],{VITE_PLATFORM_RUNTIME:'true'});
// Authenticated labs never install a service worker. Leave it out of private
// releases rather than hashing the standalone worker's build-specific metadata.
await unlink(resolve(runtime,'sw.js'));
const files={};
async function scan(folder,prefix=''){for(const entry of (await readdir(folder,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=prefix+entry.name;if(entry.isDirectory())await scan(resolve(folder,entry.name),path+'/');else{const bytes=await readFile(resolve(folder,entry.name));if(bytes.length>4*1024*1024)throw new Error('Runtime file exceeds the current API delivery limit: '+path);files[path]={sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};}}}
await scan(runtime);
const released=labs.filter(lab=>lab.status==='available').map((lab,index)=>({id:lab.id,unitId:lab.unitId,title:lab.title,summary:lab.summary,position:index,entry:lab.id==='osmosis-homeostasis'?'lab.html':'investigation.html',resources:lab.resources,modes:lab.modes,virtualOnly:lab.virtualOnly||false}));
released.push({id:sordariaExtension.id,unitId:'genetics',title:sordariaExtension.title,summary:sordariaExtension.question,position:99,entry:'investigation.html',resources:[],modes:['Virtual','Classroom']});
const commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim());
const content={commit,dirty,capabilities:['teacher-lab-overlays-v1','public-lab-runtime-v1','membership-features-v1'],courses:[{id:'biology',title:'Biology',description:'Interactive investigations from cells to ecosystems.'}],units:units.map(unit=>({id:unit.id,courseId:'biology',title:unit.title,description:unit.description,position:unit.number})),labs:released,files};
const id=createHash('sha256').update(JSON.stringify(content)).digest('hex').slice(0,24);
const directory=resolve('.platform-build/releases',id);await mkdir(directory,{recursive:true});await cp(runtime,directory,{recursive:true});
await writeFile(resolve(directory,'release.json'),JSON.stringify({id,...content},null,2)+'\n');
await writeFile('.platform-build/latest-release.json',JSON.stringify({id,directory},null,2)+'\n');

build(['--config','vite.platform.config.js']);
await copyFile('dist-platform/platform.html','dist-platform/index.html');
console.log(`Built portal and immutable lab release ${id} (${released.length} labs). Upload runtime files to the private release bucket before registering the release.`);
