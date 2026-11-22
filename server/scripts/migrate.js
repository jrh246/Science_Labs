import {deploymentConfig} from '../src/deployment-config.js';
import {openDatabase,migrate} from '../src/database.js';
const db=await openDatabase(await deploymentConfig());
try{await migrate(db);console.log('Platform migrations applied.');}finally{await db.end();}
