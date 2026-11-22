import {test,expect} from '@playwright/test';
import {reportAttempt} from '../fixtures/report-attempts.js';
const password='PrepDrawer-browser-test-2026';
async function call(page,path,body,method=body===undefined?'GET':'POST'){return page.evaluate(async({path,body,method})=>{const r=await fetch('/api'+path,{method,credentials:'include',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};},{path,body,method});}
async function login(page,email,secret=password){await page.goto('/platform.html#/login');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(secret);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();}
async function mailLink(page,email,subject){const rows=(await call(page,'/dev/outbox')).data;const row=rows.find(r=>r.recipient===email&&r.subject.includes(subject));expect(row).toBeTruthy();return row.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');}
async function signup(page,name,email){await page.goto('/platform.html#/signup');await page.getByLabel('Your name',{exact:true}).fill(name);await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.locator('#notice')).toContainText('Account created');await page.goto(await mailLink(page,email,'Verify'));await login(page,email);}

test('teacher owns a private draft, previews/publishes it, assigns a pinned version, and receives the full student report',async({browser})=>{
  test.setTimeout(180000);
  const ownerContext=await browser.newContext(),teacherContext=await browser.newContext(),studentContext=await browser.newContext();
  const owner=await ownerContext.newPage(),teacher=await teacherContext.newPage(),student=await studentContext.newPage();
  const errors=[];for(const p of [owner,teacher,student]){p.setDefaultTimeout(20000);p.on('pageerror',error=>errors.push(error.message));}
  await login(owner,'owner@example.test','ScienceLabs!Local2026');
  const catalog=(await call(owner,'/owner/catalog')).data;
  const release=catalog.releases.find(r=>r.manifest.capabilities?.includes('teacher-lab-overlays-v1'));expect(release).toBeTruthy();
  for(const labId of ['enzyme-activity','light-photosynthesis','osmosis-homeostasis','dna-replication','genetic-information']){
    const lab=catalog.labs.find(l=>l.id===labId);
    expect((await call(owner,'/owner/content/course/biology',{published:true},'PATCH')).status).toBe(200);
    expect((await call(owner,'/owner/content/unit/'+lab.unit_id,{published:true},'PATCH')).status).toBe(200);
    expect((await call(owner,'/owner/content/lab/'+labId,{published:true,release_id:release.id},'PATCH')).status).toBe(200);
  }
  const stamp=Date.now().toString(36),teacherEmail=`teacher-author-${stamp}@example.test`,studentEmail=`student-author-${stamp}@example.test`;
  await signup(teacher,'Teacher Morgan',teacherEmail);
  await teacher.goto('/platform.html#/membership');await teacher.getByLabel('Workspace name',{exact:true}).fill('Authoring science '+stamp);await teacher.getByRole('button',{name:'Create workspace',exact:true}).click();
  await teacher.getByLabel('Class name',{exact:true}).fill('Biology authoring '+stamp);await teacher.getByRole('button',{name:'Create class',exact:true}).click();await expect(teacher.getByRole('heading',{name:'Assign a lab',exact:true})).toBeVisible();
  const classId=new URL(teacher.url()).hash.split('/class/')[1];
  await teacher.getByLabel('Student email',{exact:true}).fill(studentEmail);await teacher.getByRole('button',{name:'Send invitation',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Invitation');const invitation=await mailLink(teacher,studentEmail,'invited');
  await signup(student,'Student Taylor',studentEmail);await student.goto(invitation);await student.getByRole('button',{name:'Accept invitation',exact:true}).click();await expect(student.locator('#notice')).toContainText('Invitation accepted');
  await teacher.getByRole('link',{name:'My labs',exact:true}).click();await teacher.getByLabel('Original lab',{exact:true}).selectOption('enzyme-activity');await teacher.getByRole('button',{name:'Make my private copy',exact:true}).click();await expect(teacher.getByLabel('Lab title',{exact:true})).toBeVisible();
  const labId=new URL(teacher.url()).hash.split('/teacher-lab/')[1];
  await teacher.getByLabel('Lab title',{exact:true}).fill('Our enzyme evidence lab');await teacher.getByLabel('Student directions',{exact:true}).fill('Complete the original comparison. Use your observations to explain the control.');await teacher.getByLabel('Learning goals — one per line',{exact:true}).fill('Compare gas collected at three temperatures.\nExplain why a control helps test a claim.');
  await teacher.getByRole('button',{name:'Add a question',exact:true}).click();await teacher.getByLabel('Question 1',{exact:true}).fill('What makes your evidence stronger than a guess?');
  await teacher.getByRole('button',{name:'Save draft',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Private draft saved');
  expect((await call(student,'/teacher/labs/'+labId)).status).toBe(402);
  await teacher.setViewportSize({width:390,height:950});expect(await teacher.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await teacher.screenshot({path:'tmp/teacher-authoring-review/editor-phone.png',fullPage:true});
  await teacher.getByRole('button',{name:'Save and preview',exact:true}).click();await expect(teacher.frameLocator('.lab-frame').getByRole('heading',{name:'Our enzyme evidence lab',exact:true})).toBeVisible();await expect(teacher.frameLocator('.lab-frame').getByRole('heading',{name:'Your teacher’s questions',exact:true})).toBeVisible();
  await teacher.getByRole('link',{name:'Return to editor',exact:true}).click();
  for(const label of ['I checked the scientific meaning and learning goals.','I reviewed the student wording for ninth-grade readers.','I checked the interaction, visuals, and report in preview.'])await teacher.getByLabel(label,{exact:true}).check();
  await teacher.getByRole('button',{name:'Publish version',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Revision 1 published');
  const revision1=(await call(teacher,'/teacher/labs/'+labId)).data.revisions[0];
  await teacher.setViewportSize({width:1440,height:1000});await teacher.goto('/platform.html#/class/'+classId);await teacher.getByLabel('Lab',{exact:true}).selectOption('teacher:'+revision1.id);await teacher.getByLabel('Assignment title (optional)',{exact:true}).fill('Explain our enzyme evidence');await teacher.getByLabel('Assignment visibility',{exact:true}).selectOption('draft');await teacher.getByRole('button',{name:'Create assignment',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Private assignment draft saved');
  const assignment=(await call(teacher,'/classes/'+classId)).data.assignments[0];expect((await call(student,'/assignments/'+assignment.id+'/attempt')).status).toBe(404);
  await teacher.getByRole('button',{name:'Publish assignment',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Assignment published');
  await teacher.getByRole('button',{name:'Copy student link',exact:true}).click();await expect(teacher.locator('#notice')).toContainText(/Student link|student link/);
  await student.goto('/platform.html#/assignment/'+assignment.id);
  const fixture=reportAttempt('enzyme-activity',true);student.once('dialog',dialog=>dialog.accept());await student.locator('input[type="file"]').setInputFiles({name:'existing-device-work.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'science-labs-device-work',version:1,storage:{[fixture.key]:JSON.stringify(fixture.state)}}))});await expect(student.locator('#notice')).toContainText('Device work imported');
  await student.getByRole('link',{name:'Continue lab',exact:true}).click();const frame=student.frameLocator('.lab-frame');
  await frame.getByRole('button',{name:'Submit to teacher',exact:true}).click();await expect(frame.locator('.platform-work p')).toContainText('Finish the lab');
  await frame.getByLabel('What makes your evidence stronger than a guess? (required)',{exact:true}).fill('My measured comparison includes a control, so I can explain what changed.');await frame.getByLabel('Name (optional)',{exact:true}).fill('Taylor Evidence');
  await frame.getByRole('button',{name:'Save progress',exact:true}).click();await expect(frame.locator('.platform-work p')).toContainText('Saved to your account');
  const saved=(await call(student,'/assignments/'+assignment.id+'/attempt')).data.attempt;expect(saved.report.title).toBe('Our enzyme evidence lab');expect(saved.report.status).toBe('Complete');expect(saved.report.teacherLab.revisionId).toBe(revision1.id);
  const pdfEvent=student.waitForEvent('download');await frame.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();await(await pdfEvent).saveAs('tmp/teacher-authoring-review/student-complete.pdf');
  await frame.locator('html').evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await expect(frame.locator('#student-report-print')).toContainText('My measured comparison includes a control');await frame.locator('html').evaluate(()=>window.dispatchEvent(new Event('afterprint')));
  await frame.getByRole('button',{name:'Submit to teacher',exact:true}).click();await expect(frame.locator('.platform-work p')).toContainText('Submitted to your teacher');
  await teacher.goto('/platform.html#/assignment-review/'+assignment.id);await teacher.getByRole('link',{name:'Review report',exact:true}).click();await expect(teacher.locator('.report')).toContainText('What makes your evidence stronger than a guess?');await expect(teacher.locator('.report')).toContainText('My measured comparison includes a control');await teacher.screenshot({path:'tmp/teacher-authoring-review/teacher-report.png',fullPage:true});
  const teacherPdf=teacher.waitForEvent('download');await teacher.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();await(await teacherPdf).saveAs('tmp/teacher-authoring-review/teacher-submitted.pdf');
  await teacher.goto('/platform.html#/teacher-lab/'+labId);await teacher.getByLabel('Lab title',{exact:true}).fill('Next class draft');await teacher.getByLabel('Question 1',{exact:true}).fill('A new question for a future class.');await teacher.getByRole('button',{name:'Save draft',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Private draft saved');
  await student.reload();await expect(student.frameLocator('.lab-frame').getByRole('heading',{name:'Our enzyme evidence lab',exact:true})).toBeVisible();await expect(student.frameLocator('.lab-frame').getByLabel('What makes your evidence stronger than a guess? (required)',{exact:true})).toHaveValue('My measured comparison includes a control, so I can explain what changed.');
  for(const baseLabId of ['light-photosynthesis','osmosis-homeostasis','dna-replication','genetic-information']){
    const copy=(await call(teacher,'/teacher/labs',{labId:baseLabId})).data;
    const content={title:'Teacher '+baseLabId,directions:'Use observations from the original investigation.',learningGoals:['Explain a comparison.','Explain a limitation.'],questions:[{id:'q_observe',prompt:'Which observation supports your explanation?',required:true}]};
    expect((await call(teacher,'/teacher/labs/'+copy.id,{content,expectedVersion:copy.draft_version},'PUT')).status).toBe(200);
    await teacher.goto('/platform.html#/run?teacherLab='+copy.id);const child=teacher.frameLocator('.lab-frame');await expect(child.getByRole('heading',{name:content.title,exact:true})).toBeVisible();await expect(child.getByRole('button',{name:'Save progress',exact:true})).toBeEnabled();await child.getByLabel('Which observation supports your explanation? (required)',{exact:true}).fill('My draft explanation stays verbatim.');
    const reportDownload=teacher.waitForEvent('download');await child.getByRole('button',{name:/PDF/}).first().click();await(await reportDownload).saveAs('tmp/teacher-authoring-review/'+baseLabId+'-draft.pdf');
  }
  expect(errors).toEqual([]);await ownerContext.close();await teacherContext.close();await studentContext.close();
});

test('OpenAI suggestion review requires Apply and Save, using provider fixtures without live requests',async({browser})=>{
  const ownerContext=await browser.newContext(),teacherContext=await browser.newContext();
  const owner=await ownerContext.newPage(),teacher=await teacherContext.newPage();
  teacher.setDefaultTimeout(20000);
  await teacher.route('**/api/health',async route=>{const response=await route.fetch();const health=await response.json();await route.fulfill({response,json:{...health,aiEnabled:true}});});
  await login(owner,'owner@example.test','ScienceLabs!Local2026');
  const catalog=(await call(owner,'/owner/catalog')).data,release=catalog.releases.find(r=>r.manifest.capabilities?.includes('teacher-lab-overlays-v1'));
  const lab=catalog.labs.find(l=>l.id==='enzyme-activity');
  await call(owner,'/owner/content/course/biology',{published:true},'PATCH');await call(owner,'/owner/content/unit/'+lab.unit_id,{published:true},'PATCH');await call(owner,'/owner/content/lab/enzyme-activity',{published:true,release_id:release.id},'PATCH');
  const stamp=Date.now().toString(36);await signup(teacher,'Suggestion Teacher',`ai-fixture-${stamp}@example.test`);await call(teacher,'/workspaces',{name:'Suggestions '+stamp});
  const copy=(await call(teacher,'/teacher/labs',{labId:'enzyme-activity'})).data;
  const original={title:'My saved teaching draft',directions:'Use the original observations.',learningGoals:['Compare observations.','Explain a control.'],questions:[{id:'q_evidence',prompt:'What supports your claim?',required:true}]};
  await call(teacher,'/teacher/labs/'+copy.id,{content:original,expectedVersion:copy.draft_version},'PUT');
  const proposed={...original,title:'Suggested evidence lab',directions:'Compare your measurements with the control. Explain which observations support your claim.'};
  let generations=0;
  await teacher.route('**/api/teacher/labs/*/suggest',async route=>{generations++;await route.fulfill({status:202,json:{jobId:'00000000-0000-4000-8000-000000000001',status:'queued',baseVersion:2}});});
  await teacher.route('**/api/teacher/labs/*/suggestions/*',async route=>{await route.fulfill({status:200,json:{jobId:'00000000-0000-4000-8000-000000000001',status:'complete',baseVersion:2,suggestion:{content:proposed,changeSummary:'Clarified the direction to compare evidence.',limitations:'The original simulation and core questions are unchanged.'}}});});
  await teacher.goto('/platform.html#/teacher-lab/'+copy.id);
  await teacher.getByLabel('What should change?',{exact:true}).fill('Clarify my directions.');await teacher.getByRole('button',{name:'Suggest changes',exact:true}).click();await expect(teacher.getByRole('heading',{name:'Suggested draft',exact:true})).toBeVisible();
  expect((await call(teacher,'/teacher/labs/'+copy.id)).data.lab.draft.title).toBe(original.title);
  await teacher.getByRole('button',{name:'Discard suggestion',exact:true}).click();await expect(teacher.getByRole('heading',{name:'Suggested draft',exact:true})).toHaveCount(0);await expect(teacher.getByLabel('Lab title',{exact:true})).toHaveValue(original.title);
  await teacher.getByRole('button',{name:'Suggest changes',exact:true}).click();await teacher.getByRole('button',{name:'Apply to editor',exact:true}).click();await expect(teacher.getByLabel('Lab title',{exact:true})).toHaveValue(proposed.title);
  expect((await call(teacher,'/teacher/labs/'+copy.id)).data.lab.draft.title).toBe(original.title);
  await teacher.getByRole('button',{name:'Save draft',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Private draft saved');const saved=(await call(teacher,'/teacher/labs/'+copy.id)).data;expect(saved.lab.draft.title).toBe(proposed.title);expect(saved.revisions).toHaveLength(0);expect(generations).toBe(2);
  await ownerContext.close();await teacherContext.close();
});
