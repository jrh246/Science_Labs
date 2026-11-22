import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const serverRoot=fileURLToPath(new URL('../',import.meta.url));
export function configuration(env=process.env) {
  const local=env.PLATFORM_LOCAL==='true';
  const appUrl=env.APP_URL||'http://localhost:4310';
  const apiUrl=env.API_URL||'http://localhost:3301';
  const environment=env.PLATFORM_ENV||'local';
  if(local&&environment!=='local'&&environment!=='test')throw new Error('The local database is restricted to local/test environments.');
  const secret=env.BETTER_AUTH_SECRET||(local?'local-development-only-secret-change-before-deployment-2026':null);
  if(!secret||secret.length<32)throw new Error('Set BETTER_AUTH_SECRET to a random secret of at least 32 characters.');
  if(!local&&!['development','production'].includes(environment))throw new Error('Set PLATFORM_ENV to development or production for deployed services.');
  if(!local&&!env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
  if(!local&&(!env.RESEND_API_KEY||!env.EMAIL_FROM))throw new Error('RESEND_API_KEY and a verified EMAIL_FROM are required.');
  if(!local&&(!appUrl.startsWith('https://')||!apiUrl.startsWith('https://')))throw new Error('Deployed APP_URL and API_URL must use HTTPS.');
  if(Boolean(env.GOOGLE_CLIENT_ID)!==Boolean(env.GOOGLE_CLIENT_SECRET))throw new Error('Configure both Google OAuth credentials or neither.');
  if(env.OPENAI_DRAFTING_ENABLED==='true'&&(!env.OPENAI_API_KEY||!env.OPENAI_MODEL))throw new Error('OpenAI drafting needs a server API key and model.');
  return {
    metricsEnabled:env.METRICS_ENABLED!=='false',
    googleClientId:env.GOOGLE_CLIENT_ID,googleClientSecret:env.GOOGLE_CLIENT_SECRET,
    aiEnabled:env.OPENAI_DRAFTING_ENABLED==='true',aiQueueUrl:env.AI_DRAFT_QUEUE_URL,openaiKey:env.OPENAI_API_KEY,openaiModel:env.OPENAI_MODEL,aiHourlyLimit:Math.max(1,Math.min(50,Number.parseInt(env.OPENAI_HOURLY_LIMIT||'10',10)||10)),
    local,environment,appUrl:new URL(appUrl).origin,apiUrl:new URL(apiUrl).origin,secret,
    databaseUrl:env.DATABASE_URL,localData:env.LOCAL_DATA_DIR===':memory:'?':memory:':resolve(serverRoot,env.LOCAL_DATA_DIR||'../.platform-local'),
    resendKey:env.RESEND_API_KEY,emailFrom:env.EMAIL_FROM||'Science Labs <local@example.test>',
    releaseDirectory:resolve(serverRoot,env.RELEASE_DIRECTORY||'../.platform-build/releases'),releaseBucket:env.RELEASE_BUCKET,
    billingEnabled:env.STRIPE_BILLING_ENABLED==='true',stripeSecret:env.STRIPE_SECRET_KEY,
    stripeWebhookSecret:env.STRIPE_WEBHOOK_SECRET,
    stripePrices:{teacher_monthly:env.STRIPE_TEACHER_MONTHLY_PRICE,teacher_annual:env.STRIPE_TEACHER_ANNUAL_PRICE,school_annual:env.STRIPE_SCHOOL_ANNUAL_PRICE},
    port:Number(env.PORT||3301),trialDays:Math.max(0,Math.min(365,Number.parseInt(env.TRIAL_DAYS||'14',10)||0)),
  };
}
