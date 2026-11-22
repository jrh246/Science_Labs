import {deploymentConfig} from './deployment-config.js';
import {openDatabase} from './database.js';
import {purgeTraffic} from './staff-metrics.js';
let initialized;
export async function handler(_event,context){
  context.callbackWaitsForEmptyEventLoop=false;
  initialized||=(async()=>{const config=await deploymentConfig();return openDatabase(config);})();
  return purgeTraffic(await initialized);
}
