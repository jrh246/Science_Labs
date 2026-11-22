import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {createApp} from '../src/app.js';
import {gatewayHandler} from '../src/gateway.js';
import {registerRelease,publish} from '../src/catalog.js';
import {digest} from '../src/support.js';
let db,server,base,config,folder,manifest,parent,other;
const password='Public-labs-test-password-2026',version='c'.repeat(24),labId='genetic-information';
const pdf=Buffer.from([0x25,0x50,0x44,0x46,0x0a,0xff,0x80,0x00]);
async function request(path,body,who,method=body===undefined?'GET':'POST'){
 const response=await fetch(base+'/api'+path,{method,headers:{Origin:config.appUrl,...(who?{Cookie:who.cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
 const raw=await response.text();let data;try{data=JSON.parse(raw);}catch{data=raw;}return {status:response.status,data,cookies:response.headers.getSetCookie()};
}
async function user(name){
 const email=name+'@example.test';assert.equal((await request('/auth/sign-up/email',{name,email,password})).status,200);
 const row=(await db.query('SELECT html FROM email_outbox WHERE recipient=$1',[email])).rows[0];
 await fetch(row.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&').replace(config.apiUrl,base),{redirect:'manual'});
 const login=await request('/auth/sign-in/email',{email,password});assert.equal(login.status,200);
 return {id:login.data.user.id,cookie:login.cookies.map(c=>c.split(';')[0]).join(';')};
}
const report={schemaVersion:2,labId,title:'My DNA evidence',question:'How does information move?',status:'Complete',student:{name:'Sam Parent'},sections:[{heading:'Explanation',blocks:[{type:'response',prompt:'How does information move?',text:'My own exact explanation <>&.'}]}]};
before(async()=>{
 folder=await mkdtemp(join(tmpdir(),'public-labs-test-'));config=configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'test',LOCAL_DATA_DIR:':memory:',RELEASE_DIRECTORY:folder});db=await openDatabase(config);await migrate(db);
 const {app}=createApp(db,config);server=createServer(app);await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;
 parent=await user('parent');other=await user('other');await db.query('INSERT INTO platform_owners(user_id) VALUES($1)',[parent.id]);
 const files={'investigation.html':Buffer.from('<html><head></head><body>Public lab</body></html>'),'lab.html':Buffer.from('<html><head></head><body>Other lab</body></html>'),'assets/test.js':Buffer.from('export const lab=true;'),'resources/genetic-information-teacher-guide.pdf':pdf,'resources/private.pdf':pdf};
 await mkdir(join(folder,version,'assets'),{recursive:true});await mkdir(join(folder,version,'resources'));
 for(const [name,bytes] of Object.entries(files))await writeFile(join(folder,version,name),bytes);
 manifest={id:version,commit:'d'.repeat(40),capabilities:['public-lab-runtime-v1','membership-features-v1'],courses:[{id:'biology',title:'Biology',description:'Science'}],units:[{id:'genetics',courseId:'biology',title:'Genetics',description:'DNA',position:1}],labs:[{id:labId,unitId:'genetics',title:'DNA information',summary:'Follow the message.',position:1,entry:'investigation.html',resources:[]}],files:Object.fromEntries(Object.entries(files).map(([name,bytes])=>[name,{sha256:digest(bytes),bytes:bytes.length}]))};
 await registerRelease(db,manifest);for(const [kind,id] of [['course','biology'],['unit','genetics'],['lab',labId]])await publish(db,parent,kind,id,{published:true,...(kind==='lab'?{release_id:version,access:'free'}:{})});
});
after(async()=>{await new Promise(r=>server.close(r));await db.end();assert.ok(folder.startsWith(join(tmpdir(),'public-labs-test-')));await rm(folder,{recursive:true,force:true});});
test('public lab and declared assets work without creating accounts or runtime grants',async()=>{
 const users=(await db.query('SELECT count(*) FROM "user"')).rows[0].count;
 const launch=await request('/public/labs/'+labId);assert.equal(launch.status,200,JSON.stringify(launch.data));assert.equal(launch.data.public,true);assert.ok(!launch.data.url.includes('grant'));
 const response=await fetch(launch.data.url.replace(config.apiUrl,base));assert.equal(response.status,200);const html=await response.text();assert.match(html,/"mode":"public"/);assert.ok(!html.includes(parent.id));assert.match(response.headers.get('content-security-policy'),/worker-src 'none'/);assert.equal(response.headers.get('cache-control'),'no-store');
 const prefix='/public/labs/'+labId+'/runtime/'+version+'/';assert.equal((await request(prefix+'assets/test.js')).status,200);assert.equal((await request(prefix+'resources/private.pdf')).status,404);assert.equal((await request(prefix+'lab.html')).status,404);assert.equal((await request(prefix+'investigation.html?lab=other')).status,404);
 assert.equal((await request('/public/labs/'+labId+'/runtime/'+'a'.repeat(24)+'/investigation.html?lab='+labId)).status,409);
 assert.equal((await db.query('SELECT count(*) FROM runtime_grants')).rows[0].count,0);assert.equal((await db.query('SELECT count(*) FROM "user"')).rows[0].count,users);
 assert.equal((await request('/launch',{labId})).status,401);assert.equal((await request('/favorites')).status,401);assert.equal((await request('/teacher/labs')).status,401);
});
test('older public runtimes cannot restore obsolete free-account controls',async()=>{
 const legacy={...manifest,id:'e'.repeat(24),capabilities:['public-lab-runtime-v1']};await registerRelease(db,legacy);await publish(db,parent,'lab',labId,{release_id:legacy.id});
 assert.equal((await request('/public/labs/'+labId)).status,409);assert.equal((await request('/public/labs/'+labId+'/runtime/'+legacy.id+'/investigation.html?lab='+labId)).status,409);assert.equal((await request('/launch',{labId},other)).status,409);
 await publish(db,parent,'lab',labId,{release_id:version});assert.equal((await request('/public/labs/'+labId)).status,200);
});
test('public PDF delivery through Lambda keeps binary bytes without a cookie',async()=>{
 const handler=gatewayHandler(createApp(db,config),config);const result=await handler({version:'2.0',routeKey:'$default',rawPath:`/api/public/labs/${labId}/runtime/${version}/resources/genetic-information-teacher-guide.pdf`,rawQueryString:'',headers:{host:'localhost'},requestContext:{requestId:'public-pdf',http:{method:'GET',sourceIp:'127.0.0.1',protocol:'HTTP/1.1'}}},{});
 assert.equal(result.statusCode,200,result.body);assert.match(result.headers['content-type'],/^application\/pdf/);assert.deepEqual(Buffer.from(result.body,result.isBase64Encoded?'base64':'utf8'),pdf);
});
test('free accounts get favorites and public labs while account saving requires membership',async()=>{
 for(let i=0;i<2;i++)assert.equal((await request('/favorites/'+labId,{},parent,'PUT')).status,200);
 assert.equal((await request('/favorites',undefined,parent)).data.length,1);assert.equal((await request('/favorites',undefined,other)).data.length,0);
 const free=(await request('/me',undefined,other)).data;assert.equal(free.features.tier,'free');assert.equal(free.features.cloudPractice,false);assert.equal(free.features.teaching,false);assert.equal(free.organizations.length,0);
 assert.equal((await request('/classes',undefined,other)).status,402);assert.equal((await request('/teacher/labs',undefined,other)).status,402);assert.equal((await request('/practice',undefined,other)).status,402);
 assert.equal((await request('/launch',{labId},other)).data.public,true);
 const body={storage:{'science-labs:/:genetic-information:v1':'{"answer":"My exact work"}'},report,expectedRevision:0};
 const path='/practice/'+labId+'/'+version;assert.equal((await request(path,body,other,'PUT')).status,402);const saved=await request(path,body,parent,'PUT');assert.equal(saved.status,200,JSON.stringify(saved.data));assert.equal(saved.data.revision,1);
 assert.equal((await request(path,body,parent,'PUT')).status,409);assert.equal((await request(path,undefined,other)).status,402);
 assert.equal((await request(path,{...body,report:{...report,labId:'wrong'},expectedRevision:1},parent,'PUT')).status,400);
 const own=(await request(path,undefined,parent)).data.attempt;assert.equal(own.report.sections[0].blocks[0].text,'My own exact explanation <>&.');assert.equal((await request('/practice',undefined,parent)).data[0].can_resume,true);
 const launch=await request('/launch',{labId},parent),html=await(await fetch(launch.data.url.replace(config.apiUrl,base),{headers:{Cookie:parent.cookie}})).text();assert.match(html,/"practice":true/);assert.ok(html.includes('My exact work'));assert.ok(!html.includes(other.id));
 assert.equal((await request('/me',undefined,parent)).data.organizations.length,0);assert.equal((await db.query('SELECT count(*) FROM organizations')).rows[0].count,0);
});

test('trial, paid subscription, school license, and expiry project the same server feature gates',async()=>{
 const workspace=(await request('/workspaces',{name:'Optional teacher trial'},other)).data;
 assert.ok(workspace.id);let me=(await request('/me',undefined,other)).data;assert.equal(me.features.tier,'trial');assert.equal(me.features.teaching,true);assert.equal(me.features.cloudPractice,true);assert.equal(me.features.canCreateWorkspace,false);
 const path='/practice/'+labId+'/'+version,body={storage:{answer:JSON.stringify('My retained work')},report,expectedRevision:0};assert.equal((await request(path,body,other,'PUT')).status,200);
 await db.query("UPDATE organizations SET trial_ends_at=now()-interval '1 day' WHERE id=$1",[workspace.id]);
 me=(await request('/me',undefined,other)).data;assert.equal(me.features.tier,'free');assert.equal(me.features.teaching,false);assert.equal(me.features.hasPracticeWork,true);
 assert.equal((await request(path,{...body,expectedRevision:1},other,'PUT')).status,402);assert.equal((await request('/practice',undefined,other)).status,402);assert.equal((await request('/classes',undefined,other)).status,402);
 const retained=(await request('/account/practice-export',undefined,other)).data;assert.equal(JSON.parse(retained.attempts[0].storage.answer),'My retained work');assert.equal((await db.query('SELECT revision FROM practice_attempts WHERE user_id=$1',[other.id])).rows[0].revision,1);
 await db.query("UPDATE organizations SET subscription_status='active',subscription_ends_at=now()+interval '1 day' WHERE id=$1",[workspace.id]);me=(await request('/me',undefined,other)).data;assert.equal(me.features.tier,'paid');assert.equal(me.features.teaching,true);assert.equal((await request('/practice',undefined,other)).status,200);
 await db.query("UPDATE organizations SET subscription_ends_at=now()-interval '1 day',license_ends_at=now()+interval '1 day',license_plan='school',license_seat_limit=5 WHERE id=$1",[workspace.id]);me=(await request('/me',undefined,other)).data;assert.equal(me.features.tier,'paid');assert.equal(me.features.cloudPractice,true);
 await db.query("UPDATE organizations SET license_ends_at=now()-interval '1 day' WHERE id=$1",[workspace.id]);assert.equal((await request('/me',undefined,other)).data.features.tier,'free');assert.equal((await request('/teacher/labs',undefined,other)).status,402);
 assert.equal((await request('/favorites/'+labId,{},other,'PUT')).status,200);assert.equal((await request('/public/labs/'+labId)).status,200);
});

test('publication and paid access checks apply to every public resource while own records remain retained',async()=>{
 const path='/practice/'+labId+'/'+version,resource='/public/labs/'+labId+'/runtime/'+version+'/assets/test.js';
 await publish(db,parent,'unit','genetics',{published:false});assert.equal((await request(resource)).status,404);assert.equal((await request('/favorites',undefined,parent)).data[0].available,false);assert.equal((await request('/favorites/'+labId,{},other,'PUT')).status,404);
 const hidden=(await request('/favorites',undefined,parent)).data[0];assert.equal(hidden.title,'Unavailable lab');assert.equal(hidden.metadata,undefined);assert.equal(hidden.release_id,undefined);
 assert.equal((await request(path,undefined,parent)).data.attempt.revision,1);assert.equal((await request('/practice',undefined,parent)).data[0].can_resume,false);assert.equal((await request(path,{storage:{},report:null,expectedRevision:1},parent,'PUT')).status,404);
 await publish(db,parent,'unit','genetics',{published:true});await publish(db,parent,'lab',labId,{access:'subscription'});assert.equal((await request(resource)).status,402);assert.equal((await request('/favorites/'+labId,{},other,'PUT')).status,200);assert.equal((await request('/launch',{labId},other)).status,402);
 await publish(db,parent,'lab',labId,{access:'free'});await db.query("UPDATE releases SET disabled_at=now(),disabled_reason='test' WHERE id=$1",[version]);assert.equal((await request(resource)).status,404);
 assert.equal((await request('/favorites/'+labId,undefined,parent,'DELETE')).status,200);assert.equal((await request('/favorites',undefined,parent)).data.length,0);assert.equal((await request(path,undefined,parent)).data.attempt.report.student.name,'Sam Parent');
});
