import {readFile} from 'node:fs/promises';
import {resolve,sep} from 'node:path';
import {randomBytes} from 'node:crypto';
import {S3Client,GetObjectCommand} from '@aws-sdk/client-s3';
import {assert,digest} from './support.js';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.pdf':'application/pdf','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8','.woff':'font/woff','.woff2':'font/woff2'};
export const releaseContentType=file=>types[file.slice(file.lastIndexOf('.'))]||'application/octet-stream';
export function releaseReader(config){
  const s3=config.releaseBucket?new S3Client({}):null;
  return async(release,file)=>{
    assert(/^[a-f0-9]{24}$/.test(release.id)&&!release.disabled_at,410,'This lab version is unavailable.');
    assert(file&&file.split('/').every(part=>part&&part!=='.'&&part!=='..'&&/^[\w.-]+$/.test(part)),404,'File not found.');
    const record=Object.hasOwn(release.manifest.files,file)?release.manifest.files[file]:null;assert(record,404,'Resource not found.');
    let bytes;
    if(s3){const object=await s3.send(new GetObjectCommand({Bucket:config.releaseBucket,Key:`${release.id}/${file}`}));bytes=Buffer.from(await object.Body.transformToByteArray());}
    else{const root=resolve(config.releaseDirectory,release.id),path=resolve(root,file);assert(path.startsWith(root+sep),404,'Resource not found.');bytes=await readFile(path);}
    assert(digest(bytes)===record.sha256,503,'The lab release failed its integrity check. Please contact the site owner.');return bytes;
  };
}
export function runtimeHtml(res,bytes,context,config){
  const serialized=JSON.stringify(context).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const nonce=randomBytes(18).toString('base64');
  res.set('Content-Security-Policy',`default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; worker-src 'none'; frame-ancestors ${config.appUrl}; base-uri 'self'; form-action 'self'`);
  return Buffer.from(bytes.toString('utf8').replace('<head>',`<head><script nonce="${nonce}">window.__LAB_CONTEXT__=${serialized};</script>`));
}
