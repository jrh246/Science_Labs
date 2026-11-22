import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../server/package.json',import.meta.url));
const {S3Client,PutObjectCommand,HeadObjectCommand}=require('@aws-sdk/client-s3');
import {deploymentConfig} from '../server/src/deployment-config.js';
import {openDatabase} from '../server/src/database.js';
import {registerRelease} from '../server/src/catalog.js';
import {digest} from '../server/src/support.js';
const config=await deploymentConfig();
if(!config.releaseBucket)throw new Error('RELEASE_BUCKET is required.');
const latest=JSON.parse(await readFile('.platform-build/latest-release.json','utf8'));
const folder=resolve('.platform-build/releases',latest.id),manifest=JSON.parse(await readFile(resolve(folder,'release.json'),'utf8'));
const s3=new S3Client({});
for(const [file,record] of Object.entries(manifest.files)){
  const bytes=await readFile(resolve(folder,file));if(digest(bytes)!==record.sha256)throw new Error('Release integrity failure: '+file);
  const key=manifest.id+'/'+file;
  try{await s3.send(new PutObjectCommand({Bucket:config.releaseBucket,Key:key,Body:bytes,Metadata:{sha256:record.sha256},IfNoneMatch:'*'}));}
  catch(error){if(error.$metadata?.httpStatusCode!==412)throw error;const existing=await s3.send(new HeadObjectCommand({Bucket:config.releaseBucket,Key:key}));if(existing.Metadata?.sha256!==record.sha256)throw new Error('Existing release cannot be overwritten: '+file);}
}
const db=await openDatabase(config);
try{await registerRelease(db,manifest);console.log('Uploaded and registered immutable release '+manifest.id+'. Publication settings were preserved.');}finally{await db.end();}
