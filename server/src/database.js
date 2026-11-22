import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import pg from 'pg';

// Both adapters execute PostgreSQL. PGlite provides a local, credential-free
// database; deployed Lambda instances use Neon's TLS connection string.
export async function openDatabase(config) {
  if(!config.local)return new pg.Pool({connectionString:config.databaseUrl,max:2,idleTimeoutMillis:10000,connectionTimeoutMillis:10000});
  const {PGlite}=await import('@electric-sql/pglite');
  const database=new PGlite(config.localData===':memory:'?undefined:config.localData);
  let tail=Promise.resolve();
  async function lock(){const previous=tail;let release;tail=new Promise(resolve=>{release=resolve;});await previous;return release;}
  async function query(text,values){
    const q=typeof text==='string'?{text,values}:text;
    const result=(!q.values?.length&&q.text.trim().replace(/;$/, '').includes(';'))?(await database.exec(q.text)).at(-1):await database.query(q.text,q.values||[]);
    return {...result,rowCount:result.affectedRows??result.rows.length,command:q.text.trim().split(/\s/)[0]};
  }
  return {
    async query(text,values){const release=await lock();try{return await query(text,values);}finally{release();}},
    async connect(){const release=await lock();return {query,release,on(){},removeListener(){}};},
    async end(){await tail;await database.close();},
  };
}
export async function transaction(pool,work){
  const client=await pool.connect();
  try{await client.query('BEGIN');const result=await work(client);await client.query('COMMIT');return result;}
  catch(error){await client.query('ROLLBACK');throw error;}
  finally{client.release();}
}
export async function migrate(pool){
  await pool.query('CREATE TABLE IF NOT EXISTS platform_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const directory=fileURLToPath(new URL('../migrations/',import.meta.url));
  for(const name of (await readdir(directory)).filter(name=>name.endsWith('.sql')).sort()){
    await transaction(pool,async db=>{
      await db.query("SELECT pg_advisory_xact_lock(724518)");
      if((await db.query('SELECT 1 FROM platform_migrations WHERE name=$1',[name])).rows.length)return;
      await db.query(await readFile(directory+'/'+name,'utf8'));
      await db.query('INSERT INTO platform_migrations(name) VALUES($1)',[name]);
    });
  }
}
