import {spawn,spawnSync} from 'node:child_process';
import {createServer} from 'node:net';
import {resolve} from 'node:path';
// Never open a second embedded database while another local API is running.
async function requireFreePort(port){await new Promise((accept,reject)=>{const probe=createServer();probe.once('error',()=>reject(new Error('Port '+port+' is already in use. Stop the existing local platform before restarting it.')));probe.listen(port,'127.0.0.1',()=>probe.close(accept));});}
await requireFreePort(3301);await requireFreePort(4310);
const env={...process.env,PLATFORM_LOCAL:'true',PLATFORM_ENV:'local'};
function run(args){const child=spawnSync(process.execPath,args,{env,stdio:'inherit'});if(child.error)throw child.error;if(child.status!==0)process.exit(child.status||1);}
// Local owner previews use immutable builds too; source availability alone is not registration.
run(['scripts/build-platform.mjs']);
run(['--env-file-if-exists=server/.env','server/scripts/local-setup.js','--latest']);
const api=spawn(process.execPath,['--env-file-if-exists=.env','src/local.js'],{cwd:resolve('server'),env,stdio:'inherit'});
const frontend=spawn(process.execPath,[resolve('node_modules/vite/bin/vite.js'),'--config','vite.platform.config.js'],{env,stdio:'inherit'});
function close(){api.kill();frontend.kill();}
process.on('SIGINT',close);process.on('SIGTERM',close);
api.on('exit',code=>{if(code){frontend.kill();process.exitCode=code;}});
frontend.on('exit',code=>{api.kill();process.exitCode=code||0;});
