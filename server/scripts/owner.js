import {deploymentConfig} from '../src/deployment-config.js';
import {openDatabase} from '../src/database.js';
const address=process.argv[2]?.trim().toLowerCase();
if(!address)throw new Error('Usage: npm run owner -- verified-owner@example.com');
const db=await openDatabase(await deploymentConfig());
try{
  const user=(await db.query('SELECT id,"emailVerified" FROM "user" WHERE email=$1',[address])).rows[0];
  if(!user?.emailVerified)throw new Error('Create this account and verify its email before granting owner access.');
  await db.query('INSERT INTO platform_owners(user_id) VALUES($1) ON CONFLICT DO NOTHING',[user.id]);
  console.log('Owner access granted to the verified account.');
}finally{await db.end();}
