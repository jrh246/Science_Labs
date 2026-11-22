import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {configuration} from '../src/config.js';
import {openDatabase,migrate} from '../src/database.js';
import {createApp} from '../src/app.js';
import {registerRelease,publish} from '../src/catalog.js';
import {teacherContent} from '../src/authoring.js';
import {suggestDraft,runSuggestionJob} from '../src/ai-drafts.js';
let db,server,base,config,owner,teacher,student,outsider,copy,revision1,assignment,workspace,classroom;
const password='PrepDrawer-authoring-test-2026';
const content={title:'My evidence investigation',directions:'Complete the original lab. Use your observations to explain each comparison.',learningGoals:['Explain the role of a control.','Support a claim with observations.'],questions:[{id:'q_evidence',prompt:'Which observation supports your claim? Explain why.',required:true}]};
async function api(path,body,user,method=body===undefined?'GET':'POST'){
  const r=await fetch(base+'/api'+path,{method,headers:{Origin:config.appUrl,...(body===undefined?{}:{'Content-Type':'application/json'}),...(user?{Cookie:user.cookie}:{})},body:body===undefined?undefined:JSON.stringify(body),redirect:'manual'});
  return {status:r.status,data:await r.json(),cookies:r.headers.getSetCookie()};
}
async function user(label){
  const email=label+'@example.test';await api('/auth/sign-up/email',{name:label,email,password});
  const mail=(await db.query('SELECT html FROM email_outbox WHERE recipient=$1 ORDER BY created_at DESC LIMIT 1',[email])).rows[0];
  const link=mail.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');await fetch(link.replace(config.apiUrl,base),{redirect:'manual'});
  const login=await api('/auth/sign-in/email',{email,password});assert.equal(login.status,200);return {id:login.data.user.id,cookie:login.cookies.map(value=>value.split(';')[0]).join(';')};
}
before(async()=>{
  config=configuration({PLATFORM_LOCAL:'true',PLATFORM_ENV:'test',LOCAL_DATA_DIR:':memory:'});db=await openDatabase(config);await migrate(db);
  server=createServer(createApp(db,config).app);await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port;
  owner=await user('authoring-owner');teacher=await user('authoring-teacher');student=await user('authoring-student');outsider=await user('authoring-outsider');
  await db.query('INSERT INTO platform_owners(user_id) VALUES($1)',[owner.id]);
  await registerRelease(db,{id:'f'.repeat(24),commit:'a'.repeat(40),capabilities:['teacher-lab-overlays-v1'],courses:[{id:'biology',title:'Biology',description:''}],units:[{id:'genetics',courseId:'biology',title:'Genetics',description:'',position:1}],labs:[{id:'genetic-information',unitId:'genetics',title:'Original molecular lab',summary:'Original evidence',position:1,entry:'investigation.html'}],files:{}});
  await publish(db,owner,'course','biology',{published:true});await publish(db,owner,'unit','genetics',{published:true});await publish(db,owner,'lab','genetic-information',{published:true,release_id:'f'.repeat(24)});
  await api('/workspaces',{name:'Other active teacher'},outsider);
  workspace=(await api('/workspaces',{name:'Teacher authoring'},teacher)).data;classroom=(await api('/classes',{organizationId:workspace.id,name:'Biology'},teacher)).data;
  await db.query('INSERT INTO enrollments(class_id,user_id) VALUES($1,$2)',[classroom.id,student.id]);
});
after(async()=>{await new Promise(resolve=>server.close(resolve));await db.end();});
test('teacher copies are private, and editing never changes company content',async()=>{
  const result=await api('/teacher/labs',{labId:'genetic-information'},teacher);assert.equal(result.status,201,JSON.stringify(result.data));copy=result.data;
  assert.equal((await api('/teacher/labs/'+copy.id,undefined,outsider)).status,404);
  assert.equal((await api('/teacher/labs',undefined,outsider)).data.length,0);
  const saved=await api('/teacher/labs/'+copy.id,{content,expectedVersion:1},teacher,'PUT');assert.equal(saved.status,200,JSON.stringify(saved.data));copy=saved.data;
  assert.equal((await db.query("SELECT title FROM labs WHERE id='genetic-information'")).rows[0].title,'Original molecular lab');
  assert.equal((await api('/teacher/labs/'+copy.id,{content:{...content,title:'Stale'},expectedVersion:1},teacher,'PUT')).status,409);
});
test('publication requires current preview and review; published revisions are immutable',async()=>{
  const review={science:true,language:true,interaction:true};
  assert.equal((await api('/teacher/labs/'+copy.id+'/publish',{expectedVersion:copy.draft_version,review},teacher)).status,409);
  assert.equal((await api('/launch',{teacherLabId:copy.id},teacher)).status,200);
  assert.equal((await api('/teacher/labs/'+copy.id+'/publish',{expectedVersion:copy.draft_version,review:{}},teacher)).status,400);
  const published=await api('/teacher/labs/'+copy.id+'/publish',{expectedVersion:copy.draft_version,review},teacher);assert.equal(published.status,201,JSON.stringify(published.data));revision1=published.data;
  const same=await api('/teacher/labs/'+copy.id+'/publish',{expectedVersion:copy.draft_version,review},teacher);assert.equal(same.data.id,revision1.id);
  await assert.rejects(()=>db.query("UPDATE teacher_lab_revisions SET content='{}' WHERE id=$1",[revision1.id]),/cannot be changed/);
});
test('private assignment drafts stay hidden, then pin a teacher revision on publication',async()=>{
  const created=await api('/classes/'+classroom.id+'/assignments',{teacherRevisionId:revision1.id,publicationState:'draft'},teacher);assert.equal(created.status,201,JSON.stringify(created.data));assignment=created.data;
  assert.equal((await api('/student/assignments',undefined,student)).data.length,0);
  assert.equal((await api('/assignments/'+assignment.id+'/attempt',undefined,student)).status,404);
  assert.equal((await api('/launch',{assignmentId:assignment.id},student)).status,404);
  assert.equal((await api('/assignments/'+assignment.id,{publicationState:'published'},teacher,'PATCH')).status,200);
  const assigned=(await api('/assignments/'+assignment.id+'/attempt',undefined,student)).data.assignment;
  assert.equal(assigned.teacher_lab_revision_id,revision1.id);assert.equal(assigned.release_id,'f'.repeat(24));assert.equal(assigned.teacher_lab_snapshot.content.title,content.title);
  assert.equal((await api('/classes/'+classroom.id+'/assignments',{teacherRevisionId:revision1.id},outsider)).status,404);
});
test('later draft/published edits leave an assigned snapshot and its original question unchanged',async()=>{
  const next={...content,title:'New teaching version',questions:[{id:'q_new',prompt:'A different question?',required:false}]};
  copy=(await api('/teacher/labs/'+copy.id,{content:next,expectedVersion:copy.draft_version},teacher,'PUT')).data;
  await api('/launch',{teacherLabId:copy.id},teacher);
  const published=await api('/teacher/labs/'+copy.id+'/publish',{expectedVersion:copy.draft_version,review:{science:true,language:true,interaction:true}},teacher);assert.equal(published.data.revision,2);
  const assigned=(await api('/assignments/'+assignment.id+'/attempt',undefined,student)).data.assignment;
  assert.equal(assigned.teacher_lab_revision_id,revision1.id);assert.equal(assigned.teacher_lab_snapshot.content.questions[0].id,'q_evidence');
});
test('submitted teacher reports must include their assigned prompts and required answers',async()=>{
  const snapshot=assignment.teacher_lab_snapshot;
  const report={schemaVersion:2,labId:'genetic-information',title:content.title,question:'Question',student:{name:'Test'},status:'Complete',sections:[],teacherLab:{revisionId:revision1.id,contentHash:snapshot.contentHash,responses:[{id:'q_evidence',prompt:content.questions[0].prompt,response:''}]}};
  const save=report=>api('/assignments/'+assignment.id+'/attempt',{expectedRevision:0,storage:{test:'{}'},report},student,'PUT');
  assert.equal((await save(report)).status,400);
  report.teacherLab.responses[0].response='My observation supports the claim because the control stayed unchanged.';
  assert.equal((await save(report)).status,200);
  assert.equal((await api('/assignments/'+assignment.id+'/submit',{revision:1},student)).status,201);
});
test('unsupported mutations and duplicate teacher question IDs are rejected',()=>{
  assert.throws(()=>teacherContent({...content,executableScript:'alert(1)'}));
  assert.throws(()=>teacherContent({...content,questions:[content.questions[0],content.questions[0]]}));
});
test('OpenAI integration uses server-only structured output and does not save or publish suggestions',async()=>{
  let request;
  const suggestion=await suggestDraft({...config,aiEnabled:true,openaiKey:'test-key',openaiModel:'test-model'},{content,prompt:'Clarify the question.',base:{title:'Original'}},async(url,options)=>{request={url,body:JSON.parse(options.body)};return {ok:true,json:async()=>({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({content,changeSummary:'Clarified the wording.',limitations:'Original simulation retained.'})}]}]})};});
  assert.equal(request.body.store,false);assert.equal(request.body.text.format.strict,true);assert.equal(request.url,'https://api.openai.com/v1/responses');assert.deepEqual(suggestion.content,content);
  const retained=(await api('/teacher/labs/'+copy.id,undefined,teacher)).data;assert.equal(retained.lab.draft.title,'New teaching version');
  assert.equal((await api('/teacher/labs/'+copy.id+'/suggest',{expectedVersion:copy.draft_version,prompt:'Help'},teacher)).status,503);
  await assert.rejects(()=>suggestDraft({...config,aiEnabled:true,openaiKey:'test-key',openaiModel:'test-model'},{content,prompt:'Help'},async()=>({ok:true,json:async()=>({status:'incomplete',output:[]})})),/unfinished/);
});
test('background suggestions are durable, private, idempotent, and separate from the saved draft',async()=>{
  const aiConfig={...config,aiEnabled:true,openaiKey:'local-fixture-key',openaiModel:'test-model'};
  let queued;
  const fixtureServer=createServer(createApp(db,aiConfig,{ai:{enqueue:async jobId=>{queued=jobId;}}}).app);
  await new Promise(resolve=>fixtureServer.listen(0,'127.0.0.1',resolve));
  const address='http://127.0.0.1:'+fixtureServer.address().port;
  const request=async(path,body,user=teacher)=>{
    const r=await fetch(address+'/api'+path,{method:body?'POST':'GET',headers:{Origin:config.appUrl,Cookie:user.cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json()};
  };
  try{
    const created=await request('/teacher/labs/'+copy.id+'/suggest',{expectedVersion:copy.draft_version,prompt:'Clarify my draft.',content});assert.equal(created.status,202);assert.equal(created.data.jobId,queued);
    const path='/teacher/labs/'+copy.id+'/suggestions/'+queued;
    assert.equal((await request(path)).data.status,'queued');assert.equal((await request(path,undefined,outsider)).status,404);
    let generations=0;const services={fetch:async()=>{generations++;return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify({content,changeSummary:'Suggested clear wording.',limitations:'Original interaction retained.'})}]}]})};}};
    await runSuggestionJob(db,aiConfig,queued,services);await runSuggestionJob(db,aiConfig,queued,services);
    assert.equal(generations,1);const completed=(await request(path)).data;assert.equal(completed.status,'complete');assert.equal(completed.suggestion.content.title,content.title);
    const saved=(await api('/teacher/labs/'+copy.id,undefined,teacher)).data;assert.equal(saved.lab.draft.title,'New teaching version');assert.equal(saved.revisions.length,2);assert.equal(saved.suggestions[0].status,'complete');
  }finally{await new Promise(resolve=>fixtureServer.close(resolve));}
});
