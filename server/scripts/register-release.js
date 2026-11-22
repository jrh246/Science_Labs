import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {deploymentConfig} from '../src/deployment-config.js';
import {openDatabase} from '../src/database.js';
import {registerRelease} from '../src/catalog.js';
const config=await deploymentConfig(),db=await openDatabase(config);
try{
  const path=process.argv[2];
  const manifests=path?[resolve(path)]:(await readdir(config.releaseDirectory)).map(id=>resolve(config.releaseDirectory,id,'release.json'));
  for(const file of manifests){await registerRelease(db,JSON.parse(await readFile(file,'utf8')));console.log('Registered immutable release from '+file);}
}finally{await db.end();}
