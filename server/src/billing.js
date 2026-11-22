import {paymentMetricEvents,recordPaymentMetric} from './payment-metrics.js';
import Stripe from 'stripe';
import {transaction} from './database.js';
import {organization} from './access.js';
import {assert,integer} from './support.js';

export function billingService(pool,config,{client}={}){
  const stripe=client||(config.stripeSecret?new Stripe(config.stripeSecret):null);
  function enabled(){assert(config.billingEnabled&&stripe&&config.stripeWebhookSecret,503,'Online billing is not enabled yet. Your owner can provide a pilot or school license.');}
  return {
    async checkout(user,body){
      enabled();const org=await organization(pool,user,body.organizationId,{billing:true});
      const price=config.stripePrices[body.plan];assert(price,400,'Choose a configured subscription plan.');
      const seats=body.plan==='school_annual'?integer(body.seats,'Teacher seats',1,10000):1;
      assert(!org.stripe_subscription_id||!['active','trialing','past_due','unpaid'].includes(org.subscription_status),409,'Manage the existing subscription through billing settings.');
      let customer=org.stripe_customer_id;
      if(!customer){
        const created=await stripe.customers.create({email:user.email,name:org.name,metadata:{organizationId:org.id}},{idempotencyKey:`customer/${config.environment}/${org.id}`});customer=created.id;
        await pool.query('UPDATE organizations SET stripe_customer_id=$2 WHERE id=$1 AND stripe_customer_id IS NULL',[org.id,customer]);
      }
      const session=await stripe.checkout.sessions.create({mode:'subscription',customer,
        line_items:[{price,quantity:seats}],client_reference_id:org.id,
        subscription_data:{metadata:{organizationId:org.id,plan:body.plan==='school_annual'?'school':'teacher'}},
        success_url:config.appUrl+'/platform.html#/billing?checkout=success',cancel_url:config.appUrl+'/platform.html#/billing',
      },{idempotencyKey:`checkout/${config.environment}/${org.id}/${body.plan}/${seats}/${Math.floor(Date.now()/300000)}`});return {url:session.url};
    },
    async portal(user,body){enabled();const org=await organization(pool,user,body.organizationId,{billing:true});assert(org.stripe_customer_id,409,'This workspace has no billing account yet.');return stripe.billingPortal.sessions.create({customer:org.stripe_customer_id,return_url:config.appUrl+'/platform.html#/billing'});},
    async webhook(raw,signature){
      enabled();assert(signature,400,'Missing payment signature.');let event;
      try{event=stripe.webhooks.constructEvent(raw,signature,config.stripeWebhookSecret);}catch{assert(false,400,'Invalid payment signature.');}
      if(paymentMetricEvents.includes(event.type)){await recordPaymentMetric(pool,stripe,event);return {received:true};}
      // Retrieve the current subscription so late/out-of-order notifications
      // cannot restore an older payment state. Persist event + access atomically.
      if(!['customer.subscription.created','customer.subscription.updated','customer.subscription.deleted'].includes(event.type))return {received:true};
      const subscription=event.type==='customer.subscription.deleted'?event.data.object:await stripe.subscriptions.retrieve(event.data.object.id);
      await transaction(pool,async db=>{
        const inserted=await db.query('INSERT INTO stripe_events(id,event_type) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',[event.id,event.type]);if(!inserted.rows.length)return;
        const org=(await db.query('SELECT * FROM organizations WHERE stripe_customer_id=$1 FOR UPDATE',[typeof subscription.customer==='string'?subscription.customer:subscription.customer.id])).rows[0];
        assert(org,409,'Billing workspace is not registered.');
        if(org.stripe_subscription_id&&org.stripe_subscription_id!==subscription.id&&event.type==='customer.subscription.deleted')return;
        if(org.stripe_subscription_id&&org.stripe_subscription_id!==subscription.id&&Number(subscription.created||0)<Number(org.subscription_created_at))return;
        const item=subscription.items?.data?.[0];
        const priceId=item?.price?.id;
        const plan=Object.entries(config.stripePrices).find(([,value])=>value&&value===priceId)?.[0];
        assert(plan||event.type==='customer.subscription.deleted',409,'Unknown subscription price.');
        const end=subscription.current_period_end||item?.current_period_end;
        await db.query(`UPDATE organizations SET stripe_subscription_id=$2,subscription_status=$3,subscription_ends_at=$4,
          plan=$5,seat_limit=$6,subscription_created_at=$7 WHERE id=$1`,[org.id,subscription.id,event.type==='customer.subscription.deleted'?'canceled':subscription.status,end?new Date(end*1000).toISOString():null,
          plan==='school_annual'?'school':'teacher',plan==='school_annual'?integer(item.quantity,'Teacher seats',1,10000):1,subscription.created||0]);
      });return {received:true};
    },
  };
}
