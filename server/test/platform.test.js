import {gatewayHandler} from '../src/gateway.js';
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {createApp} from '../src/app.js';
import {registerRelease,publish} from '../src/catalog.js';
import {billingService} from '../src/billing.js';
import {digest} from '../src/support.js';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
let db,server,base,config,releaseDirectory,manifest,ownerUser,teacher,student,outsider,workspace,classroom,assignment;
const password='ScienceLabs-test-password-2026';
const binaryAsset=Buffer.from([0x25,0x50,0x44,0x46,0x2d,0x31,0x2e,0x37,0x0a,0x25,0xff,0xfe,0x80,0x00,0x0a]);
async function request(path,body,who,method=body===undefined?'GET':'POST'){
  const response=await fetch(base+'/api'+path,{method,headers:{Origin:config.appUrl,...(body===undefined?{}:{'Content-Type':'application/json'}),...(who?.cookie?{Cookie:who.cookie}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
  const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}
  return {status:response.status,data,cookies:response.headers.getSetCookie?.()||[],headers:response.headers};
}
async function user(name){
  const address=name+'@example.test';const signed=await request('/auth/sign-up/email',{name,email:address,password,callbackURL:config.appUrl+'/platform.html#/login'});assert.equal(signed.status,200,JSON.stringify(signed.data));
  const row=(await db.query('SELECT html FROM email_outbox WHERE recipient=$1 ORDER BY created_at DESC LIMIT 1',[address])).rows[0];assert.ok(row,'Verification email recorded');
  const url=row.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');
  const verify=await fetch(url.replace(config.apiUrl,base),{redirect:'manual'});assert.equal(verify.status,302,await verify.text());
  const login=await request('/auth/sign-in/email',{email:address,password});assert.equal(login.status,200,JSON.stringify(login.data));
  return {id:login.data.user.id,name,email:address,cookie:login.cookies.map(cookie=>cookie.split(';')[0]).join(';')};
}
before(async()=>{
  releaseDirectory=await mkdtemp(join(tmpdir(),'science-platform-test-'));
  config=configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'test',LOCAL_DATA_DIR:':memory:',RELEASE_DIRECTORY:releaseDirectory});
  db=await openDatabase(config);await migrate(db);
  const {app}=createApp(db,config);server=createServer(app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}`;
});
after(async()=>{await new Promise(resolve=>server?.close(resolve));await db?.end();assert.ok(releaseDirectory.startsWith(join(tmpdir(),'science-platform-test-')));await rm(releaseDirectory,{recursive:true,force:true});});

test('real Better Auth signup, verification, sessions and owner bootstrap',async()=>{
  ownerUser=await user('owner');teacher=await user('teacher');student=await user('student');outsider=await user('outsider');
  assert.equal((await request('/me',undefined,teacher)).data.owner,false);
  assert.equal((await request('/owner/catalog',undefined,teacher)).status,403);
  await db.query('INSERT INTO platform_owners(user_id) VALUES($1)',[ownerUser.id]);
  assert.equal((await request('/me',undefined,ownerUser)).data.owner,true);
  assert.equal((await request('/me')).status,401);
});
test('verification required, password reset mail and state-changing origin checks',async()=>{
  const signed=await request('/auth/sign-up/email',{name:'Unverified',email:'unverified@example.test',password});assert.equal(signed.status,200);
  assert.equal((await request('/auth/sign-in/email',{email:'unverified@example.test',password})).status,403);
  assert.equal((await request('/auth/request-password-reset',{email:teacher.email,redirectTo:config.appUrl+'/platform.html#/reset-password'})).status,200);
  const row=(await db.query("SELECT * FROM email_outbox WHERE recipient=$1 AND subject LIKE 'Reset%'",[teacher.email])).rows[0];assert.ok(row.html.includes('Reset password'));
  const response=await fetch(base+'/api/workspaces',{method:'POST',headers:{Cookie:teacher.cookie,'Content-Type':'application/json',Origin:'https://untrusted.example'},body:JSON.stringify({name:'Wrong origin'})});assert.equal(response.status,403);
});
test('immutable release registration and inherited publishing without exposing drafts',async()=>{
  const html=Buffer.from('<!doctype html><html><head></head><body>TEST LAB</body></html>');
  manifest={id:'a'.repeat(24),commit:'b'.repeat(40),courses:[{id:'biology',title:'Biology',description:'Science'}],units:[{id:'genetics',courseId:'biology',title:'Genetics',description:'DNA',position:1}],labs:[{id:'genetic-information',unitId:'genetics',title:'DNA to RNA to Protein',summary:'A model',position:1,entry:'investigation.html',resources:[]}],files:{'investigation.html':{sha256:digest(html),bytes:html.length}}};
  await mkdir(join(releaseDirectory,manifest.id));await writeFile(join(releaseDirectory,manifest.id,'investigation.html'),html);
  await mkdir(join(releaseDirectory,manifest.id,'resources'));
  await writeFile(join(releaseDirectory,manifest.id,'resources','worksheet.pdf'),binaryAsset);
  manifest.files['resources/worksheet.pdf']={sha256:digest(binaryAsset),bytes:binaryAsset.length};
  await registerRelease(db,manifest);await registerRelease(db,manifest);
  assert.equal((await request('/catalog')).data.labs.length,0);
  await publish(db,ownerUser,'lab','genetic-information',{release_id:manifest.id,published:true,access:'subscription'});
  await publish(db,ownerUser,'unit','genetics',{published:true});assert.equal((await request('/catalog')).data.labs.length,0);
  await publish(db,ownerUser,'course','biology',{published:true});assert.equal((await request('/catalog')).data.labs.length,1);
  await assert.rejects(()=>registerRelease(db,{...manifest,commit:'c'.repeat(40)}));
});
test('teacher trial, class creation, invitation binding and one-time redemption',async()=>{
  const result=await request('/workspaces',{name:'Biology teacher'},teacher);assert.equal(result.status,201,JSON.stringify(result.data));workspace=result.data;
  const created=await request('/classes',{organizationId:workspace.id,name:'Biology 9',period:'3'},teacher);assert.equal(created.status,201);classroom=created.data;
  const invitation=await request(`/classes/${classroom.id}/invitations`,{email:student.email},teacher);assert.equal(invitation.status,201);assert.equal(invitation.data.delivery,'sent');
  const mail=(await db.query('SELECT html FROM email_outbox WHERE recipient=$1 ORDER BY created_at DESC LIMIT 1',[student.email])).rows[0];
  const secret=new URL(mail.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&')).hash.split('token=')[1];
  assert.equal((await request('/invitations/accept',{token:secret},outsider)).status,403);
  assert.equal((await request('/invitations/accept',{token:secret},student)).status,200);
  assert.equal((await request('/invitations/accept',{token:secret},student)).status,410);
  assert.equal((await request('/classes/'+classroom.id,undefined,outsider)).status,404);
});
test('assignments pin released versions and survive catalog unpublishing',async()=>{
  const assigned=await request(`/classes/${classroom.id}/assignments`,{labId:'genetic-information',title:'Trace the message',instructions:'Use evidence.',dueAt:'2020-01-01T00:00:00Z'},teacher);assert.equal(assigned.status,201,JSON.stringify(assigned.data));assignment=assigned.data;
  assert.equal(assignment.release_id,manifest.id);
  await publish(db,ownerUser,'course','biology',{published:false});
  assert.equal((await request('/catalog')).data.labs.length,0);
  assert.equal((await request('/launch',{assignmentId:assignment.id},student)).status,200);
  assert.equal((await request('/launch',{labId:'genetic-information'},teacher)).status,404);
  assert.equal((await request('/assignments/'+assignment.id+'/attempt',undefined,outsider)).status,404);
});
test('cloud saves reject stale revisions; submissions and teacher review retain verbatim work',async()=>{
  const storage={'science-labs:/:genetic-information:v1':JSON.stringify({prediction:'My words: α β & DNA',complete:true})};
  const report={schemaVersion:2,labId:'genetic-information',title:'DNA to RNA to Protein',status:'Complete',student:{name:'Zoë García'},prediction:'My exact words <>&',explanations:[{prompt:'Why?',response:'mRNA carries the message.'}]};
  report.document={schemaVersion:2,labId:report.labId,title:report.title,question:'How is the message used?',student:report.student,status:report.status,sections:[{heading:'Explanation',blocks:[{type:'response',prompt:'Why?',text:'mRNA carries the message.'}]}]};
  let result=await request(`/assignments/${assignment.id}/attempt`,{storage,report,expectedRevision:0},student,'PUT');assert.equal(result.status,200,JSON.stringify(result.data));assert.equal(result.data.revision,1);
  assert.equal((await request(`/assignments/${assignment.id}/attempt`,{storage,report,expectedRevision:0},student,'PUT')).status,409);
  assert.equal((await request(`/assignments/${assignment.id}/submit`,{revision:5},student)).status,409);
  const submitted=await request(`/assignments/${assignment.id}/submit`,{revision:1},student);assert.equal(submitted.status,201);assert.equal(submitted.data.late,true);
  assert.equal((await request(`/assignments/${assignment.id}/submit`,{revision:1},student)).data.id,submitted.data.id);
  assert.equal((await request('/submissions/'+submitted.data.id,undefined,outsider)).status,404);
  assert.equal((await request('/submissions/'+submitted.data.id+'/review',{feedback:'Explain the nuclear pore.',score:8,maxScore:10,returnForRevision:true},teacher)).status,200);
  const retained=(await request('/submissions/'+submitted.data.id,undefined,student)).data;assert.equal(retained.report.prediction,report.prediction);assert.equal(retained.review.feedback,'Explain the nuclear pore.');
  result=await request(`/assignments/${assignment.id}/attempt`,{storage,report:{...report,prediction:'Revised'},expectedRevision:1},student,'PUT');assert.equal(result.status,200);
  assert.equal((await request('/submissions/'+submitted.data.id,undefined,student)).data.report.prediction,report.prediction);
  assert.equal((await request('/submissions/'+submitted.data.id+'/review',{feedback:'Student cannot grade self'},student)).status,404);
});
test('runtime requires a user-bound launch and injects only that assignment scope',async()=>{
  const launch=await request('/launch',{assignmentId:assignment.id},student);assert.equal(launch.status,200);
  const url=launch.data.url.replace(config.apiUrl,base);
  let response=await fetch(url,{headers:{Cookie:outsider.cookie}});assert.equal(response.status,403);
  response=await fetch(url,{headers:{Cookie:student.cookie}});assert.equal(response.status,200);
  const html=await response.text();assert.ok(html.includes(assignment.id));assert.ok(html.includes('window.__LAB_CONTEXT__'));assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(response.headers.get('content-security-policy').includes("worker-src 'none'"));
  assert.equal((await request('/runtime/'+manifest.id+'/investigation.html?lab=genetic-information',undefined,student)).status,403);
});
test('API Gateway v2 runtime downloads preserve binary file bytes',async()=>{
  const handler=gatewayHandler(createApp(db,config),config);
  const result=await handler({version:'2.0',routeKey:'$default',rawPath:`/api/runtime/${manifest.id}/resources/worksheet.pdf`,rawQueryString:'',cookies:[student.cookie],headers:{host:'localhost',origin:config.appUrl},requestContext:{requestId:'local-lambda-binary',http:{method:'GET',sourceIp:'127.0.0.1',protocol:'HTTP/1.1'}}},{});
  assert.equal(result.statusCode,200,result.body);
  assert.match(result.headers['content-type'],/^application\/pdf/);
  assert.deepEqual(Buffer.from(result.body,result.isBase64Encoded?'base64':'utf8'),binaryAsset);
});
test('closed assignments retain reports and block further cloud writes',async()=>{
  assert.equal((await request('/assignments/'+assignment.id,{closed:true},teacher,'PATCH')).status,200);
  assert.equal((await request('/assignments/'+assignment.id+'/submit',{revision:2},student)).status,409);
  assert.equal((await request('/assignments/'+assignment.id+'/attempt',undefined,student)).status,200);
});
test('expired licenses stop new assignments without deleting existing student work',async()=>{
  await db.query("UPDATE organizations SET trial_ends_at=now()-interval '1 day' WHERE id=$1",[workspace.id]);
  assert.equal((await request(`/classes/${classroom.id}/assignments`,{labId:'genetic-information'},teacher)).status,402);
  assert.equal((await request('/assignments/'+assignment.id+'/attempt',undefined,student)).status,200);
  assert.equal((await request('/billing/checkout',{organizationId:workspace.id,plan:'teacher_monthly'},teacher)).status,503);
});
test('creating another workspace does not restart an expired account trial',async()=>{
  const before=(await db.query('SELECT trial_ends_at FROM organizations WHERE id=$1',[workspace.id])).rows[0];
  const created=await request('/workspaces',{name:'Another teaching workspace'},teacher);
  assert.equal(created.status,409,JSON.stringify(created.data));
  assert.match(created.data.error,/already owns a teaching workspace/);
  const original=(await db.query('SELECT trial_ends_at FROM organizations WHERE id=$1',[workspace.id])).rows[0];
  assert.equal(Date.parse(before.trial_ends_at),Date.parse(original.trial_ends_at));
  assert.ok(Date.parse(original.trial_ends_at)<Date.now());
});
test('owner licenses, publication rollback and release disable are authorized and audited',async()=>{
  assert.equal((await request(`/owner/workspaces/${workspace.id}/license`,{plan:'school',seatLimit:3,endsAt:'2030-01-01T00:00:00Z'},teacher,'PATCH')).status,403);
  assert.equal((await request(`/owner/workspaces/${workspace.id}/license`,{plan:'school',seatLimit:3,endsAt:'2030-01-01T00:00:00Z'},ownerUser,'PATCH')).status,200);
  const history=(await request('/owner/history',undefined,ownerUser)).data;
  const unpublish=history.find(row=>row.kind==='course'&&row.after_value.published===false);
  assert.equal((await request('/owner/history/'+unpublish.id+'/restore',{},ownerUser)).status,200);
  assert.equal((await request('/catalog')).data.labs.length,1);
  assert.equal((await request(`/owner/releases/${manifest.id}/availability`,{disabled:true,reason:'Review needed'},ownerUser)).status,200);
  assert.equal((await request('/launch',{assignmentId:assignment.id},student)).status,410);
});
test('Stripe signatures, current-state synchronization and duplicate delivery are handled',async()=>{
  await db.query("UPDATE organizations SET stripe_customer_id='cus_test' WHERE id=$1",[workspace.id]);
  let event={id:'evt_one',type:'customer.subscription.updated',data:{object:{id:'sub_test'}}};
  const current={id:'sub_test',customer:'cus_test',status:'active',items:{data:[{price:{id:'price_school'},quantity:4,current_period_end:2000000000}]}};
  const client={webhooks:{constructEvent(_body,signature){if(signature!=='valid')throw new Error('Bad signature');return event;}},subscriptions:{retrieve:async()=>current}};
  const service=billingService(db,{...config,billingEnabled:true,stripeWebhookSecret:'secret',stripePrices:{school_annual:'price_school'}},{client});
  await assert.rejects(()=>service.webhook(Buffer.from('{}'),'invalid'));
  await service.webhook(Buffer.from('{}'),'valid');await service.webhook(Buffer.from('{}'),'valid');
  const org=(await db.query('SELECT * FROM organizations WHERE id=$1',[workspace.id])).rows[0];assert.equal(org.seat_limit,4);assert.equal(org.subscription_status,'active');
  assert.equal((await db.query("SELECT count(*)::int AS n FROM stripe_events WHERE id='evt_one'")).rows[0].n,1);
});

test('API Gateway v2 adapter retains authentication cookies in its Lambda response',{timeout:10000},async()=>{
  const handler=gatewayHandler(createApp(db,config),config);
  const result=await handler({version:'2.0',routeKey:'$default',rawPath:'/api/auth/sign-in/email',rawQueryString:'',headers:{host:'localhost','content-type':'application/json',origin:config.appUrl},requestContext:{requestId:'local-lambda-test',http:{method:'POST',path:'/api/auth/sign-in/email',sourceIp:'127.0.0.1',protocol:'HTTP/1.1'}},body:JSON.stringify({email:teacher.email,password}),isBase64Encoded:false},{});
  assert.equal(result.statusCode,200,result.body);assert.ok(result.cookies.some(cookie=>cookie.startsWith('science-labs-test.session_token=')));
  const current=await handler({version:'2.0',routeKey:'$default',rawPath:'/api/me',rawQueryString:'',cookies:result.cookies.map(cookie=>cookie.split(';')[0]),headers:{host:'localhost',origin:config.appUrl},requestContext:{requestId:'local-lambda-me',http:{method:'GET',path:'/api/me',sourceIp:'127.0.0.1',protocol:'HTTP/1.1'}}},{});
  assert.equal(current.statusCode,200,current.body);assert.equal(JSON.parse(Buffer.from(current.body,current.isBase64Encoded?'base64':'utf8').toString()).user.id,teacher.id);

});
