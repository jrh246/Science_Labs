import {isDeepStrictEqual} from 'node:util';
import {transaction} from './database.js';
import {assert,text,bool,audit} from './support.js';

export async function registerRelease(pool,manifest){
  assert(/^[a-f0-9]{24}$/.test(manifest.id)&&Array.isArray(manifest.labs)&&manifest.files,400,'Invalid release manifest.');
  for(const [path,file] of Object.entries(manifest.files))assert(!path.startsWith('/')&&!path.includes('..')&&/^[a-f0-9]{64}$/.test(file.sha256),400,'Invalid release file.');
  await transaction(pool,async db=>{
    const previous=(await db.query('SELECT manifest FROM releases WHERE id=$1',[manifest.id])).rows[0];
    if(previous){assert(isDeepStrictEqual(previous.manifest,manifest),409,'A release ID cannot be overwritten.');return;}
    await db.query('INSERT INTO releases(id,commit_sha,manifest) VALUES($1,$2,$3)',[manifest.id,manifest.commit,JSON.stringify(manifest)]);
    for(const course of manifest.courses)await db.query(`INSERT INTO courses(id,title,description) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING`,[course.id,course.title,course.description]);
    for(const unit of manifest.units)await db.query(`INSERT INTO units(id,course_id,title,description,position) VALUES($1,$2,$3,$4,$5) ON CONFLICT(id) DO NOTHING`,[unit.id,unit.courseId,unit.title,unit.description,unit.position]);
    for(const lab of manifest.labs)await db.query(`INSERT INTO labs(id,unit_id,title,summary,position,metadata) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(id) DO NOTHING`,[lab.id,lab.unitId,lab.title,lab.summary,lab.position,JSON.stringify(lab)]);
  });
}

export async function publish(pool,user,kind,entityId,changes){
  const definitions={course:{table:'courses',fields:['published']},unit:{table:'units',fields:['published']},lab:{table:'labs',fields:['published','release_id','access']}};
  const definition=definitions[kind];assert(definition,400,'Invalid content type.');
  assert(changes&&Object.keys(changes).length&&Object.keys(changes).every(key=>definition.fields.includes(key)),400,'Invalid publication changes.');
  return transaction(pool,async db=>{
    const before=(await db.query(`SELECT * FROM ${definition.table} WHERE id=$1 FOR UPDATE`,[entityId])).rows[0];assert(before,404,'Content not found.');
    const next={...before,...changes};
    if('published'in changes)bool(changes.published,'Published');
    if('access'in changes)assert(['free','subscription'].includes(changes.access),400,'Invalid access setting.');
    if(kind==='lab'&&next.release_id){
      const release=(await db.query('SELECT * FROM releases WHERE id=$1',[text(next.release_id,'Release',24)])).rows[0];
      assert(release&&!release.disabled_at,409,'Select an available release.');
      const metadata=release.manifest.labs.find(lab=>lab.id===entityId);assert(metadata,409,'This lab is absent from the selected release.');
      next.metadata=metadata;next.title=metadata.title;next.summary=metadata.summary;
    }
    assert(kind!=='lab'||!next.published||next.release_id,409,'Choose a released lab version before publishing.');
    const fields=kind==='lab'?['published','release_id','access','metadata','title','summary']:['published'];
    const values=fields.map(key=>key==='metadata'?JSON.stringify(next[key]):next[key]);
    const after=(await db.query(`UPDATE ${definition.table} SET ${fields.map((key,index)=>`${key}=$${index+2}`).join(',')} WHERE id=$1 RETURNING *`,[entityId,...values])).rows[0];
    await audit(db,user,kind,entityId,before,after);return after;
  });
}
