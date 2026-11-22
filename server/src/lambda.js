import {gatewayHandler} from './gateway.js';
import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {configuration} from './config.js';
import {openDatabase} from './database.js';
import {createApp} from './app.js';
let ready;
async function initialize(){
  const result=await new SecretsManagerClient({}).send(new GetSecretValueCommand({SecretId:process.env.PLATFORM_SECRET_ARN}));
  const secrets=JSON.parse(result.SecretString);
  const env={...process.env,...secrets};
  for(const key of ['PLATFORM_ENV','APP_URL','API_URL','RELEASE_BUCKET'])if(process.env[key]!==undefined)env[key]=process.env[key];
  const config=configuration(env);
  const db=await openDatabase(config);
  return gatewayHandler(createApp(db,config),config);
}
export async function handler(event,context){
  context.callbackWaitsForEmptyEventLoop=false;
  ready??=initialize().catch(error=>{ready=null;throw error;});
  return (await ready)(event,context);
}
