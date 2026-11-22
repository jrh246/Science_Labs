import {transaction} from './database.js';
import {assert,integer,text} from './support.js';
export const paymentMetricEvents=['invoice.paid','invoice.payment_failed','refund.created','refund.updated','refund.failed'];
const objectId=value=>typeof value==='string'?value:value?.id;
const options={timeout:8000,maxNetworkRetries:0};
export async function recordPaymentMetric(db,stripe,event){
  await transaction(db,async tx=>{
    // Fetch after serialization: stale/out-of-order webhook deliveries cannot
    // overwrite a newer resource snapshot, and retries do not duplicate totals.
    await tx.query("SET LOCAL lock_timeout='3s'");
    await tx.query('SELECT pg_advisory_xact_lock(909939,hashtext($1))',[event.data.object.id]);
    if((await tx.query('SELECT 1 FROM stripe_events WHERE id=$1',[event.id])).rows.length)return;
    const invoice=event.type.startsWith('invoice.');
    const current=invoice?await stripe.invoices.retrieve(event.data.object.id,{},options):await stripe.refunds.retrieve(event.data.object.id,{expand:['charge']},options);
    let customer=objectId(current.customer);
    if(!invoice&&!customer){const charge=typeof current.charge==='object'?current.charge:await stripe.charges.retrieve(current.charge,{},options);customer=objectId(charge.customer);}
    const org=(await tx.query('SELECT id FROM organizations WHERE stripe_customer_id=$1',[customer])).rows[0];assert(org,409,'Payment metrics workspace is not registered.');
    const currency=text(current.currency,'Currency',3);assert(/^[a-z]{3}$/.test(currency),400,'Invalid currency.');
    const amount=integer(invoice?current.amount_paid:current.amount,'Payment amount',0,Number.MAX_SAFE_INTEGER);
    const key=text(current.id,'Payment record',100),status=text(current.status,'Payment status',40);
    if(invoice){
      const paid=current.status_transitions?.paid_at;
      assert(status!=='paid'||Number.isSafeInteger(paid)&&paid>0,409,'The paid invoice needs its confirmed payment timestamp.');
      await tx.query(`INSERT INTO billing_invoices(invoice_id,organization_id,currency,livemode,amount_paid,status,paid_at) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(invoice_id) DO UPDATE SET currency=EXCLUDED.currency,livemode=EXCLUDED.livemode,amount_paid=EXCLUDED.amount_paid,status=EXCLUDED.status,paid_at=EXCLUDED.paid_at,updated_at=now()`,[key,org.id,currency,Boolean(current.livemode),amount,status,paid?new Date(paid*1000).toISOString():null]);
    }else{
      assert(Number.isSafeInteger(current.created)&&current.created>0,409,'The refund needs its creation timestamp.');
      await tx.query(`INSERT INTO billing_refunds(refund_id,organization_id,currency,livemode,amount,status,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT(refund_id) DO UPDATE SET currency=EXCLUDED.currency,livemode=EXCLUDED.livemode,amount=EXCLUDED.amount,status=EXCLUDED.status,updated_at=now()`,[key,org.id,currency,Boolean(current.livemode),amount,status,new Date(current.created*1000).toISOString()]);
    }
    await tx.query('INSERT INTO stripe_events(id,event_type) VALUES($1,$2)',[event.id,event.type]);
  });
}
