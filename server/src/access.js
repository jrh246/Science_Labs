import {assert,entitled,id,effectiveOrganization} from './support.js';
export async function isOwner(db,user){return Boolean(user&&(await db.query('SELECT 1 FROM platform_owners WHERE user_id=$1',[user.id])).rows.length);}
export async function owner(db,user){assert(await isOwner(db,user),403,'Owner access is required.');}
export async function organization(db,user,organizationId,{billing=false,active=false}={}){
  id(organizationId);
  const row=(await db.query(`SELECT o.*,m.role FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE o.id=$1 AND m.user_id=$2`,[organizationId,user.id])).rows[0];
  assert(row,404,'Workspace not found.');assert(!billing||row.role==='owner',403,'Only the workspace owner can manage billing and teachers.');
  assert(!active||entitled(row),402,'This workspace needs an active trial, subscription, or school license to create new work. Existing student work remains available.');return effectiveOrganization(row);
}
export async function classroom(db,user,classId,options={}){
  const row=(await db.query('SELECT * FROM classes WHERE id=$1',[id(classId)])).rows[0];assert(row,404,'Class not found.');
  const org=await organization(db,user,row.organization_id,{active:true,...options});return {...row,workspace:org};
}
export async function studentAssignment(db,user,assignmentId,{write=false}={}){
  const row=(await db.query(`SELECT a.*,c.name AS class_name,c.period,c.archived,r.disabled_at
    FROM assignments a JOIN classes c ON c.id=a.class_id JOIN enrollments e ON e.class_id=c.id
    JOIN releases r ON r.id=a.release_id WHERE a.id=$1 AND e.user_id=$2 AND a.publication_state='published'`,[id(assignmentId),user.id])).rows[0];
  assert(row,404,'Assignment not found.');assert(!row.disabled_at,410,'This lab version has been disabled. Contact your teacher.');
  assert(!write||(!row.closed&&!row.archived),409,'This assignment is closed. Your saved work is still available.');return row;
}
export async function publishedLab(db,labId){
  const row=(await db.query(`SELECT l.*,u.course_id,r.manifest,r.disabled_at FROM labs l JOIN units u ON u.id=l.unit_id
    JOIN courses c ON c.id=u.course_id JOIN releases r ON r.id=l.release_id
    WHERE l.id=$1 AND l.published AND u.published AND c.published AND r.disabled_at IS NULL`,[labId])).rows[0];
  assert(row,404,'This lab is not currently published.');return row;
}
