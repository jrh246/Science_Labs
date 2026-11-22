import {createHmac} from 'node:crypto';
import {assert,id,integer,rateLimit} from './support.js';
import {transaction} from './database.js';
import {staffAccess,requireStaff} from './staff-access.js';
function range(value){
  const days=Number(value||30);assert([7,30,90].includes(days),400,'Choose 7, 30, or 90 days.');
  const to=new Date();to.setUTCHours(0,0,0,0);to.setUTCDate(to.getUTCDate()+1);const from=new Date(to);from.setUTCDate(from.getUTCDate()-days);
  return {days,from:from.toISOString(),to:to.toISOString(),timezone:'UTC'};
}
export async function purgeTraffic(db,now=new Date()){
  const cutoff=new Date(now);cutoff.setUTCHours(0,0,0,0);cutoff.setUTCDate(cutoff.getUTCDate()-89);
  return transaction(db,async tx=>{
    const events=await tx.query('DELETE FROM traffic_events WHERE day<$1',[cutoff.toISOString().slice(0,10)]);
    await tx.query('DELETE FROM traffic_sessions WHERE day<$1',[cutoff.toISOString().slice(0,10)]);
    await tx.query("DELETE FROM platform_rate_limits WHERE bucket LIKE 'traffic/%' AND window_start<now()-interval '1 day'");return {events:events.rowCount};
  });
}
export function installTrafficCollector(app,db,config,{session}){
  app.post('/api/traffic',async(req,res)=>{
    if(!config.metricsEnabled||req.get('DNT')==='1'||req.get('Sec-GPC')==='1'||/bot|crawler|spider|headless|slurp/i.test(req.get('user-agent')||'')){res.json({accepted:false});return;}
    const user=await session(req);if(user&&(await staffAccess(db,user)).active){res.json({accepted:false});return;}
    const body=req.body;assert(body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).every(key=>['eventId','sessionId','page','labId','source','device'].includes(key)),400,'Invalid traffic event.');
    const eventId=id(body.eventId),sessionId=id(body.sessionId);assert(['library','lab','membership','signup'].includes(body.page),400,'This page is not measured.');
    assert(['direct','search','social','other'].includes(body.source)&&['phone','tablet','desktop'].includes(body.device),400,'Invalid traffic category.');
    let labId=null;
    if(body.page==='lab'){
      assert(typeof body.labId==='string'&&/^[a-z0-9-]{1,100}$/.test(body.labId),400,'Invalid public lab.');labId=body.labId;
      assert((await db.query('SELECT 1 FROM labs l JOIN units u ON u.id=l.unit_id JOIN courses c ON c.id=u.course_id JOIN releases r ON r.id=l.release_id WHERE l.id=$1 AND l.published AND u.published AND c.published AND r.disabled_at IS NULL',[labId])).rows.length,400,'This lab is not measured.');
    }else assert(body.labId===undefined||body.labId===null,400,'Only lab pages include a lab identifier.');
    const day=new Date().toISOString().slice(0,10),hash=value=>createHmac('sha256',config.secret).update(day+':'+value).digest('hex');
    await rateLimit(db,'traffic/ip/'+hash(req.ip||'unknown'),600,60);await rateLimit(db,'traffic/session/'+hash(sessionId),120,60);
    const accepted=await transaction(db,async tx=>{
      const saved=await tx.query('INSERT INTO traffic_events(id,day,session_key,page,lab_id,source,device) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING RETURNING id',[eventId,day,hash(sessionId),body.page,labId,body.source,body.device]);
      if(!saved.rows.length)return false;
      await tx.query('INSERT INTO traffic_sessions(day,session_key,views) VALUES($1,$2,1) ON CONFLICT(day,session_key) DO UPDATE SET views=traffic_sessions.views+1,last_seen=now()',[day,hash(sessionId)]);return true;
    });res.json({accepted,duplicate:!accepted});
  });
}
export function installStaffMetrics(app,db,config){
  app.get('/api/staff/metrics/traffic',async(req,res)=>{
    await requireStaff(db,req.user,'metrics.traffic.read');const period=range(req.query.days),args=[period.from,period.to];
    const [totals,daily,labs,sources,devices,coverage]=await Promise.all([
      db.query(`SELECT count(*)::int AS sessions,COALESCE(sum(views),0)::int AS views,count(*) FILTER(WHERE views=1)::int AS single_page_sessions FROM traffic_sessions WHERE day>=($1::timestamptz AT TIME ZONE 'UTC')::date AND day<($2::timestamptz AT TIME ZONE 'UTC')::date`,args),
      db.query(`SELECT day::text,count(*)::int AS sessions,COALESCE(sum(views),0)::int AS views FROM traffic_sessions WHERE day>=($1::timestamptz AT TIME ZONE 'UTC')::date AND day<($2::timestamptz AT TIME ZONE 'UTC')::date GROUP BY day ORDER BY day`,args),
      db.query(`SELECT e.lab_id,count(*)::int AS views FROM traffic_events e WHERE e.page='lab' AND e.created_at>=$1 AND e.created_at<$2 GROUP BY e.lab_id ORDER BY views DESC,e.lab_id LIMIT 15`,args),
      db.query('SELECT source,count(*)::int AS views FROM traffic_events WHERE created_at>=$1 AND created_at<$2 GROUP BY source ORDER BY views DESC,source',args),
      db.query('SELECT device,count(*)::int AS views FROM traffic_events WHERE created_at>=$1 AND created_at<$2 GROUP BY device ORDER BY views DESC,device',args),
      db.query('SELECT min(created_at) AS first_event FROM traffic_events')
    ]);
    const total=totals.rows[0];res.json({period,environment:config.environment,enabled:config.metricsEnabled,firstEvent:coverage.rows[0].first_event,
      ...total,viewsPerSession:total.sessions?total.views/total.sessions:null,singlePageRate:total.sessions?total.single_page_sessions/total.sessions:null,
      daily:daily.rows,labs:labs.rows,sources:sources.rows,devices:devices.rows});
  });
  app.get('/api/staff/metrics/business',async(req,res)=>{
    await requireStaff(db,req.user,'metrics.business.read');const period=range(req.query.days),args=[period.from,period.to];
    const customer=`NOT EXISTS(SELECT 1 FROM platform_owners x WHERE x.user_id=u.id) AND NOT EXISTS(SELECT 1 FROM staff_members m WHERE m.user_id=u.id)`;
    const workspace=`NOT EXISTS(SELECT 1 FROM platform_owners x WHERE x.user_id=o.created_by) AND NOT EXISTS(SELECT 1 FROM staff_members m WHERE m.user_id=o.created_by)`;
    const [accounts,workspaces,learning,payments,refunds]=await Promise.all([
      db.query(`SELECT count(*)::int AS accounts,count(*) FILTER(WHERE "emailVerified")::int AS verified_accounts,count(*) FILTER(WHERE "createdAt">=$1 AND "createdAt"<$2)::int AS new_accounts FROM "user" u WHERE ${customer}`,args),
      db.query(`SELECT count(*)::int AS workspaces,count(*) FILTER(WHERE created_at>=$1 AND created_at<$2)::int AS new_workspaces,
        count(*) FILTER(WHERE trial_ends_at>now())::int AS active_trials,
        count(*) FILTER(WHERE subscription_status='active' AND subscription_ends_at>now())::int AS active_subscriptions,
        count(*) FILTER(WHERE license_ends_at>now())::int AS active_licenses,
        count(*) FILTER(WHERE subscription_status IN ('past_due','unpaid'))::int AS payment_attention FROM organizations o WHERE ${workspace}`,args),
      db.query(`SELECT (SELECT count(*)::int FROM classes WHERE NOT archived) AS active_classes,
        (SELECT count(*)::int FROM assignments WHERE publication_state='published' AND created_at>=$1 AND created_at<$2) AS new_assignments,
        (SELECT count(*)::int FROM submissions WHERE submitted_at>=$1 AND submitted_at<$2) AS submissions,
        (SELECT count(*)::int FROM lab_favorites) AS favorites,
        (SELECT count(*)::int FROM labs l JOIN units u ON u.id=l.unit_id JOIN courses c ON c.id=u.course_id JOIN releases r ON r.id=l.release_id WHERE l.published AND u.published AND c.published AND r.disabled_at IS NULL) AS published_labs`,args),
      db.query("SELECT currency,livemode,sum(amount_paid)::text AS amount FROM billing_invoices WHERE status='paid' AND paid_at>=$1 AND paid_at<$2 GROUP BY currency,livemode ORDER BY currency,livemode",args),
      db.query("SELECT currency,livemode,sum(amount)::text AS amount FROM billing_refunds WHERE status='succeeded' AND created_at>=$1 AND created_at<$2 GROUP BY currency,livemode ORDER BY currency,livemode",args)
    ]);
    const money=new Map();for(const row of payments.rows)money.set(row.currency+row.livemode,{currency:row.currency,livemode:row.livemode,paid:row.amount,refunded:'0'});
    for(const row of refunds.rows){const key=row.currency+row.livemode;const record=money.get(key)||{currency:row.currency,livemode:row.livemode,paid:'0',refunded:'0'};record.refunded=row.amount;money.set(key,record);}
    res.json({period,billingEnabled:config.billingEnabled,...accounts.rows[0],...workspaces.rows[0],...learning.rows[0],payments:[...money.values()].map(row=>({...row,net:(BigInt(row.paid)-BigInt(row.refunded)).toString()}))});
  });
  app.get('/api/staff/metrics/operations',async(req,res)=>{
    await requireStaff(db,req.user,'metrics.operations.read');const period=range(req.query.days),args=[period.from,period.to];
    const [email,jobs,stalled]=await Promise.all([
      db.query('SELECT status,count(*)::int AS count FROM email_outbox WHERE created_at>=$1 AND created_at<$2 GROUP BY status ORDER BY status',args),
      db.query('SELECT status,count(*)::int AS count FROM teacher_ai_suggestions WHERE created_at>=$1 AND created_at<$2 GROUP BY status ORDER BY status',args),
      db.query("SELECT count(*)::int AS count FROM teacher_ai_suggestions WHERE status='running' AND updated_at<now()-interval '10 minutes'")
    ]);res.json({period,environment:config.environment,billingEnabled:config.billingEnabled,aiEnabled:config.aiEnabled,email:email.rows,jobs:jobs.rows,stalledJobs:stalled.rows[0].count});
  });
}
