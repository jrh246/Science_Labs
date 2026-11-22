import {assert,text,email,id,integer,bool} from './support.js';
import {transaction} from './database.js';
import {isOwner} from './access.js';
export async function staffAccess(db,user){
  if(!user)return {active:false,owner:false,permissions:[],roles:[]};
  if(await isOwner(db,user))return {active:true,owner:true,permissions:(await db.query('SELECT key FROM staff_permissions ORDER BY key')).rows.map(row=>row.key),roles:[]};
  const member=(await db.query('SELECT active FROM staff_members WHERE user_id=$1',[user.id])).rows[0];
  if(!member?.active)return {active:false,owner:false,permissions:[],roles:[]};
  const roles=(await db.query('SELECT r.id,r.name FROM staff_roles r JOIN staff_member_roles m ON m.role_id=r.id WHERE m.user_id=$1 AND NOT r.archived ORDER BY r.name',[user.id])).rows;
  const permissions=(await db.query('SELECT DISTINCT p.permission_key FROM staff_role_permissions p JOIN staff_roles r ON r.id=p.role_id JOIN staff_member_roles m ON m.role_id=r.id WHERE m.user_id=$1 AND NOT r.archived ORDER BY p.permission_key',[user.id])).rows.map(row=>row.permission_key);
  return {active:true,owner:false,permissions,roles};
}
export async function requireStaff(db,user,permission){
  const access=await staffAccess(db,user);assert(access.active,403,'Staff access has not been granted to this account.');
  if(permission)assert(access.permissions.includes(permission),403,'Your staff role does not allow this action.');return access;
}
async function change(db,user,action,target,work){
  return transaction(db,async tx=>{
    // Serialize access changes and recheck the actor after the lock, including
    // when another administrator revoked their access during this request.
    await tx.query('SELECT pg_advisory_xact_lock(884422)');
    const actor=await requireStaff(tx,user,'staff.manage'),result=await work(tx,actor);
    await tx.query('INSERT INTO staff_audit_log(actor_id,action,target_id,details) VALUES($1,$2,$3,$4)',[user.id,action,String(target||result.id||result.user_id),JSON.stringify(result.audit)]);
    const {audit,...value}=result;return value;
  });
}
function grantable(actor,permissions){assert(actor.owner||permissions.every(key=>actor.permissions.includes(key)),403,'You can grant or change only permissions you already hold.');}
async function rolePermissions(db,roleId){return (await db.query('SELECT permission_key FROM staff_role_permissions WHERE role_id=$1',[roleId])).rows.map(row=>row.permission_key);}
export function installStaffAccess(app,db){
  app.get('/api/staff/me',async(req,res)=>res.json(await requireStaff(db,req.user)));
  app.get('/api/staff/access',async(req,res)=>{
    await requireStaff(db,req.user,'staff.manage');
    const permissions=(await db.query('SELECT * FROM staff_permissions ORDER BY key')).rows;
    const roles=(await db.query(`SELECT r.*,COALESCE((SELECT jsonb_agg(permission_key ORDER BY permission_key) FROM staff_role_permissions p WHERE p.role_id=r.id),'[]'::jsonb) AS permissions FROM staff_roles r ORDER BY lower(r.name)`)).rows;
    const members=(await db.query(`SELECT m.*,u.name,u.email,COALESCE((SELECT jsonb_agg(role_id ORDER BY role_id) FROM staff_member_roles r WHERE r.user_id=m.user_id),'[]'::jsonb) AS roles FROM staff_members m JOIN "user" u ON u.id=m.user_id ORDER BY lower(u.name),u.email`)).rows;
    res.json({permissions,roles,members});
  });
  async function saveRole(req,res){
    const input=req.body,name=text(input.name,'Role name',80),description=text(input.description||'','Description',500,{optional:true});
    assert(Array.isArray(input.permissions)&&input.permissions.length<=40&&new Set(input.permissions).size===input.permissions.length,400,'Choose each permission once.');
    const permissionKeys=input.permissions.map(key=>text(key,'Permission',100));
    const archived=input.archived===undefined?false:bool(input.archived,'Archived');
    const roleId=req.params.id?id(req.params.id):null;
    const result=await change(db,req.user,roleId?'role.updated':'role.created',roleId,async(tx,actor)=>{
      const catalog=(await tx.query('SELECT key FROM staff_permissions')).rows.map(row=>row.key);assert(permissionKeys.every(key=>catalog.includes(key)),400,'Unknown staff permission.');grantable(actor,permissionKeys);
      let row;
      if(roleId){
        const before=(await tx.query('SELECT * FROM staff_roles WHERE id=$1 FOR UPDATE',[roleId])).rows[0];assert(before,404,'Staff role not found.');grantable(actor,await rolePermissions(tx,roleId));
        assert(before.revision===integer(input.expectedRevision,'Role revision',1,2147483646),409,'This role changed. Reload before editing it.');
        row=(await tx.query('UPDATE staff_roles SET name=$2,description=$3,archived=$4,revision=revision+1,updated_at=now() WHERE id=$1 RETURNING *',[roleId,name,description,archived])).rows[0];
      }else row=(await tx.query('INSERT INTO staff_roles(name,description,archived) VALUES($1,$2,$3) RETURNING *',[name,description,archived])).rows[0];
      await tx.query('DELETE FROM staff_role_permissions WHERE role_id=$1',[row.id]);
      for(const key of permissionKeys)await tx.query('INSERT INTO staff_role_permissions(role_id,permission_key) VALUES($1,$2)',[row.id,key]);
      return {...row,permissions:permissionKeys,audit:{name,permissions:permissionKeys,archived,revision:row.revision}};
    });res.status(roleId?200:201).json(result);
  }
  app.post('/api/staff/roles',saveRole);app.put('/api/staff/roles/:id',saveRole);
  app.put('/api/staff/members',async(req,res)=>{
    const address=email(req.body.email),active=bool(req.body.active,'Active');
    const revision=integer(req.body.expectedRevision,'Staff revision',0,2147483646);
    assert(Array.isArray(req.body.roles)&&req.body.roles.length<=20&&new Set(req.body.roles).size===req.body.roles.length,400,'Choose each role once.');const roleIds=req.body.roles.map(id);
    const result=await change(db,req.user,'member.updated',null,async(tx,actor)=>{
      const target=(await tx.query('SELECT id,"emailVerified" FROM "user" WHERE lower(email)=$1',[address])).rows[0];assert(target?.emailVerified,400,'Staff must first create an account and verify this email address.');
      assert(!await isOwner(tx,{id:target.id}),409,'Site-owner access is managed separately from staff roles.');
      assert(actor.owner||target.id!==req.user.id,403,'Ask another staff administrator to change your own account access.');
      const current=(await tx.query('SELECT * FROM staff_members WHERE user_id=$1 FOR UPDATE',[target.id])).rows[0];assert((current?.revision||0)===revision,409,'This staff account changed. Reload before editing it.');
      const previous=(await tx.query('SELECT DISTINCT p.permission_key FROM staff_role_permissions p JOIN staff_member_roles m ON m.role_id=p.role_id WHERE m.user_id=$1',[target.id])).rows.map(row=>row.permission_key);grantable(actor,previous);
      for(const roleId of roleIds){const role=(await tx.query('SELECT archived FROM staff_roles WHERE id=$1',[roleId])).rows[0];assert(role&&!role.archived,400,'Choose active staff roles.');grantable(actor,await rolePermissions(tx,roleId));}
      const member=(await tx.query('INSERT INTO staff_members(user_id,active,created_by) VALUES($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET active=EXCLUDED.active,revision=staff_members.revision+1,updated_at=now() RETURNING *',[target.id,active,req.user.id])).rows[0];
      await tx.query('DELETE FROM staff_member_roles WHERE user_id=$1',[target.id]);for(const roleId of roleIds)await tx.query('INSERT INTO staff_member_roles(user_id,role_id) VALUES($1,$2)',[target.id,roleId]);
      return {...member,roles:roleIds,audit:{active,roles:roleIds,revision:member.revision}};
    });res.json(result);
  });
  app.get('/api/staff/audit',async(req,res)=>{await requireStaff(db,req.user,'staff.audit.read');const limit=integer(Number(req.query.limit||50),'Entries',1,100);res.json((await db.query('SELECT a.*,u.name AS actor_name FROM staff_audit_log a LEFT JOIN "user" u ON u.id=a.actor_id ORDER BY a.created_at DESC,a.id DESC LIMIT $1',[limit])).rows);});
}
