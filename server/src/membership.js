import {assert,entitled} from './support.js';
export async function membership(db,user,{organizations,owner}={}){
  organizations??=(await db.query('SELECT o.* FROM organizations o JOIN organization_members m ON m.organization_id=o.id WHERE m.user_id=$1',[user.id])).rows;
  owner??=Boolean((await db.query('SELECT 1 FROM platform_owners WHERE user_id=$1',[user.id])).rows.length);
  const active=organizations.filter(org=>entitled(org));
  const paid=active.some(org=>entitled({...org,trial_ends_at:null}));
  return {tier:owner?'owner':paid?'paid':active.length?'trial':'free',teaching:owner||active.length>0,cloudPractice:owner||active.length>0};
}
export async function requireMembership(db,user){
  const access=await membership(db,user);
  assert(access.teaching,402,'An active trial, paid membership, or school license is required for this feature.');return access;
}
export async function accountFeatures(db,user,{organizations,owner,trialDays=14}={}){
  const access=await membership(db,user,{organizations,owner});
  const row=(await db.query(`SELECT EXISTS(SELECT 1 FROM enrollments WHERE user_id=$1) AS enrolled,
    EXISTS(SELECT 1 FROM organizations WHERE created_by=$1) AS owns_workspace,
    EXISTS(SELECT 1 FROM practice_attempts WHERE user_id=$1) AS has_practice`,[user.id])).rows[0];
  return {...access,studentAssignments:row.enrolled,canCreateWorkspace:!row.owns_workspace,trialDays,hasPracticeWork:row.has_practice};
}
