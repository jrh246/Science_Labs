import {test,expect} from '@playwright/test';
import {reportAttempt} from '../fixtures/report-attempts.js';
const password='ScienceLabs-browser-test-2026';
const stamp=Date.now().toString(36);
async function login(page,email,secret=password){await page.goto('/platform.html#/login');await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(secret);await page.getByRole('button',{name:'Sign in',exact:true}).click();await expect(page.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();}
async function emailLink(page,email,subject){const response=await page.request.get('/api/dev/outbox');const rows=await response.json();const row=rows.find(row=>row.recipient===email&&row.subject.includes(subject));expect(row).toBeTruthy();return row.html.match(/href="([^"]+)"/)[1].replace(/&amp;/g,'&');}
async function signup(page,name,email){
  await page.goto('/platform.html#/signup');await page.getByLabel('Your name',{exact:true}).fill(name);await page.getByLabel('Email address',{exact:true}).fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Create account',exact:true}).click();await expect(page.locator('#notice')).toContainText('Account created');
  await page.goto(await emailLink(page,email,'Verify'));await login(page,email);
}
async function call(page,path,body,method=body?'POST':'GET'){
  return page.evaluate(async({path,body,method})=>{const response=await fetch('/api'+path,{method,credentials:'include',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json()};},{path,body,method});
}
test('owner publishing, teacher invitation, pinned assignment, cloud work, submission and feedback',async({browser})=>{
  const ownerContext=await browser.newContext(),teacherContext=await browser.newContext(),studentContext=await browser.newContext();
  const owner=await ownerContext.newPage(),teacher=await teacherContext.newPage(),student=await studentContext.newPage();
  const errors=[];for(const page of [owner,teacher,student])page.on('pageerror',error=>errors.push(error.message));
  await login(owner,'owner@example.test','ScienceLabs!Local2026');
  await owner.goto('/platform.html#/owner');await expect(owner.getByRole('heading',{name:'Manage publishing',exact:true})).toBeVisible();
  const catalog=(await call(owner,'/owner/catalog')).data;const release=catalog.releases.find(r=>r.manifest.labs.some(lab=>lab.id==='enzyme-activity'));
  const row=owner.locator('.owner-lab').filter({has:owner.getByRole('heading',{name:'What Changes Enzyme Activity?',exact:true})});
  await row.getByLabel('Production version').selectOption(release.id);await row.getByLabel('Access',{exact:true}).selectOption('subscription');await row.getByRole('button',{name:'Save version and access'}).click();await expect(owner.locator('#notice')).toContainText('saved');
  if(await row.getByRole('button',{name:'Publish lab',exact:true}).count())await row.getByRole('button',{name:'Publish lab',exact:true}).click();
  const unit=owner.locator('.unit-group').filter({has:owner.locator('summary').filter({hasText:/^The Cell /})});
  if(await unit.getByRole('button',{name:'Publish unit',exact:true}).count())await unit.getByRole('button',{name:'Publish unit',exact:true}).click();
  if(await owner.getByRole('button',{name:'Publish course',exact:true}).count())await owner.getByRole('button',{name:'Publish course',exact:true}).click();
  await owner.screenshot({path:'tmp/platform-review/owner-publishing.png',fullPage:true});
  const teacherEmail=`teacher-${stamp}@example.test`,studentEmail=`student-${stamp}@example.test`;
  await signup(teacher,'Ms Rivera',teacherEmail);
  await teacher.goto('/platform.html#/membership');await teacher.getByLabel('Workspace name',{exact:true}).fill('Biology teaching '+stamp);await teacher.getByRole('button',{name:'Create workspace',exact:true}).click();
  await teacher.getByLabel('Class name',{exact:true}).fill('Biology 9 '+stamp);await teacher.getByLabel('Period (optional)',{exact:true}).fill('3');await teacher.getByRole('button',{name:'Create class',exact:true}).click();
  await expect(teacher.getByRole('heading',{name:'Invite a student',exact:true})).toBeVisible();const classId=new URL(teacher.url()).hash.split('/class/')[1];
  await teacher.getByLabel('Student email',{exact:true}).fill(studentEmail);await teacher.getByRole('button',{name:'Send invitation',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Invitation');
  const invitation=await emailLink(teacher,studentEmail,'invited');
  await teacher.getByLabel('Lab',{exact:true}).selectOption('enzyme-activity');await teacher.getByLabel('Assignment title (optional)',{exact:true}).fill('Explain the enzyme evidence');await teacher.getByLabel('Directions (optional)',{exact:true}).fill('Use the first 30 seconds and explain the control.');await teacher.getByRole('button',{name:'Create assignment',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Assignment created');
  const c=(await call(teacher,'/classes/'+classId)).data;const assignment=c.assignments[0];expect(assignment.release_id).toBe(release.id);
  await expect(teacher.getByRole('heading',{name:'Invite a student',exact:true})).toBeVisible();await teacher.screenshot({path:'tmp/platform-review/teacher-class.png',fullPage:true});
  await student.goto(invitation);await expect(student).toHaveURL(/#\/login/);await signup(student,'Zoë García',studentEmail);await expect(student.getByRole('button',{name:'Accept invitation',exact:true})).toBeVisible();await student.getByRole('button',{name:'Accept invitation',exact:true}).click();
  await student.getByRole('link',{name:'Open assignment',exact:true}).click();
  const fixture=reportAttempt('enzyme-activity',true);student.once('dialog',dialog=>dialog.accept());
  await student.locator('input[type="file"]').setInputFiles({name:'device-work.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({format:'science-labs-device-work',version:1,storage:{[fixture.key]:JSON.stringify(fixture.state)}}))});await expect(student.locator('#notice')).toContainText('imported');
  await student.getByRole('link',{name:'Continue lab',exact:true}).click();const frame=student.frameLocator('.lab-frame');
  await expect(frame.getByRole('button',{name:'Download lab report (PDF)',exact:true})).toBeVisible();
  await frame.getByLabel('Name (optional)',{exact:true}).fill('Zoë García');
  await frame.getByRole('button',{name:'Save progress',exact:true}).click();await expect(frame.locator('.platform-work p')).toContainText('Saved to your account');
  await frame.getByRole('button',{name:'Submit to teacher',exact:true}).click();await expect(frame.locator('.platform-work p')).toContainText('Submitted to your teacher');
  const saved=(await call(student,'/assignments/'+assignment.id+'/attempt')).data;expect(saved.attempt.report.student.name).toBe('Zoë García');expect(saved.submissions.length).toBe(1);
  const engineReady=student.waitForResponse(response=>response.url().includes('/assets/lab-report-pdf-')&&response.ok());await student.reload();await(await engineReady).finished();await expect(student.frameLocator('.lab-frame').getByLabel('Name (optional)',{exact:true})).toHaveValue('Zoë García');
  await studentContext.setOffline(true);const reportEvent=student.waitForEvent('download');await student.frameLocator('.lab-frame').getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();const pdf=await reportEvent;expect(pdf.suggestedFilename()).toContain('Zoë-García');await pdf.saveAs('tmp/platform-review/assigned-lab-report.pdf');await studentContext.setOffline(false);
  await student.setViewportSize({width:390,height:950});expect(await student.frameLocator('.lab-frame').locator('html').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);await student.screenshot({path:'tmp/platform-review/student-lab.png',fullPage:true});
  await teacher.goto('/platform.html#/assignment-review/'+assignment.id);await teacher.getByRole('link',{name:'Review report',exact:true}).click();await expect(teacher.locator('.report')).toContainText('Written explanation 1 for enzyme-activity');await expect(teacher.locator('.report')).toContainText('Submitted from the signed-in account');
  const teacherDownload=teacher.waitForEvent('download');await teacher.getByRole('button',{name:'Download lab report (PDF)',exact:true}).click();await(await teacherDownload).saveAs('tmp/platform-review/submitted-lab-report.pdf');
  await teacher.getByLabel('Feedback',{exact:true}).fill('You used the measurements. Add why gas collection is indirect evidence.');await teacher.getByLabel('Score (optional)',{exact:true}).fill('8');await teacher.getByLabel('Maximum score (optional)',{exact:true}).fill('10');await teacher.getByLabel('Ask the student to revise and submit again').check();await teacher.getByRole('button',{name:'Save feedback',exact:true}).click();await expect(teacher.locator('#notice')).toContainText('Teacher feedback saved');
  await expect(teacher.locator('.report')).toContainText('Teacher score: 8 / 10');await expect(teacher.locator('.report')).toContainText('Add why gas collection is indirect evidence.');await teacher.screenshot({path:'tmp/platform-review/teacher-review.png',fullPage:true});
  await student.goto('/platform.html#/assignment/'+assignment.id);await expect(student.locator('main')).toContainText('Add why gas collection is indirect evidence.');
  const other=await studentContext.newPage();
  await student.goto('/platform.html#/run?assignment='+assignment.id);await other.goto('/platform.html#/run?assignment='+assignment.id);
  await expect(student.frameLocator('.lab-frame').getByRole('button',{name:'Save progress',exact:true})).toBeEnabled();
  await expect(other.frameLocator('.lab-frame').getByRole('button',{name:'Save progress',exact:true})).toBeEnabled();
  await studentContext.setOffline(true);
  await student.frameLocator('.lab-frame').getByLabel('Name (optional)',{exact:true}).fill('Copy in tab A');
  await other.frameLocator('.lab-frame').getByLabel('Name (optional)',{exact:true}).fill('Copy in tab B');
  const localDownload=student.waitForEvent('download');await student.frameLocator('.lab-frame').getByRole('button',{name:'Download device work',exact:true}).click();
  const localFile=await localDownload,stream=await localFile.createReadStream();let localText='';for await(const chunk of stream)localText+=chunk;
  const backup=JSON.parse(localText);expect(Object.values(backup.storage).map(value=>JSON.parse(value).studentName)).toContain('Copy in tab A');
  await studentContext.setOffline(false);await other.close();
  student.once('dialog',dialog=>dialog.accept());await student.frameLocator('.lab-frame').getByRole('button',{name:'Reload cloud copy',exact:true}).click();
  await expect(student.frameLocator('.lab-frame').getByRole('button',{name:'Save progress',exact:true})).toBeEnabled();
  for(const labId of ['light-photosynthesis','osmosis-homeostasis','dna-replication','genetic-information']){
    const lab=catalog.labs.find(item=>item.id===labId);
    expect((await call(owner,'/owner/content/unit/'+lab.unit_id,{published:true},'PATCH')).status).toBe(200);
    expect((await call(owner,'/owner/content/lab/'+labId,{release_id:release.id,published:true},'PATCH')).status).toBe(200);
    const assigned=await call(teacher,'/classes/'+classId+'/assignments',{labId});expect(assigned.status).toBe(201);
    await student.goto('/platform.html#/run?assignment='+assigned.data.id);
    const child=student.frameLocator('.lab-frame');await expect(child.getByRole('button',{name:'Save progress',exact:true})).toBeEnabled();
    await child.getByRole('button',{name:'Save progress',exact:true}).click();await expect(child.locator('.platform-work p')).toContainText('Saved to your account');
    const draft=(await call(student,'/assignments/'+assigned.data.id+'/attempt')).data.attempt;
    expect(draft.report.labId).toBe(labId);expect(draft.report.schemaVersion).toBe(2);expect(draft.report.status).toBe('In progress');expect(draft.report.student.name).not.toBe('Zoë García');
  }
  expect(errors).toEqual([]);await ownerContext.close();await teacherContext.close();await studentContext.close();
});
for(const width of [390,768,1440])test(`platform pages have keyboard access and no overflow at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});await page.emulateMedia({reducedMotion:'reduce'});
  await login(page,'owner@example.test','ScienceLabs!Local2026');
  for(const route of ['catalog','owner','history','licenses','billing']){
    await page.goto('/platform.html#/'+route);await expect(page.getByRole('heading',{name:({catalog:'Make the discovery yours.',owner:'Manage publishing',history:'Publishing history',licenses:'Pilot and school licenses',billing:'Workspace & billing'})[route],exact:true})).toBeVisible();await expect(page.locator('main')).not.toContainText('We could not open this page');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`tmp/platform-review/${route}-${width}.png`,fullPage:true});
  }
  await page.getByRole('link',{name:'Lab library',exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#\/catalog$/);
});
test('signup and password reset stay usable on a phone without sending real email',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/platform.html#/reset');await page.getByLabel('Email address',{exact:true}).fill('owner@example.test');await page.getByRole('button',{name:'Send reset email',exact:true}).click();await expect(page.locator('#notice')).toContainText('password-reset email');
  await page.goto('/platform.html#/signup');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:'tmp/platform-review/signup-phone.png',fullPage:true});
});
