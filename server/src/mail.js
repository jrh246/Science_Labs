import {Resend} from 'resend';
import {escape,digest} from './support.js';
export function mailer(db,config,{transport}={}){
  const resend=!config.local&&!transport?new Resend(config.resendKey):null;
  async function deliver(row){
    if(row.status==='sent')return {id:row.id,status:'sent'};
    await db.query('UPDATE email_outbox SET attempts=attempts+1 WHERE id=$1',[row.id]);
    try{
      let providerId='local-outbox';
      if(transport)providerId=await transport(row);
      else if(resend){const {data,error}=await resend.emails.send({from:config.emailFrom,to:row.recipient,subject:row.subject,html:row.html},{idempotencyKey:row.dedupe_key});if(error)throw new Error(error.message);providerId=data.id;}
      await db.query("UPDATE email_outbox SET status='sent',provider_id=$2,sent_at=now(),last_error=NULL WHERE id=$1",[row.id,providerId]);
      return {id:row.id,status:'sent'};
    }catch(error){
      await db.query("UPDATE email_outbox SET status='failed',last_error=$2 WHERE id=$1",[row.id,String(error.message).slice(0,500)]);
      return {id:row.id,status:'failed'};
    }
  }
  return {
    async send({to,subject,html,key}){
      const result=await db.query(`INSERT INTO email_outbox(recipient,subject,html,dedupe_key) VALUES($1,$2,$3,$4)
        ON CONFLICT(dedupe_key) DO UPDATE SET dedupe_key=EXCLUDED.dedupe_key RETURNING *`,[to,subject,html,key]);
      return deliver(result.rows[0]);
    },
    async auth(to,url,kind){
      const subject=kind==='verify'?'Verify your Science Labs email':'Reset your Science Labs password';
      const sent=await this.send({to,subject,html:`<h1>${escape(subject)}</h1><p><a href="${escape(url)}">${kind==='verify'?'Verify email':'Reset password'}</a></p><p>If you did not request this, you can ignore this message.</p>`,key:`auth/${kind}/${digest(url)}`});
      if(sent.status!=='sent')throw new Error('Email delivery failed. Please request a new email.');
    },
    async retry(id){const row=(await db.query('SELECT * FROM email_outbox WHERE id=$1',[id])).rows[0];if(!row)return null;return deliver(row);},
  };
}
