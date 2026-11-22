import {test} from 'node:test';
import assert from 'node:assert/strict';
import Stripe from 'stripe';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {mailer} from '../src/mail.js';
import {billingService} from '../src/billing.js';
import {entitled,effectiveOrganization,storageSnapshot,reportSnapshot} from '../src/support.js';

test('hosted environments cannot use demo storage, missing secrets, or HTTP origins',()=>{
  assert.throws(()=>configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'production'}));
  assert.throws(()=>configuration({PLATFORM_ENV:'production'}));
  assert.throws(()=>configuration({PLATFORM_ENV:'development',DATABASE_URL:'postgres://example',BETTER_AUTH_SECRET:'x'.repeat(40),RESEND_API_KEY:'test',EMAIL_FROM:'test@example.test'}));
});
test('manual licenses retain their seats independently of a canceled Stripe subscription',()=>{
  const org={trial_ends_at:'2020-01-01',license_ends_at:'2030-01-01',license_plan:'school',license_seat_limit:5,plan:'teacher',seat_limit:1,subscription_status:'canceled'};
  assert.equal(entitled(org),true);assert.equal(effectiveOrganization(org).seat_limit,5);
  assert.equal(entitled({...org,license_ends_at:'2020-01-01'}),false);
});
test('malformed storage and reports for a different lab cannot be saved',()=>{
  assert.throws(()=>storageSnapshot({key:'not JSON'}));
  assert.throws(()=>storageSnapshot(JSON.parse('{"__proto__":"{}"}')));
  assert.throws(()=>reportSnapshot({labId:'other',schemaVersion:2,status:'Complete'},'enzyme-activity'));
});
test('migrations can be safely repeated and email failures stay visible and retryable',async()=>{
  const config=configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'test',LOCAL_DATA_DIR:':memory:'});const db=await openDatabase(config);
  try{
    await migrate(db);await migrate(db);let fail=true,deliveries=0;
    const mail=mailer(db,config,{transport:async()=>{deliveries++;if(fail)throw new Error('Temporary delivery error');return 'test-mail';}});
    let result=await mail.send({to:'teacher@example.test',subject:'Class invitation',html:'<p>Local test only</p>',key:'mail-test/one'});assert.equal(result.status,'failed');
    fail=false;result=await mail.retry(result.id);assert.equal(result.status,'sent');await mail.retry(result.id);assert.equal(deliveries,2);
    const row=(await db.query("SELECT status,attempts FROM email_outbox WHERE dedupe_key='mail-test/one'")).rows[0];assert.equal(row.status,'sent');assert.equal(row.attempts,2);
  }finally{await db.end();}
});
test('Stripe uses its real SDK signature validation before processing any event',async()=>{
  const secret='whsec_local_test_only',client=new Stripe('sk_test_not_a_real_key');
  const payload=JSON.stringify({id:'evt_signature_test',type:'unhandled.test',data:{object:{}}});
  const signature=client.webhooks.generateTestHeaderString({payload,secret});
  const billing=billingService(null,{billingEnabled:true,stripeWebhookSecret:secret},{client});
  assert.deepEqual(await billing.webhook(Buffer.from(payload),signature),{received:true});
  await assert.rejects(()=>billing.webhook(Buffer.from(payload+' '),signature));
});
