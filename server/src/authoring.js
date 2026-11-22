import {requireMembership} from './membership.js';
import {transaction} from './database.js';
import {assert,text,id,integer,digest,rateLimit,entitled,bool} from './support.js';
import {publishedLab} from './access.js';

export function teacherContent(input){
  assert(input&&typeof input==='object'&&!Array.isArray(input),400,'Choose valid draft content.');
  assert(Object.keys(input).every(key=>['title','directions','learningGoals','questions'].includes(key)),400,'This editor supports titles, directions, learning goals, and additional questions.');
  const title=text(input.title,'Lab title',180),directions=text(input.directions||'','Student directions',12000,{optional:true});
  assert(Array.isArray(input.learningGoals)&&input.learningGoals.length<=4,400,'Use up to four learning goals.');
  const learningGoals=input.learningGoals.map(goal=>text(goal,'Learning goal',500));
  assert(Array.isArray(input.questions)&&input.questions.length<=8,400,'Use up to eight teacher questions.');
  const seen=new Set();
  const questions=input.questions.map(question=>{
    assert(question&&typeof question==='object',400,'Invalid teacher question.');
    const questionId=text(question.id,'Question ID',80);assert(/^[a-zA-Z0-9_-]+$/.test(questionId)&&!['__proto__','constructor','prototype'].includes(questionId)&&!seen.has(questionId),400,'Each question needs its own stable ID.');seen.add(questionId);
    return {id:questionId,prompt:text(question.prompt,'Question',2500),required:bool(question.required,'Required question')};
  });
  return {title,directions,learningGoals,questions};
}
export async function teacherAccess(db,user){return requireMembership(db,user);}
export async function ownedLab(db,user,labId,{lock=false}={}){
  const row=(await db.query('SELECT * FROM teacher_labs WHERE id=$1 AND owner_id=$2'+(lock?' FOR UPDATE':''),[id(labId),user.id])).rows[0];
  assert(row,404,'Teacher lab not found.');return row;
}
export async function ownedRevision(db,user,revisionId){
  const row=(await db.query('SELECT r.* FROM teacher_lab_revisions r JOIN teacher_labs l ON l.id=r.teacher_lab_id WHERE r.id=$1 AND l.owner_id=$2',[id(revisionId),user.id])).rows[0];
  assert(row,404,'Published teacher lab not found.');
  assert(!(await db.query('SELECT disabled_at FROM releases WHERE id=$1',[row.base_release_id])).rows[0]?.disabled_at,410,'The original lab release has been disabled.');
  return row;
}
export function revisionSnapshot(revision){return {teacherLabId:revision.teacher_lab_id,revisionId:revision.id,revision:revision.revision,contentHash:revision.content_hash,content:revision.content};}
export function validateTeacherReport(assignment,report){
  const expected=assignment.teacher_lab_snapshot;if(!expected||!report)return;
  const provided=report.teacherLab;
  assert(provided?.revisionId===expected.revisionId&&provided.contentHash===expected.contentHash&&report.title===expected.content.title,400,'The report must match the assigned teacher lab revision.');
  assert(Array.isArray(provided.responses)&&provided.responses.length===expected.content.questions.length,400,'Save the teacher questions with this report.');
  for(const [index,question] of expected.content.questions.entries()){
    const response=provided.responses[index];assert(response?.id===question.id&&response.prompt===question.prompt&&typeof response.response==='string'&&response.response.length<=20000,400,'The teacher questions must match the assigned version.');
    assert(report.status!=='Complete'||!question.required||response.response.trim(),400,'Answer the required teacher questions before submitting.');
  }
}
export function installAuthoring(app,db,config){
  app.get('/api/teacher/labs',async(req,res)=>{
    const labs=(await db.query('SELECT l.*,b.title AS base_title,r.content->>\'title\' AS published_title,r.revision AS published_revision FROM teacher_labs l JOIN labs b ON b.id=l.base_lab_id LEFT JOIN teacher_lab_revisions r ON r.id=l.published_revision_id WHERE owner_id=$1 ORDER BY l.updated_at DESC',[req.user.id])).rows;
    res.json(labs);
  });
  app.post('/api/teacher/labs',async(req,res)=>{
    await teacherAccess(db,req.user);await rateLimit(db,`teacher-copy/${req.user.id}`,50);
    const base=await publishedLab(db,text(req.body.labId,'Original lab',100));
    assert(base.manifest.capabilities?.includes('teacher-lab-overlays-v1'),409,'This original needs an updated runtime before it can be copied. Ask the site owner to select the new teacher-authoring release.');
    const draft=teacherContent({title:base.title+' — my copy',directions:'',learningGoals:[],questions:[]});
    const row=(await db.query('INSERT INTO teacher_labs(owner_id,base_lab_id,base_release_id,draft) VALUES($1,$2,$3,$4) RETURNING *',[req.user.id,base.id,base.release_id,JSON.stringify(draft)])).rows[0];
    res.status(201).json(row);
  });
  app.get('/api/teacher/labs/:id',async(req,res)=>{
    const lab=await ownedLab(db,req.user,req.params.id);
    const revisions=(await db.query('SELECT * FROM teacher_lab_revisions WHERE teacher_lab_id=$1 ORDER BY revision DESC',[lab.id])).rows;
    const base=(await db.query('SELECT title,summary FROM labs WHERE id=$1',[lab.base_lab_id])).rows[0];
    const suggestions=(await db.query('SELECT id,status,draft_version,error,created_at FROM teacher_ai_suggestions WHERE teacher_lab_id=$1 AND owner_id=$2 ORDER BY created_at DESC LIMIT 5',[lab.id,req.user.id])).rows;
    res.json({lab,revisions,base,suggestions});
  });
  app.put('/api/teacher/labs/:id',async(req,res)=>{
    await teacherAccess(db,req.user);const content=teacherContent(req.body.content),version=integer(req.body.expectedVersion,'Draft version',1,2147483646);
    const row=await transaction(db,async tx=>{
      const lab=await ownedLab(tx,req.user,req.params.id,{lock:true});
      assert(lab.draft_version===version,409,'This draft changed in another tab. Download your text before reloading the saved draft.');
      if(digest(JSON.stringify(teacherContent(lab.draft)))===digest(JSON.stringify(content)))return lab;
      return (await tx.query('UPDATE teacher_labs SET draft=$2,draft_version=draft_version+1,previewed_version=NULL,updated_at=now() WHERE id=$1 RETURNING *',[lab.id,JSON.stringify(content)])).rows[0];
    });res.json(row);
  });
  app.post('/api/teacher/labs/:id/publish',async(req,res)=>{
    await teacherAccess(db,req.user);const version=integer(req.body.expectedVersion,'Draft version',1,2147483646);
    const review=req.body.review;assert(review&&['science','language','interaction'].every(key=>review[key]===true),400,'Review scientific meaning, ninth-grade wording, and interaction/visuals before publishing.');
    const result=await transaction(db,async tx=>{
      const lab=await ownedLab(tx,req.user,req.params.id,{lock:true});assert(lab.draft_version===version,409,'The draft changed. Save and preview the current version.');
      assert(lab.previewed_version===version,409,'Preview the saved draft before publishing.');
      const content=teacherContent(lab.draft);assert(content.directions.length&&content.learningGoals.length>=2,400,'Add student directions and two to four learning goals before publishing.');
      const release=(await tx.query('SELECT disabled_at FROM releases WHERE id=$1',[lab.base_release_id])).rows[0];assert(release&&!release.disabled_at,410,'The original lab release is unavailable.');
      const contentHash=digest(JSON.stringify(content));
      const previous=(await tx.query('SELECT * FROM teacher_lab_revisions WHERE teacher_lab_id=$1 ORDER BY revision DESC LIMIT 1',[lab.id])).rows[0];
      if(previous?.content_hash===contentHash)return previous;
      const row=(await tx.query('INSERT INTO teacher_lab_revisions(teacher_lab_id,revision,content,content_hash,base_lab_id,base_release_id,published_by,review) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[lab.id,(previous?.revision||0)+1,JSON.stringify(content),contentHash,lab.base_lab_id,lab.base_release_id,req.user.id,JSON.stringify({science:true,language:true,interaction:true})])).rows[0];
      await tx.query('UPDATE teacher_labs SET published_revision_id=$2 WHERE id=$1',[lab.id,row.id]);return row;
    });res.status(201).json(result);
  });
}
