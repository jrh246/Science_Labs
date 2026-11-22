import {membership,requireMembership} from './membership.js';
import {assert,digest,text,entitled} from './support.js';
import {owner,publishedLab,studentAssignment,classroom} from './access.js';
import {ownedLab,ownedRevision,revisionSnapshot,teacherAccess} from './authoring.js';

import {releaseReader,releaseContentType,runtimeHtml} from './release-files.js';

export function installRuntime(app,db,config){
  const read=releaseReader(config);
  app.post('/api/launch',async(req,res)=>{
    let labId,releaseId,assignmentId=null,teacherLabSnapshot=null,practice=false;
    if(req.body.assignmentId){const a=await studentAssignment(db,req.user,req.body.assignmentId);labId=a.lab_id;releaseId=a.release_id;assignmentId=a.id;teacherLabSnapshot=a.teacher_lab_snapshot;}
    else if(req.body.teacherAssignmentId){
      const a=(await db.query('SELECT * FROM assignments WHERE id=$1',[req.body.teacherAssignmentId])).rows[0];assert(a,404,'Assignment not found.');await classroom(db,req.user,a.class_id);
      labId=a.lab_id;releaseId=a.release_id;teacherLabSnapshot=a.teacher_lab_snapshot;
      const release=(await db.query('SELECT disabled_at FROM releases WHERE id=$1',[releaseId])).rows[0];assert(release&&!release.disabled_at,410,'This assigned version is unavailable.');
    }else if(req.body.teacherLabId){
      await teacherAccess(db,req.user);const lab=await ownedLab(db,req.user,req.body.teacherLabId);labId=lab.base_lab_id;releaseId=lab.base_release_id;
      const r=(await db.query('SELECT disabled_at FROM releases WHERE id=$1',[releaseId])).rows[0];assert(r&&!r.disabled_at,410,'The original lab release is unavailable.');
      teacherLabSnapshot={teacherLabId:lab.id,revisionId:null,revision:lab.draft_version,contentHash:digest(JSON.stringify(lab.draft)),content:lab.draft,preview:true};
      await db.query('UPDATE teacher_labs SET previewed_version=$2 WHERE id=$1 AND draft_version=$2',[lab.id,lab.draft_version]);
    }else if(req.body.teacherRevisionId){
      await teacherAccess(db,req.user);const r=await ownedRevision(db,req.user,req.body.teacherRevisionId);labId=r.base_lab_id;releaseId=r.base_release_id;teacherLabSnapshot=revisionSnapshot(r);
    }
    else if(req.body.preview){
      await owner(db,req.user);labId=text(req.body.labId,'Lab',100);releaseId=text(req.body.releaseId,'Release',24);
      const r=(await db.query('SELECT manifest,disabled_at FROM releases WHERE id=$1',[releaseId])).rows[0];assert(r&&!r.disabled_at&&r.manifest.labs.some(lab=>lab.id===labId),404,'Preview version not found.');
    }else{
      const lab=await publishedLab(db,text(req.body.labId,'Lab',100));labId=lab.id;releaseId=lab.release_id;
      const access=await membership(db,req.user);
      if(lab.access==='free'&&!access.cloudPractice){
        assert(['public-lab-runtime-v1','membership-features-v1'].every(flag=>lab.manifest.capabilities?.includes(flag)),409,'Select the current membership-aware public runtime for this lab.');
        const meta=lab.manifest.labs.find(item=>item.id===lab.id);assert(meta,404,'Lab version not found.');
        const url=new URL(`${config.apiUrl}/api/public/labs/${lab.id}/runtime/${lab.release_id}/${meta.entry}`);if(meta.entry==='investigation.html')url.searchParams.set('lab',lab.id);
        res.json({url:url.href,labId:lab.id,releaseId:lab.release_id,public:true});return;
      }
      practice=access.cloudPractice&&lab.access==='free'&&lab.manifest.capabilities?.includes('public-lab-runtime-v1')===true;
      if(lab.access==='subscription'){
        const memberships=(await db.query('SELECT o.* FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE m.user_id=$1',[req.user.id])).rows;
        assert(access.teaching||memberships.some(org=>entitled(org)),402,'An active teacher trial, subscription, or school license is required. Students can open their assigned labs from My assignments.');
      }
    }
    const release=(await db.query('SELECT manifest FROM releases WHERE id=$1',[releaseId])).rows[0];
    const metadata=release.manifest.labs.find(lab=>lab.id===labId);assert(metadata,404,'Lab version not found.');
    const grant=(await db.query("INSERT INTO runtime_grants(user_id,release_id,lab_id,assignment_id,teacher_lab_snapshot,practice,expires_at) VALUES($1,$2,$3,$4,$5,$6,now()+interval '12 hours') RETURNING id",[req.user.id,releaseId,labId,assignmentId,teacherLabSnapshot?JSON.stringify(teacherLabSnapshot):null,practice])).rows[0];
    const url=new URL(`${config.apiUrl}/api/runtime/${releaseId}/${metadata.entry}`);url.searchParams.set('grant',grant.id);if(metadata.entry==='investigation.html')url.searchParams.set('lab',labId);
    res.json({url:url.href,releaseId,labId,teacherLabId:teacherLabSnapshot?.teacherLabId||null});
  });
  app.get('/api/runtime/:releaseId/{*file}',async(req,res)=>{
    const releaseId=text(req.params.releaseId,'Release',24);assert(/^[a-f0-9]{24}$/.test(releaseId),404,'Release not found.');
    const file=Array.isArray(req.params.file)?req.params.file.join('/'):req.params.file;
    assert(file&&file.split('/').every(part=>part&&part!=='.'&&part!=='..'&&/^[\w.-]+$/.test(part)),404,'File not found.');
    const r=(await db.query('SELECT * FROM releases WHERE id=$1',[releaseId])).rows[0];assert(r&&!r.disabled_at,410,'This lab version is unavailable.');
    const html=file.endsWith('.html')&&!file.startsWith('resources/');
    let grant;
    if(html){
      grant=(await db.query('SELECT * FROM runtime_grants WHERE id=$1 AND user_id=$2 AND release_id=$3 AND expires_at>now()',[req.query.grant||'00000000-0000-0000-0000-000000000000',req.user.id,releaseId])).rows[0];
      assert(grant,403,'Open this lab from the Science Labs catalog or your assignment.');
      const meta=r.manifest.labs.find(lab=>lab.id===grant.lab_id);
      assert(meta&&file===meta.entry&&(file!=='investigation.html'||req.query.lab===grant.lab_id),403,'This launch is for a different lab.');
      if(grant.assignment_id)await studentAssignment(db,req.user,grant.assignment_id);else await requireMembership(db,req.user);
    }else{
      assert((await db.query('SELECT 1 FROM runtime_grants WHERE user_id=$1 AND release_id=$2 AND expires_at>now() LIMIT 1',[req.user.id,releaseId])).rows.length,403,'Open an authorized lab first.');
    }
    let bytes=await read(r,file);res.type(releaseContentType(file));
    if(html){
      const attempt=grant.assignment_id?(await db.query('SELECT storage,revision,report FROM attempts WHERE assignment_id=$1 AND user_id=$2',[grant.assignment_id,req.user.id])).rows[0]:grant.practice?(await db.query('SELECT storage,revision,report FROM practice_attempts WHERE user_id=$1 AND lab_id=$2 AND release_id=$3',[req.user.id,grant.lab_id,releaseId])).rows[0]:null;
      const assignment=grant.assignment_id?await studentAssignment(db,req.user,grant.assignment_id):null;
      const context={practice:grant.practice,runtimeBase:`/api/runtime/${releaseId}/`,userId:req.user.id,scopeId:grant.assignment_id||(grant.teacher_lab_snapshot?`teacher-${grant.teacher_lab_snapshot.teacherLabId}-${grant.teacher_lab_snapshot.contentHash}`:`practice-${grant.lab_id}-${releaseId}`),assignmentId:grant.assignment_id,labId:grant.lab_id,releaseId,
        readonly:Boolean(assignment?.closed||assignment?.archived),appUrl:config.appUrl,cloudRevision:attempt?.revision||0,reportStored:Boolean(attempt?.report),storage:attempt?.storage||{},teacherLab:assignment?.teacher_lab_snapshot||grant.teacher_lab_snapshot||null};
      bytes=runtimeHtml(res,bytes,context,config);
    }
    res.send(bytes);
  });
}
