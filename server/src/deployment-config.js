import {SecretsManagerClient,GetSecretValueCommand} from '@aws-sdk/client-secrets-manager';
import {configuration} from './config.js';
export async function deploymentConfig(){
  if(!process.env.PLATFORM_SECRET_ARN)return configuration();
  const result=await new SecretsManagerClient({}).send(new GetSecretValueCommand({SecretId:process.env.PLATFORM_SECRET_ARN}));
  const env={...process.env,...JSON.parse(result.SecretString)};
  for(const key of ['PLATFORM_ENV','APP_URL','API_URL','RELEASE_BUCKET','AI_DRAFT_QUEUE_URL'])if(process.env[key]!==undefined)env[key]=process.env[key];
  return configuration(env);
}
