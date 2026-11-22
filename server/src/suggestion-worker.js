import {deploymentConfig} from './deployment-config.js';
import {openDatabase} from './database.js';
import {runSuggestionJob} from './ai-drafts.js';
let initialized;
export async function handler(event,context){
  context.callbackWaitsForEmptyEventLoop=false;
  initialized||=(async()=>{const config=await deploymentConfig();return {config,db:await openDatabase(config)};})();
  const {config,db}=await initialized;const failures=[];
  for(const record of event.Records||[]){
    try{const message=JSON.parse(record.body);await runSuggestionJob(db,config,message.jobId);}
    catch{failures.push({itemIdentifier:record.messageId});}
  }
  return {batchItemFailures:failures};
}
