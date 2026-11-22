import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {createApp} from '../src/app.js';
import {registerRelease} from '../src/catalog.js';
const config=configuration({...process.env,PLATFORM_LOCAL:'true',PLATFORM_ENV:'local'}),db=await openDatabase(config);
try{
  await migrate(db);const {auth}=createApp(db,config);
  const address='owner@example.test';
  let user=(await db.query('SELECT * FROM "user" WHERE email=$1',[address])).rows[0];
  if(!user){const created=await auth.api.signUpEmail({body:{name:'Local Owner',email:address,password:'ScienceLabs!Local2026'}});user=created.user;await db.query('UPDATE "user" SET "emailVerified"=true WHERE id=$1',[user.id]);}
  await db.query('INSERT INTO platform_owners(user_id) VALUES($1) ON CONFLICT DO NOTHING',[user.id]);
  const latestOnly=process.argv.includes('--latest');
  const releases=latestOnly?[JSON.parse(await readFile(resolve(config.releaseDirectory,'..','latest-release.json'),'utf8')).id]:await readdir(config.releaseDirectory);
  for(const release of releases){if(!/^[a-f0-9]{24}$/.test(release))throw new Error('Invalid local release ID.');await registerRelease(db,JSON.parse(await readFile(resolve(config.releaseDirectory,release,'release.json'),'utf8')));}
  console.log('Registered '+releases.length+' local release(s); publication settings and assigned versions retained.');
  console.log('Local owner: owner@example.test / ScienceLabs!Local2026');
  console.log('Local accounts and email stay on this computer. All content starts unpublished; choose versions and publication settings in Manage publishing.');
}finally{await db.end();}
