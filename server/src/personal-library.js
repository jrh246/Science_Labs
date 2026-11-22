import {requireMembership} from './membership.js';
import {assert,text,integer,storageSnapshot,reportSnapshot} from './support.js';
import {publishedLab} from './access.js';
import {publicLab} from './public-runtime.js';
import {transaction} from './database.js';
const available="(l.published AND u.published AND c.published AND r.id IS NOT NULL AND r.disabled_at IS NULL)";
function releaseId(value){assert(typeof value==='string'&&/^[a-f0-9]{24}$/.test(value),400,'Invalid lab version.');return value;}
export function installPersonalLibrary(app,db){
  app.get('/api/favorites',async(req,res)=>{
    const rows=(await db.query(`SELECT l.id,l.title,l.summary,l.unit_id,l.access,l.release_id,l.metadata,u.title AS unit_title,${available} AS available,f.created_at FROM lab_favorites f JOIN labs l ON l.id=f.lab_id JOIN units u ON u.id=l.unit_id JOIN courses c ON c.id=u.course_id LEFT JOIN releases r ON r.id=l.release_id WHERE f.user_id=$1 ORDER BY f.created_at DESC`,[req.user.id])).rows;
    // Retain the bookmark without revealing unpublished replacement metadata.
    res.json(rows.map(row=>row.available?row:{id:row.id,title:'Unavailable lab',summary:'This lab is not currently published.',available:false,created_at:row.created_at}));
  });
  app.put('/api/favorites/:labId',async(req,res)=>{
    const lab=await publishedLab(db,text(req.params.labId,'Lab',100));
    await db.query('INSERT INTO lab_favorites(user_id,lab_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[req.user.id,lab.id]);res.json({labId:lab.id,favorite:true});
  });
  app.delete('/api/favorites/:labId',async(req,res)=>{const labId=text(req.params.labId,'Lab',100);await db.query('DELETE FROM lab_favorites WHERE user_id=$1 AND lab_id=$2',[req.user.id,labId]);res.json({labId,favorite:false});});
  app.get('/api/account/practice-export',async(req,res)=>res.json({format:'science-labs-practice-archive',version:1,attempts:(await db.query('SELECT lab_id,release_id,storage,report,revision,updated_at FROM practice_attempts WHERE user_id=$1 ORDER BY updated_at DESC',[req.user.id])).rows}));
  app.use('/api/practice',async(req,_res,next)=>{await requireMembership(db,req.user);next();});
  app.get('/api/practice',async(req,res)=>res.json((await db.query(`SELECT p.id,p.lab_id,p.release_id,p.revision,p.updated_at,p.report->>'title' AS report_title,p.report->>'status' AS status,l.title,l.access,(${available} AND l.access='free' AND l.release_id=p.release_id) AS can_resume FROM practice_attempts p JOIN labs l ON l.id=p.lab_id JOIN units u ON u.id=l.unit_id JOIN courses c ON c.id=u.course_id JOIN releases r ON r.id=p.release_id WHERE p.user_id=$1 ORDER BY p.updated_at DESC`,[req.user.id])).rows));
  app.get('/api/practice/:labId/:releaseId',async(req,res)=>{
    const labId=text(req.params.labId,'Lab',100),version=releaseId(req.params.releaseId);
    const attempt=(await db.query('SELECT * FROM practice_attempts WHERE user_id=$1 AND lab_id=$2 AND release_id=$3',[req.user.id,labId,version])).rows[0]||null;
    if(!attempt){const lab=await publicLab(db,labId);assert(lab.release_id===version,404,'Saved work not found.');}
    res.json({attempt});
  });
  app.put('/api/practice/:labId/:releaseId',async(req,res)=>{
    const lab=await publicLab(db,req.params.labId),version=releaseId(req.params.releaseId);assert(lab.release_id===version,409,'The public lab has changed. Download this work before opening the new version.');
    const storage=storageSnapshot(req.body.storage),report=req.body.report?reportSnapshot(req.body.report,lab.id):null;
    const expected=integer(req.body.expectedRevision,'Saved revision',0,2147483646);
    const attempt=await transaction(db,async tx=>{
      await tx.query('SELECT id FROM "user" WHERE id=$1 FOR UPDATE',[req.user.id]);
      const current=(await tx.query('SELECT * FROM practice_attempts WHERE user_id=$1 AND lab_id=$2 AND release_id=$3 FOR UPDATE',[req.user.id,lab.id,version])).rows[0];
      assert((current?.revision||0)===expected,409,'Newer account work exists. Download your device copy before loading the account copy.');
      return (await tx.query(`INSERT INTO practice_attempts(user_id,lab_id,release_id,storage,report) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id,lab_id,release_id) DO UPDATE SET storage=EXCLUDED.storage,report=EXCLUDED.report,revision=practice_attempts.revision+1,updated_at=now() RETURNING id,revision,updated_at`,[req.user.id,lab.id,version,JSON.stringify(storage),report?JSON.stringify(report):null])).rows[0];
    });res.json(attempt);
  });
}
