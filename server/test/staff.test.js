import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {randomUUID} from 'node:crypto';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {createApp} from '../src/app.js';
import {registerRelease,publish} from '../src/catalog.js';
import {billingService} from '../src/billing.js';
import {purgeTraffic} from '../src/staff-metrics.js';
let db,server,base,config,owner,analyst,manager,customer,trafficRole,managerRole,businessRole,org;
const password='Staff-integration-password-2026',labId='genetic-information';
async function api(path,body,who,method=body===undefined?'GET':'POST',headers={}){
 const response=await fetch(base+'/api'+path,{method,headers:{Origin:config.appUrl,'User-Agent':'Mozilla/5.0 test-browser',...(body===undefined?{}:{'Content-Type':'application/json'}),...(who?{Cookie:who.cookie}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
 return {status:response.status,data:await response.json(),cookies:response.headers.getSetCookie()};
}
async function user(name){
 const email=name+'@example.test';assert.equal((await api('/auth/sign-up/email',{name,email,password,staff:true,role:'owner'})).status,200);
 const mail=(await db.query('SELECT html FROM email_outbox WHERE recipient=$1',[email])).rows[0];await fetch(mail.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&').replace(config.apiUrl,base),{redirect:'manual'});
 const login=await api('/auth/sign-in/email',{email,password});return {id:login.data.user.id,email,cookie:login.cookies.map(value=>value.split(';')[0]).join(';')};
}
const role=(name,permissions)=>({name,description:'Test-defined role; no product job titles are assumed.',permissions,archived:false});
const event=(sessionId=randomUUID(),page='library')=>({eventId:randomUUID(),sessionId,page,source:'direct',device:'desktop',...(page==='lab'?{labId}:{})});
before(async()=>{
 config=configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'test',LOCAL_DATA_DIR:':memory:'});db=await openDatabase(config);await migrate(db);server=createServer(createApp(db,config).app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
 owner=await user('staff-owner');analyst=await user('traffic-staff');manager=await user('limited-manager');customer=await user('paying-customer');await db.query('INSERT INTO platform_owners(user_id) VALUES($1)',[owner.id]);
 await registerRelease(db,{id:'b'.repeat(24),commit:'c'.repeat(40),capabilities:['public-lab-runtime-v1','membership-features-v1'],courses:[{id:'biology',title:'Biology',description:''}],units:[{id:'genetics',courseId:'biology',title:'Genetics',description:'',position:1}],labs:[{id:labId,unitId:'genetics',title:'Public DNA lab',summary:'DNA',position:1,entry:'investigation.html'}],files:{}});
 for(const [kind,id] of [['course','biology'],['unit','genetics'],['lab',labId]])await publish(db,owner,kind,id,{published:true,...(kind==='lab'?{release_id:'b'.repeat(24),access:'free'}:{})});
 org=(await api('/workspaces',{name:'Customer workspace'},customer)).data;
});
after(async()=>{await new Promise(resolve=>server.close(resolve));await db.end();});
test('staff access is separate from signup, memberships, and pre-defined job roles',async()=>{
 assert.equal((await db.query('SELECT count(*)::int AS n FROM staff_roles')).rows[0].n,0);
 assert.equal((await api('/staff/me')).status,401);assert.equal((await api('/staff/me',undefined,customer)).status,403);assert.equal((await api('/staff/access',undefined,analyst)).status,403);
 assert.equal((await api('/me',undefined,customer)).data.features.tier,'trial');assert.equal((await api('/me',undefined,customer)).data.staff.active,false);
 const admin=(await api('/staff/me',undefined,owner)).data;assert.equal(admin.owner,true);assert.ok(admin.permissions.includes('staff.manage'));
 trafficRole=(await api('/staff/roles',role('Custom observation team',['metrics.traffic.read']),owner)).data;managerRole=(await api('/staff/roles',role('Custom access team',['staff.manage','metrics.traffic.read']),owner)).data;businessRole=(await api('/staff/roles',role('Custom finance view',['metrics.business.read']),owner)).data;
 assert.ok(trafficRole.id&&managerRole.id&&businessRole.id);assert.equal((await api('/staff/roles',role('Spoof',['*']),owner)).status,400);
 for(const [who,r] of [[analyst,trafficRole],[manager,managerRole]])assert.equal((await api('/staff/members',{email:who.email,active:true,roles:[r.id],expectedRevision:0},owner,'PUT')).status,200);
 const me=(await api('/me',undefined,analyst)).data;assert.equal(me.staff.active,true);assert.equal(me.features.tier,'free');assert.equal(me.features.teaching,false);assert.deepEqual(me.staff.permissions,['metrics.traffic.read']);
 assert.equal((await api('/staff/metrics/traffic',undefined,analyst)).status,200);assert.equal((await api('/staff/metrics/business',undefined,analyst)).status,403);assert.equal((await api('/staff/audit',undefined,analyst)).status,403);
});
test('limited staff managers cannot escalate, edit stronger roles, or alter their own access',async()=>{
 assert.equal((await api('/staff/roles',role('Unauthorized business',['metrics.business.read']),manager)).status,403);
 assert.equal((await api('/staff/roles/'+businessRole.id,{...role('Changed',['metrics.traffic.read']),expectedRevision:1},manager,'PUT')).status,403);
 assert.equal((await api('/staff/members',{email:customer.email,active:true,roles:[businessRole.id],expectedRevision:0},manager,'PUT')).status,403);
 assert.equal((await api('/staff/members',{email:manager.email,active:true,roles:[managerRole.id],expectedRevision:1},manager,'PUT')).status,403);
 assert.equal((await api('/staff/members',{email:owner.email,active:false,roles:[],expectedRevision:0},owner,'PUT')).status,409);
 assert.equal((await api('/staff/members',{email:'missing@example.test',active:true,roles:[],expectedRevision:0},owner,'PUT')).status,400);
 assert.equal((await db.query('SELECT count(*)::int AS n FROM staff_roles')).rows[0].n,3);
});
test('revocation, archived roles, and stale edits are enforced with existing sessions',async()=>{
 assert.equal((await api('/staff/members',{email:analyst.email,active:false,roles:[trafficRole.id],expectedRevision:1},owner,'PUT')).status,200);assert.equal((await api('/staff/metrics/traffic',undefined,analyst)).status,403);
 assert.equal((await api('/staff/members',{email:analyst.email,active:true,roles:[trafficRole.id],expectedRevision:1},owner,'PUT')).status,409);
 await api('/staff/members',{email:analyst.email,active:true,roles:[trafficRole.id],expectedRevision:2},owner,'PUT');
 assert.equal((await api('/staff/roles/'+trafficRole.id,{...role(trafficRole.name,trafficRole.permissions),archived:true,expectedRevision:1},owner,'PUT')).status,200);assert.equal((await api('/staff/metrics/traffic',undefined,analyst)).status,403);assert.equal((await api('/staff/me',undefined,analyst)).data.active,true);
 await api('/staff/roles/'+trafficRole.id,{...role(trafficRole.name,trafficRole.permissions),archived:false,expectedRevision:2},owner,'PUT');assert.equal((await api('/staff/metrics/traffic',undefined,analyst)).status,200);
 const audit=(await api('/staff/audit',undefined,owner)).data;assert.ok(audit.some(row=>row.action==='member.updated'));assert.ok(audit.some(row=>row.action==='role.updated'));assert.ok(!JSON.stringify(audit).includes(password));
});
test('traffic counts are deduplicated, aggregate-only, and honor privacy and internal-traffic exclusions',async()=>{
 const sessionId=randomUUID(),first=event(sessionId),second=event(sessionId,'lab'),third=event();third.source='search';
 assert.equal((await api('/traffic',first)).data.accepted,true);assert.equal((await api('/traffic',first)).data.duplicate,true);assert.equal((await api('/traffic',second)).data.accepted,true);assert.equal((await api('/traffic',third)).data.accepted,true);
 for(const headers of [{DNT:'1'},{'Sec-GPC':'1'},{'User-Agent':'Googlebot'}])assert.equal((await api('/traffic',event(),undefined,'POST',headers)).data.accepted,false);
 assert.equal((await api('/traffic',event(),owner)).data.accepted,false);assert.equal((await api('/traffic',event(),analyst)).data.accepted,false);
 assert.equal((await api('/traffic',{...event(),studentName:'Must never be stored'})).status,400);assert.equal((await api('/traffic',{...event(),page:'classroom'})).status,400);
 const traffic=(await api('/staff/metrics/traffic?days=7',undefined,analyst)).data;assert.equal(traffic.views,3);assert.equal(traffic.sessions,2);assert.equal(traffic.singlePageRate,.5);assert.equal(traffic.viewsPerSession,1.5);assert.equal(traffic.labs[0].views,1);assert.equal(traffic.period.timezone,'UTC');
 assert.equal((await api('/staff/metrics/traffic?days=999',undefined,owner)).status,400);
 const stored=JSON.stringify((await db.query('SELECT * FROM traffic_events')).rows);assert.ok(!stored.includes(sessionId));assert.ok(!stored.includes(customer.id));assert.ok(!stored.includes('Must never be stored'));
});
test('business and operations metrics show server aggregates without customer records',async()=>{
 const business=await api('/staff/metrics/business',undefined,owner);assert.equal(business.status,200,JSON.stringify(business.data));assert.equal(business.data.accounts,1);assert.equal(business.data.new_workspaces,1);assert.equal(business.data.published_labs,1);assert.deepEqual(business.data.payments,[]);assert.equal(business.data.billingEnabled,false);assert.ok(!JSON.stringify(business.data).includes(customer.email));
 const operations=await api('/staff/metrics/operations',undefined,owner);assert.equal(operations.status,200,JSON.stringify(operations.data));assert.ok(operations.data.email.some(row=>row.status==='sent'));assert.ok(!JSON.stringify(operations.data).includes('html'));assert.ok(!JSON.stringify(operations.data).includes(customer.email));
});
test('verified Stripe records stay idempotent and current, without granting access or mixing currencies/modes',async()=>{
 await db.query('UPDATE organizations SET stripe_customer_id=$2 WHERE id=$1',[org.id,'cus_metrics']);const now=Math.floor(Date.now()/1000);
 let eventObject={id:'evt_invoice_one',type:'invoice.paid',data:{object:{id:'in_metrics'}}},invoice={id:'in_metrics',customer:'cus_metrics',currency:'usd',amount_paid:10000,status:'paid',status_transitions:{paid_at:now},livemode:false};
 let refund={id:'re_metrics',customer:'cus_metrics',currency:'usd',amount:2500,status:'pending',created:now,livemode:false};
 const client={webhooks:{constructEvent(_raw,signature){if(signature!=='valid')throw new Error('Invalid');return eventObject;}},invoices:{retrieve:async()=>invoice},refunds:{retrieve:async()=>refund}};
 const billing=billingService(db,{...config,billingEnabled:true,stripeWebhookSecret:'fixture'},{client});await assert.rejects(()=>billing.webhook(Buffer.from('{}'),'invalid'));
 await billing.webhook(Buffer.from('{}'),'valid');await billing.webhook(Buffer.from('{}'),'valid');eventObject={id:'evt_invoice_two',type:'invoice.paid',data:{object:{id:invoice.id}}};await billing.webhook(Buffer.from('{}'),'valid');assert.equal((await db.query('SELECT count(*)::int AS n FROM billing_invoices')).rows[0].n,1);
 eventObject={id:'evt_refund_pending',type:'refund.created',data:{object:{id:refund.id}}};await billing.webhook(Buffer.from('{}'),'valid');refund={...refund,status:'succeeded'};eventObject={id:'evt_refund_done',type:'refund.updated',data:{object:{id:refund.id}}};await billing.webhook(Buffer.from('{}'),'valid');
 // An older event is delivered later; retrieving the resource keeps its latest state.
 eventObject={id:'evt_refund_late',type:'refund.created',data:{object:{id:refund.id,status:'pending'}}};await billing.webhook(Buffer.from('{}'),'valid');
 invoice={...invoice,id:'in_metrics_live',currency:'jpy',amount_paid:800,livemode:true};eventObject={id:'evt_invoice_live',type:'invoice.paid',data:{object:{id:invoice.id}}};await billing.webhook(Buffer.from('{}'),'valid');
 const payments=(await api('/staff/metrics/business',undefined,owner)).data.payments;assert.deepEqual(payments.find(row=>row.currency==='usd'),{currency:'usd',livemode:false,paid:'10000',refunded:'2500',net:'7500'});assert.equal(payments.find(row=>row.currency==='jpy').livemode,true);assert.equal(payments.find(row=>row.currency==='jpy').paid,'800');
 assert.equal((await db.query('SELECT subscription_status FROM organizations WHERE id=$1',[org.id])).rows[0].subscription_status,'none');
});
test('retention removes expired traffic but preserves recent counts and financial/security records',async()=>{
 const oldDay='2020-01-01',key='a'.repeat(64);await db.query('INSERT INTO traffic_sessions(day,session_key,views) VALUES($1,$2,1)',[oldDay,key]);await db.query('INSERT INTO traffic_events(id,day,session_key,page,source,device,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),oldDay,key,'library','direct','desktop','2020-01-01T00:00:00Z']);
 assert.equal((await purgeTraffic(db)).events,1);assert.equal((await db.query('SELECT count(*)::int AS n FROM traffic_events')).rows[0].n,3);assert.equal((await db.query('SELECT count(*)::int AS n FROM billing_invoices')).rows[0].n,2);assert.ok((await db.query('SELECT count(*)::int AS n FROM staff_audit_log')).rows[0].n>0);
});
