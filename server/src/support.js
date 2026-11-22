import {createHash,randomBytes} from 'node:crypto';
export class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
export function assert(condition,status,message){if(!condition)throw new HttpError(status,message);}
export function text(value,label,max=5000,{optional=false}={}){
  assert(typeof value==='string',400,`${label} must be text.`);
  const result=value.trim();assert((optional||result.length>0)&&result.length<=max,400,`${label} must be ${optional?'at most':'between 1 and'} ${max} characters.`);return result;
}
export function email(value){const result=text(value,'Email',254).toLowerCase();assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result),400,'Enter a valid email address.');return result;}
export function id(value){assert(typeof value==='string'&&/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i.test(value),400,'Invalid record ID.');return value;}
export function integer(value,label,min=0,max=10000){assert(Number.isInteger(value)&&value>=min&&value<=max,400,`${label} must be a whole number from ${min} to ${max}.`);return value;}
export function date(value,{optional=true}={}){if((value===null||value==='')&&optional)return null;assert(typeof value==='string'&&Number.isFinite(Date.parse(value)),400,'Enter a valid date and time.');return new Date(value).toISOString();}
export function bool(value,label){assert(typeof value==='boolean',400,`${label} must be true or false.`);return value;}
export const digest=value=>createHash('sha256').update(value).digest('hex');
export const token=()=>randomBytes(32).toString('base64url');
export const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function entitled(org,now=Date.now()){
  return [org.license_ends_at,org.trial_ends_at].some(value=>value&&Date.parse(value)>now)||(['active','trialing'].includes(org.subscription_status)&&org.subscription_ends_at&&Date.parse(org.subscription_ends_at)>now);
}
export function effectiveOrganization(org,now=Date.now()){return org.license_ends_at&&Date.parse(org.license_ends_at)>now&&org.license_plan?{...org,plan:org.license_plan,seat_limit:org.license_seat_limit||1}:org;}
export async function audit(db,user,kind,entity,before,after){await db.query('INSERT INTO publication_history(actor_id,kind,entity_id,before_value,after_value) VALUES($1,$2,$3,$4,$5)',[user.id,kind,entity,JSON.stringify(before),JSON.stringify(after)]);}
export async function rateLimit(db,bucket,max,seconds=3600){
  const result=await db.query(`INSERT INTO platform_rate_limits(bucket,window_start,count) VALUES($1,now(),1)
    ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN platform_rate_limits.window_start<now()-($2*interval '1 second') THEN 1 ELSE platform_rate_limits.count+1 END,
    window_start=CASE WHEN platform_rate_limits.window_start<now()-($2*interval '1 second') THEN now() ELSE platform_rate_limits.window_start END RETURNING count`,[bucket,seconds]);
  assert(result.rows[0].count<=max,429,'Too many requests. Please try again later.');
}
export function storageSnapshot(value){
  assert(value&&typeof value==='object'&&!Array.isArray(value),400,'Saved work must be an object.');
  const entries=Object.entries(value);assert(entries.length<=30,400,'Too many saved work records.');
  for(const [key,entry] of entries){assert(key.length<=400&&!['__proto__','constructor','prototype','__sync'].includes(key)&&typeof entry==='string',400,'Invalid saved work record.');try{JSON.parse(entry);}catch{throw new HttpError(400,'Saved work contains invalid JSON.');}}
  assert(Buffer.byteLength(JSON.stringify(value))<=1500000,413,'Saved work is too large. Download a local report and contact your teacher.');
  return value;
}
function reportDocument(document,labId,status){
  assert(document&&document.labId===labId&&document.schemaVersion===2&&document.status===status,400,'Invalid report document.');
  assert(Array.isArray(document.sections)&&document.sections.length<=200,400,'The report needs readable evidence sections.');
  assert(typeof document.title==='string'&&typeof document.question==='string'&&document.student&&typeof document.student==='object',400,'Invalid report identity.');
  for(const section of document.sections){
    assert(typeof section.heading==='string'&&Array.isArray(section.blocks)&&section.blocks.length<=2000,400,'Invalid report section.');
    for(const block of section.blocks){
      assert(block&&['table','paragraph','response'].includes(block.type),400,'Invalid report content.');
      if(block.type==='table'){
        assert(Array.isArray(block.columns)&&block.columns.length>0&&block.columns.length<=24&&block.columns.every(cell=>typeof cell==='string')&&Array.isArray(block.rows)&&block.rows.length<=5000,400,'Invalid report table.');
        assert(block.rows.every(row=>Array.isArray(row)&&row.length===block.columns.length&&row.every(cell=>cell===null||typeof cell==='string'||typeof cell==='number'&&Number.isFinite(cell))),400,'Invalid report table values.');
      }else assert(typeof block.text==='string'&&(block.type!=='response'||typeof block.prompt==='string'),400,'Invalid written response.');
    }
  }
}
export function reportSnapshot(value,labId){
  assert(value&&typeof value==='object'&&!Array.isArray(value)&&value.labId===labId&&value.schemaVersion===2,400,'The report must match this lab and report version.');
  assert(['Complete','In progress'].includes(value.status),400,'Invalid report status.');
  reportDocument(value.document||value,labId,value.status);
  assert(Buffer.byteLength(JSON.stringify(value))<=1500000,413,'The report is too large.');
  return value;
}
