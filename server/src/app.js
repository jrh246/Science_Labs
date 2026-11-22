import {staffAccess,requireStaff,installStaffAccess} from './staff-access.js';
import {installTrafficCollector,installStaffMetrics} from './staff-metrics.js';
import {accountFeatures,requireMembership} from './membership.js';
import express from 'express';
import cors from 'cors';
import {toNodeHandler,fromNodeHeaders} from 'better-auth/node';
import {makeAuth} from './auth.js';
import {mailer} from './mail.js';
import {transaction} from './database.js';
import {billingService} from './billing.js';
import {publish} from './catalog.js';
import {owner,isOwner,organization,classroom,studentAssignment,publishedLab} from './access.js';
import {HttpError,assert,text,email,id,integer,date,bool,digest,token,escape,entitled,effectiveOrganization,audit,rateLimit,storageSnapshot,reportSnapshot} from './support.js';
import {installPublicRuntime} from './public-runtime.js';
import {installPersonalLibrary} from './personal-library.js';
import {installRuntime} from './runtime.js';
import {installDraftAI} from './ai-drafts.js';
import {installAuthoring,ownedRevision,revisionSnapshot,validateTeacherReport} from './authoring.js';

export function createApp(db,config,services={}){
  const mail=mailer(db,config,services.mail||{}),auth=makeAuth(db,config,mail),billing=billingService(db,config,services.billing||{});
  const app=express();app.disable('x-powered-by');app.set('trust proxy',1);
  app.use(cors({origin:[config.appUrl,config.apiUrl],credentials:true,methods:['GET','POST','PUT','PATCH','DELETE'],allowedHeaders:['Content-Type']}));
  app.use((req,res,next)=>{res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'});next();});
  app.post('/api/billing/webhook',express.raw({type:'application/json',limit:'1mb'}),async(req,res)=>res.json(await billing.webhook(req.body,req.get('stripe-signature'))));
  if(config.local)app.use((req,_res,next)=>{req.headers['x-science-client-ip']=req.socket.remoteAddress||'127.0.0.1';next();});
  app.all('/api/auth/*splat',toNodeHandler(auth));
  app.use(express.json({limit:'4mb'}));
  app.get('/api/health',(_req,res)=>res.json({ok:true,environment:config.environment,billingEnabled:config.billingEnabled,googleEnabled:Boolean(config.googleClientId),aiEnabled:Boolean(config.aiEnabled),metricsEnabled:config.metricsEnabled}));
  // Cookie sessions require an exact trusted origin for all state changes.
  app.use('/api',(req,_res,next)=>{if(!['GET','HEAD','OPTIONS'].includes(req.method))assert([config.appUrl,config.apiUrl].includes(req.get('origin')),403,'This request must come from the Science Labs site.');next();});
  async function session(req){const result=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});return result?.user||null;}
  app.get('/api/catalog',async(_req,res)=>{
    const courses=(await db.query('SELECT * FROM courses WHERE published ORDER BY title')).rows;
    const units=(await db.query('SELECT u.* FROM units u JOIN courses c ON c.id=u.course_id WHERE u.published AND c.published ORDER BY u.position')).rows;
    const labs=(await db.query(`SELECT l.id,l.unit_id,l.title,l.summary,l.access,l.release_id,l.metadata FROM labs l JOIN units u ON u.id=l.unit_id
      JOIN courses c ON c.id=u.course_id JOIN releases r ON r.id=l.release_id WHERE l.published AND u.published AND c.published AND r.disabled_at IS NULL ORDER BY l.position,l.title`)).rows;
    res.json({courses,units,labs});
  });
  if(config.local){
    app.get('/api/dev/outbox',async(_req,res)=>res.json((await db.query('SELECT id,recipient,subject,html,status FROM email_outbox ORDER BY created_at DESC LIMIT 100')).rows));
  }
  installTrafficCollector(app,db,config,{session});
  installPublicRuntime(app,db,config,{session});
  app.use('/api',async(req,_res,next)=>{req.user=await session(req);assert(req.user&&req.user.emailVerified,401,'Sign in with a verified email to continue.');next();});
  app.get('/api/me',async(req,res)=>{
    const organizations=(await db.query(`SELECT o.*,m.role FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE m.user_id=$1 ORDER BY o.created_at`,[req.user.id])).rows.map(org=>({...effectiveOrganization(org),entitled:entitled(org)}));
    const owner=await isOwner(db,req.user),features=await accountFeatures(db,req.user,{organizations,owner,trialDays:config.trialDays});
    res.json({user:{id:req.user.id,name:req.user.name,email:req.user.email},owner,organizations,features,staff:await staffAccess(db,req.user),billingEnabled:config.billingEnabled});
  });
  app.use('/api/staff',async(req,_res,next)=>{await requireStaff(db,req.user);next();});
  installStaffAccess(app,db);installStaffMetrics(app,db,config);
  installPersonalLibrary(app,db);
  app.use('/api/teacher',async(req,_res,next)=>{await requireMembership(db,req.user);next();});
  installAuthoring(app,db,config);
  installDraftAI(app,db,config,services.ai||{});
  app.post('/api/workspaces',async(req,res)=>{
    await rateLimit(db,`workspace/${req.user.id}`,5);
    const org=await transaction(db,async tx=>{
      // The schema permits one owned workspace per account. Lock the account
      // before checking so concurrent requests cannot start another trial.
      await tx.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[req.user.id]);
      assert(!(await tx.query('SELECT 1 FROM organizations WHERE created_by=$1',[req.user.id])).rows.length,409,'This account already owns a teaching workspace. Manage its access under Workspace & billing.');
      const row=(await tx.query(`INSERT INTO organizations(name,created_by,trial_ends_at) VALUES($1,$2,now()+($3*interval '1 day')) RETURNING *`,[text(req.body.name,'Workspace name',120),req.user.id,config.trialDays])).rows[0];
      await tx.query("INSERT INTO organization_members(organization_id,user_id,role) VALUES($1,$2,'owner')",[row.id,req.user.id]);return row;
    });res.status(201).json(org);
  });
  app.get('/api/classes',async(req,res)=>{await requireMembership(db,req.user);res.json((await db.query(`SELECT c.*,o.name AS workspace_name,(SELECT count(*)::int FROM enrollments e WHERE e.class_id=c.id) AS student_count
    FROM classes c JOIN organizations o ON o.id=c.organization_id JOIN organization_members m ON m.organization_id=o.id WHERE m.user_id=$1 ORDER BY c.created_at DESC`,[req.user.id])).rows);});
  app.post('/api/classes',async(req,res)=>{
    await organization(db,req.user,req.body.organizationId,{active:true});
    const row=(await db.query('INSERT INTO classes(organization_id,name,period) VALUES($1,$2,$3) RETURNING *',[req.body.organizationId,text(req.body.name,'Class name',120),text(req.body.period||'','Period',40,{optional:true})])).rows[0];res.status(201).json(row);
  });
  app.get('/api/classes/:id',async(req,res)=>{
    const c=await classroom(db,req.user,req.params.id);
    const students=(await db.query('SELECT u.id,u.name,u.email,e.joined_at FROM enrollments e JOIN "user" u ON u.id=e.user_id WHERE e.class_id=$1 ORDER BY u.name',[c.id])).rows;
    const assignments=(await db.query(`SELECT a.*,l.title AS lab_title,(SELECT count(*)::int FROM attempts t WHERE t.assignment_id=a.id AND EXISTS(SELECT 1 FROM submissions s WHERE s.attempt_id=t.id)) AS submitted_count FROM assignments a JOIN labs l ON l.id=a.lab_id WHERE a.class_id=$1 ORDER BY a.created_at DESC`,[c.id])).rows;
    const invitations=(await db.query('SELECT id,email,expires_at,accepted_at FROM invitations WHERE class_id=$1 ORDER BY expires_at DESC',[c.id])).rows;
    res.json({classroom:c,students,assignments,invitations});
  });
  app.patch('/api/classes/:id',async(req,res)=>{const c=await classroom(db,req.user,req.params.id);res.json((await db.query('UPDATE classes SET archived=$2 WHERE id=$1 RETURNING *',[c.id,bool(req.body.archived,'Archived')])).rows[0]);});
  app.delete('/api/classes/:id/students/:studentId',async(req,res)=>{const c=await classroom(db,req.user,req.params.id);await db.query('DELETE FROM enrollments WHERE class_id=$1 AND user_id=$2',[c.id,text(req.params.studentId,'Student ID',100)]);res.json({removed:true});});
  async function invite(req,res,{classId=null,organizationId=null}){
    await rateLimit(db,`invite/${req.user.id}`,100);
    const recipient=email(req.body.email),secret=token();
    const row=(await db.query(`INSERT INTO invitations(token_hash,email,class_id,organization_id,created_by,expires_at) VALUES($1,$2,$3,$4,$5,now()+interval '7 days') RETURNING id`,[digest(secret),recipient,classId,organizationId,req.user.id])).rows[0];
    const link=config.appUrl+'/platform.html#/join?token='+secret;
    const sent=await mail.send({to:recipient,subject:'You are invited to Science Labs',html:`<h1>Join Science Labs</h1><p>${escape(req.user.name)} invited you to ${classId?'a class':'a teaching workspace'}.</p><p><a href="${escape(link)}">Accept invitation</a></p><p>Sign in with ${escape(recipient)}. This invitation expires in seven days.</p>`,key:`invitation/${row.id}`});
    res.status(201).json({id:row.id,email:recipient,delivery:sent.status,message:sent.status==='sent'?(config.local?'Invitation is ready in the local email outbox.':'Invitation sent.'):'Invitation created, but email delivery failed. Use Resend invitation to try again.'});
  }
  app.post('/api/classes/:id/invitations',async(req,res)=>{const c=await classroom(db,req.user,req.params.id,{active:true});assert(!c.archived,409,'This class is archived.');await invite(req,res,{classId:c.id});});
  app.post('/api/workspaces/:id/invitations',async(req,res)=>{
    const org=await organization(db,req.user,req.params.id,{billing:true,active:true});
    const count=(await db.query('SELECT count(*)::int AS n FROM organization_members WHERE organization_id=$1',[org.id])).rows[0].n;assert(count<org.seat_limit,409,'This workspace has no available teacher seats.');await invite(req,res,{organizationId:org.id});
  });
  app.post('/api/invitations/:id/resend',async(req,res)=>{
    const invitation=(await db.query('SELECT * FROM invitations WHERE id=$1',[id(req.params.id)])).rows[0];assert(invitation,404,'Invitation not found.');
    if(invitation.class_id)await classroom(db,req.user,invitation.class_id,{active:true});else await organization(db,req.user,invitation.organization_id,{billing:true,active:true});
    assert(!invitation.accepted_at,409,'This invitation was already accepted.');
    const secret=token();await db.query("UPDATE invitations SET token_hash=$2,expires_at=now()+interval '7 days' WHERE id=$1",[invitation.id,digest(secret)]);
    const link=config.appUrl+'/platform.html#/join?token='+secret;
    const sent=await mail.send({to:invitation.email,subject:'Your Science Labs invitation',html:`<p><a href="${escape(link)}">Accept your Science Labs invitation</a></p><p>Sign in with ${escape(invitation.email)}. Earlier invitation links no longer work.</p>`,key:`invitation/${invitation.id}/${digest(secret)}`});res.json({delivery:sent.status});
  });
  app.post('/api/invitations/accept',async(req,res)=>{
    await rateLimit(db,`accept/${req.user.id}`,30);
    const result=await transaction(db,async tx=>{
      const inv=(await tx.query('SELECT * FROM invitations WHERE token_hash=$1 FOR UPDATE',[digest(text(req.body.token,'Invitation token',150))])).rows[0];
      assert(inv&&!inv.accepted_at&&Date.parse(inv.expires_at)>Date.now(),410,'This invitation has expired or was already used.');assert(inv.email===req.user.email.toLowerCase(),403,'Sign in with the email address on this invitation.');
      if(inv.class_id){const c=(await tx.query('SELECT * FROM classes WHERE id=$1',[inv.class_id])).rows[0];assert(!c.archived,409,'This class is archived.');await tx.query('INSERT INTO enrollments(class_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[inv.class_id,req.user.id]);}
      else{const org=effectiveOrganization((await tx.query('SELECT * FROM organizations WHERE id=$1 FOR UPDATE',[inv.organization_id])).rows[0]);assert(entitled(org),402,'The workspace license is inactive.');const count=(await tx.query('SELECT count(*)::int AS n FROM organization_members WHERE organization_id=$1',[org.id])).rows[0].n;const existing=(await tx.query('SELECT 1 FROM organization_members WHERE organization_id=$1 AND user_id=$2',[org.id,req.user.id])).rows.length;assert(existing||count<org.seat_limit,409,'This workspace has no available teacher seats.');await tx.query("INSERT INTO organization_members(organization_id,user_id,role) VALUES($1,$2,'teacher') ON CONFLICT DO NOTHING",[org.id,req.user.id]);}
      await tx.query('UPDATE invitations SET accepted_at=now() WHERE id=$1',[inv.id]);return {classId:inv.class_id,organizationId:inv.organization_id};
    });res.json(result);
  });
  app.get('/api/workspaces/:id/members',async(req,res)=>{await organization(db,req.user,req.params.id);res.json((await db.query('SELECT u.id,u.name,u.email,m.role FROM organization_members m JOIN "user" u ON u.id=m.user_id WHERE m.organization_id=$1',[req.params.id])).rows);});
  app.delete('/api/workspaces/:id/members/:userId',async(req,res)=>{await organization(db,req.user,req.params.id,{billing:true});await db.query("DELETE FROM organization_members WHERE organization_id=$1 AND user_id=$2 AND role='teacher'",[req.params.id,req.params.userId]);res.json({removed:true});});
  app.post('/api/classes/:id/assignments',async(req,res)=>{
    const c=await classroom(db,req.user,req.params.id,{active:true});assert(!c.archived,409,'This class is archived.');
    const revision=req.body.teacherRevisionId?await ownedRevision(db,req.user,req.body.teacherRevisionId):null;
    const lab=await publishedLab(db,text(revision?.base_lab_id||req.body.labId,'Lab ID',100));
    const state=req.body.publicationState||'published';assert(['draft','published'].includes(state),400,'Choose draft or published.');
    const row=(await db.query(`INSERT INTO assignments(class_id,lab_id,release_id,title,instructions,due_at,created_by,teacher_lab_revision_id,teacher_lab_snapshot,publication_state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[c.id,lab.id,revision?.base_release_id||lab.release_id,text(req.body.title||revision?.content.title||lab.title,'Assignment title',180),text(req.body.instructions||'','Instructions',10000,{optional:true}),date(req.body.dueAt||null),req.user.id,revision?.id||null,revision?JSON.stringify(revisionSnapshot(revision)):null,state])).rows[0];res.status(201).json(row);
  });
  app.patch('/api/assignments/:id',async(req,res)=>{
    const assignment=(await db.query('SELECT * FROM assignments WHERE id=$1',[id(req.params.id)])).rows[0];assert(assignment,404,'Assignment not found.');
    const destination=await classroom(db,req.user,assignment.class_id,{active:'publicationState'in req.body});if('publicationState'in req.body)assert(!destination.archived,409,'This class is archived.');
    if('publicationState'in req.body){
      assert(req.body.publicationState==='published',400,'A published assignment cannot be returned to a private draft. Close it instead.');
      assert(assignment.publication_state==='draft',409,'This assignment is already published.');
      await publishedLab(db,assignment.lab_id);
      const release=(await db.query('SELECT disabled_at FROM releases WHERE id=$1',[assignment.release_id])).rows[0];assert(release&&!release.disabled_at,410,'The assigned release is unavailable.');
      res.json((await db.query("UPDATE assignments SET publication_state='published' WHERE id=$1 RETURNING *",[assignment.id])).rows[0]);
    }else res.json((await db.query('UPDATE assignments SET closed=$2 WHERE id=$1 RETURNING *',[assignment.id,bool(req.body.closed,'Closed')])).rows[0]);
  });
  app.get('/api/student/assignments',async(req,res)=>res.json((await db.query(`SELECT a.*,c.name AS class_name,c.period,t.revision,t.updated_at,t.status,
    (SELECT count(*)::int FROM submissions s WHERE s.attempt_id=t.id) AS submission_count
    FROM assignments a JOIN classes c ON c.id=a.class_id JOIN enrollments e ON e.class_id=c.id
    LEFT JOIN attempts t ON t.assignment_id=a.id AND t.user_id=e.user_id WHERE e.user_id=$1 AND a.publication_state='published' ORDER BY a.created_at DESC`,[req.user.id])).rows));
  app.get('/api/assignments/:id/attempt',async(req,res)=>{
    const assignment=await studentAssignment(db,req.user,req.params.id);
    const attempt=(await db.query('SELECT * FROM attempts WHERE assignment_id=$1 AND user_id=$2',[assignment.id,req.user.id])).rows[0]||null;
    const submissions=attempt?(await db.query('SELECT s.id,s.revision,s.submitted_at,s.late,r.feedback,r.score,r.max_score,r.return_for_revision FROM submissions s LEFT JOIN reviews r ON r.submission_id=s.id WHERE s.attempt_id=$1 ORDER BY s.submitted_at DESC',[attempt.id])).rows:[];
    res.json({assignment,attempt,submissions});
  });
  app.put('/api/assignments/:id/attempt',async(req,res)=>{
    const a=await studentAssignment(db,req.user,req.params.id,{write:true});
    const storage=storageSnapshot(req.body.storage);const report=req.body.report?reportSnapshot(req.body.report,a.lab_id):null;validateTeacherReport(a,report);
    const revision=integer(req.body.expectedRevision,'Saved revision',0,2147483646);
    const result=await transaction(db,async tx=>{
      // Assignment lock also serializes first saves before an attempt row exists.
      await tx.query('SELECT id FROM assignments WHERE id=$1 FOR UPDATE',[a.id]);
      const previous=(await tx.query('SELECT * FROM attempts WHERE assignment_id=$1 AND user_id=$2 FOR UPDATE',[a.id,req.user.id])).rows[0];
      assert((previous?.revision||0)===revision,409,'Newer cloud work exists. Keep this tab open and export your work before choosing which copy to continue.');
      return (await tx.query(`INSERT INTO attempts(assignment_id,user_id,storage,report) VALUES($1,$2,$3,$4)
        ON CONFLICT(assignment_id,user_id) DO UPDATE SET storage=EXCLUDED.storage,report=EXCLUDED.report,revision=attempts.revision+1,status='draft',updated_at=now() RETURNING id,revision,updated_at,status`,[a.id,req.user.id,JSON.stringify(storage),report?JSON.stringify(report):null])).rows[0];
    });res.json(result);
  });
  app.post('/api/assignments/:id/submit',async(req,res)=>{
    const a=await studentAssignment(db,req.user,req.params.id,{write:true});
    const revision=integer(req.body.revision,'Saved revision',1,2147483646);
    const submitted=await transaction(db,async tx=>{
      const attempt=(await tx.query('SELECT * FROM attempts WHERE assignment_id=$1 AND user_id=$2 FOR UPDATE',[a.id,req.user.id])).rows[0];
      assert(attempt&&attempt.revision===revision,409,'Save the current work before submitting.');assert(attempt.report?.status==='Complete',409,'Finish and save the completed explanation in the lab before submitting.');validateTeacherReport(a,attempt.report);
      const existing=(await tx.query('SELECT * FROM submissions WHERE attempt_id=$1 AND revision=$2',[attempt.id,revision])).rows[0];if(existing)return existing;
      const row=(await tx.query('INSERT INTO submissions(attempt_id,revision,report,storage,late) VALUES($1,$2,$3,$4,$5) RETURNING *',[attempt.id,revision,JSON.stringify(attempt.report),JSON.stringify(attempt.storage),Boolean(a.due_at&&Date.parse(a.due_at)<Date.now())])).rows[0];
      await tx.query("UPDATE attempts SET status='submitted' WHERE id=$1",[attempt.id]);return row;
    });res.status(201).json({id:submitted.id,revision:submitted.revision,submittedAt:submitted.submitted_at,late:submitted.late});
  });
  app.get('/api/assignments/:id/submissions',async(req,res)=>{
    const a=(await db.query('SELECT * FROM assignments WHERE id=$1',[id(req.params.id)])).rows[0];assert(a,404,'Assignment not found.');await classroom(db,req.user,a.class_id);
    const rows=(await db.query(`SELECT s.id,s.revision,s.submitted_at,s.late,u.name,u.email,r.feedback,r.score,r.max_score,r.return_for_revision
      FROM submissions s JOIN attempts t ON t.id=s.attempt_id JOIN "user" u ON u.id=t.user_id LEFT JOIN reviews r ON r.submission_id=s.id WHERE t.assignment_id=$1 ORDER BY s.submitted_at DESC`,[a.id])).rows;const students=(await db.query(`SELECT u.id,u.name,u.email,t.status,t.updated_at,(SELECT count(*)::int FROM submissions s WHERE s.attempt_id=t.id) AS submission_count FROM enrollments e JOIN "user" u ON u.id=e.user_id LEFT JOIN attempts t ON t.user_id=u.id AND t.assignment_id=$1 WHERE e.class_id=$2 ORDER BY u.name`,[a.id,a.class_id])).rows;res.json({assignment:a,submissions:rows,students});
  });
  async function accessibleSubmission(req){
    const row=(await db.query(`SELECT s.*,t.user_id,t.assignment_id,a.class_id,a.lab_id,a.release_id,u.name,u.email FROM submissions s JOIN attempts t ON t.id=s.attempt_id JOIN assignments a ON a.id=t.assignment_id JOIN "user" u ON u.id=t.user_id WHERE s.id=$1`,[id(req.params.id)])).rows[0];assert(row,404,'Submission not found.');
    if(row.user_id!==req.user.id)await classroom(db,req.user,row.class_id,{active:false});return row;
  }
  app.get('/api/submissions/:id',async(req,res)=>{const row=await accessibleSubmission(req);res.json({...row,review:(await db.query('SELECT * FROM reviews WHERE submission_id=$1',[row.id])).rows[0]||null});});
  app.post('/api/submissions/:id/review',async(req,res)=>{
    const row=await accessibleSubmission(req);await classroom(db,req.user,row.class_id);
    const feedback=text(req.body.feedback,'Feedback',20000),returned=bool(req.body.returnForRevision||false,'Return for revision');
    const score=req.body.score===null||req.body.score===''||req.body.score===undefined?null:Number(req.body.score),maxScore=req.body.maxScore===null||req.body.maxScore===''||req.body.maxScore===undefined?null:Number(req.body.maxScore);
    assert((score===null&&maxScore===null)||(Number.isFinite(score)&&Number.isFinite(maxScore)&&score>=0&&maxScore>0&&score<=maxScore),400,'Enter a valid score and maximum, or leave both blank.');
    await transaction(db,async tx=>{
      await tx.query(`INSERT INTO reviews(submission_id,reviewer_id,feedback,score,max_score,return_for_revision) VALUES($1,$2,$3,$4,$5,$6)
        ON CONFLICT(submission_id) DO UPDATE SET reviewer_id=EXCLUDED.reviewer_id,feedback=EXCLUDED.feedback,score=EXCLUDED.score,max_score=EXCLUDED.max_score,return_for_revision=EXCLUDED.return_for_revision,updated_at=now()`,[row.id,req.user.id,feedback,score,maxScore,returned]);
      if(returned)await tx.query("UPDATE attempts SET status='returned' WHERE id=$1 AND revision=$2",[row.attempt_id,row.revision]);
    });res.json({saved:true});
  });
  app.post('/api/billing/checkout',async(req,res)=>{await rateLimit(db,`checkout/${req.user.id}`,20);res.json(await billing.checkout(req.user,req.body));});
  app.post('/api/billing/portal',async(req,res)=>res.json(await billing.portal(req.user,req.body)));
  app.use('/api/owner',async(req,_res,next)=>{await owner(db,req.user);next();});
  app.get('/api/owner/catalog',async(_req,res)=>res.json({courses:(await db.query('SELECT * FROM courses ORDER BY title')).rows,units:(await db.query('SELECT * FROM units ORDER BY position')).rows,labs:(await db.query('SELECT * FROM labs ORDER BY position,title')).rows,releases:(await db.query('SELECT id,commit_sha,created_at,disabled_at,disabled_reason,manifest FROM releases ORDER BY created_at DESC')).rows}));
  app.patch('/api/owner/content/:kind/:id',async(req,res)=>res.json(await publish(db,req.user,req.params.kind,req.params.id,req.body)));
  app.get('/api/owner/history',async(_req,res)=>res.json((await db.query('SELECT h.*,u.name AS actor_name FROM publication_history h JOIN "user" u ON u.id=h.actor_id ORDER BY h.created_at DESC LIMIT 100')).rows));
  app.post('/api/owner/history/:id/restore',async(req,res)=>{
    const previous=(await db.query('SELECT * FROM publication_history WHERE id=$1',[id(req.params.id)])).rows[0];assert(previous&&['course','unit','lab'].includes(previous.kind),400,'This event cannot be restored here.');
    const before=previous.before_value;const changes=previous.kind==='lab'?{published:before.published,release_id:before.release_id,access:before.access}:{published:before.published};res.json(await publish(db,req.user,previous.kind,previous.entity_id,changes));
  });
  app.get('/api/owner/workspaces',async(_req,res)=>res.json((await db.query('SELECT o.*,u.email AS owner_email,(SELECT count(*)::int FROM organization_members m WHERE m.organization_id=o.id) AS teacher_count FROM organizations o JOIN "user" u ON u.id=o.created_by ORDER BY o.created_at DESC')).rows));
  app.patch('/api/owner/workspaces/:id/license',async(req,res)=>{
    const limit=integer(req.body.seatLimit,'Teacher seats',1,10000),end=date(req.body.endsAt),plan=req.body.plan;assert(['teacher','school'].includes(plan),400,'Choose teacher or school.');assert(plan!=='teacher'||limit===1,400,'A teacher license has one teacher seat.');
    const row=await transaction(db,async tx=>{const before=(await tx.query('SELECT * FROM organizations WHERE id=$1 FOR UPDATE',[id(req.params.id)])).rows[0];assert(before,404,'Workspace not found.');const after=(await tx.query('UPDATE organizations SET license_ends_at=$2,license_plan=$3,license_seat_limit=$4 WHERE id=$1 RETURNING *',[before.id,end,plan,limit])).rows[0];await audit(tx,req.user,'license',before.id,before,after);return after;});res.json(row);
  });
  app.post('/api/owner/releases/:releaseId/availability',async(req,res)=>{
    const disabled=bool(req.body.disabled,'Disabled'),reason=disabled?text(req.body.reason,'Reason',500):null;
    const row=await transaction(db,async tx=>{const before=(await tx.query('SELECT * FROM releases WHERE id=$1 FOR UPDATE',[req.params.releaseId])).rows[0];assert(before,404,'Release not found.');const after=(await tx.query('UPDATE releases SET disabled_at=$2,disabled_reason=$3 WHERE id=$1 RETURNING *',[before.id,disabled?new Date().toISOString():null,reason])).rows[0];await audit(tx,req.user,'release',before.id,{disabled_at:before.disabled_at},{disabled_at:after.disabled_at,reason});return after;});res.json({id:row.id,disabledAt:row.disabled_at});
  });
  installRuntime(app,db,config);
  app.use((req,_res,next)=>next(new HttpError(404,'Page not found.')));
  app.use((error,_req,res,_next)=>{
    const status=error.status||(['23505','22P02','23514','23503'].includes(error.code)?400:500);
    if(status===500)console.error('Platform request failed:',error.message);
    res.status(status).json({error:status===500?'The request could not be completed. Your local work has not been removed.':error.status?error.message:'This record already exists or contains invalid values.'});
  });
  return {app,auth,mail,billing};
}
